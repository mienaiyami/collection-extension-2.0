import { access, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { type BrowserContext, type Locator, type Page, chromium } from "playwright";
import { type SeedStorage, buildSeedStorage } from "./seed";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Repo root (parent of `demo/`). */
export const REPO_ROOT = path.resolve(__dirname, "../../..");

/** Unpacked extension build directory. */
export const DIST_DIR = path.join(REPO_ROOT, "dist");

/** Screenshots / videos land here. */
export const OUTPUT_DIR = path.resolve(__dirname, "../../output");

/**
 * Matches `body` sizing in `src/globals.css`:
 * - popup: fixed 450×600
 * - side panel: fills the window (`body.sidePanel`)
 */
export const APP_VIEWPORTS = {
    popup: { width: 450, height: 600 },
    sidePanel: { width: 480, height: 900 },
} as const;

export type AppView = keyof typeof APP_VIEWPORTS;

type LaunchDemoOptions = {
    /** Folder name under `output/screenshots` and `output/video`. */
    tourId: string;
    view?: AppView;
    recordVideo?: boolean;
};

export type DemoSession = {
    context: BrowserContext;
    page: Page;
    extensionId: string;
    outputDir: string;
    tourId: string;
    view: AppView;
    viewport: { width: number; height: number };
    /**
     * Saves a PNG under `output/screenshots/<tourId>/`, then holds for video pacing.
     */
    shot: (name: string, holdMs?: number) => Promise<string>;
};

/**
 * Ensures `dist/manifest.json` exists before launching Chromium.
 *
 * @throws If the extension has not been built
 */
export const assertDistExists = async (): Promise<void> => {
    try {
        await access(path.join(DIST_DIR, "manifest.json"));
    } catch {
        throw new Error(
            `Missing ${DIST_DIR}. Build the extension first from the repo root:\n  pnpm build`
        );
    }
};

/**
 * Pause so the UI settles and video beats read clearly.
 */
export const pause = async (ms: number): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, ms));
};

/** Hold after a meaningful UI change (default beat for video). */
export const hold = async (ms = 1100): Promise<void> => pause(ms);

/**
 * Types into an input with human-ish delay so search filtering is visible on video.
 */
export const typeSlowly = async (locator: Locator, text: string, delayMs = 70): Promise<void> => {
    await locator.click();
    await locator.fill("");
    await locator.pressSequentially(text, { delay: delayMs });
};

/**
 * Clicks the row checkbox for a seeded collection.
 */
export const toggleCollectionCheckbox = async (page: Page, collectionId: string): Promise<void> => {
    await page.locator(`[data-collection-id="${collectionId}"] label`).click();
};

/**
 * Launches Chromium with the unpacked `dist` extension loaded.
 *
 * @throws If the service worker never appears
 */
export const launchExtensionContext = async (options: LaunchDemoOptions): Promise<DemoSession> => {
    const { tourId, recordVideo = true, view = "sidePanel" } = options;
    const viewport = APP_VIEWPORTS[view];
    const entryHtml = view === "sidePanel" ? "side_panel.html" : "index.html";

    const shotDir = path.join(OUTPUT_DIR, "screenshots", tourId);
    const videoDir = path.join(OUTPUT_DIR, "video", tourId);
    await mkdir(shotDir, { recursive: true });
    if (recordVideo) {
        await mkdir(videoDir, { recursive: true });
    }

    const context = await chromium.launchPersistentContext("", {
        channel: "chromium",
        headless: false,
        viewport,
        args: [
            `--disable-extensions-except=${DIST_DIR}`,
            `--load-extension=${DIST_DIR}`,
            "--no-first-run",
            "--no-default-browser-check",
            `--window-size=${viewport.width + 80},${viewport.height + 120}`,
        ],
        ...(recordVideo
            ? {
                  recordVideo: {
                      dir: videoDir,
                      size: viewport,
                  },
              }
            : {}),
    });

    let [worker] = context.serviceWorkers();
    if (!worker) {
        worker = await context.waitForEvent("serviceworker", { timeout: 30_000 });
    }

    const extensionId = new URL(worker.url()).host;
    if (!extensionId) {
        throw new Error("Could not resolve extension id from service worker URL");
    }

    await pause(900);
    await seedStorage(context, buildSeedStorage());
    await pause(400);

    for (const p of context.pages()) {
        const url = p.url();
        if (url.includes("CHANGELOG") || url.includes("github.com")) {
            await p.close().catch(() => undefined);
        }
    }

    const page = await context.newPage();
    await page.setViewportSize(viewport);
    await page.goto(`chrome-extension://${extensionId}/${entryHtml}`, {
        waitUntil: "domcontentloaded",
    });
    await page.getByText("Alpha Docs").waitFor({ state: "visible", timeout: 15_000 });
    await hold(800);

    const shot = async (name: string, holdMs = 1200): Promise<string> => {
        const filePath = path.join(shotDir, `${name}.png`);
        await page.screenshot({ path: filePath, type: "png" });
        await hold(holdMs);
        return filePath;
    };

    return {
        context,
        page,
        extensionId,
        outputDir: OUTPUT_DIR,
        tourId,
        view,
        viewport,
        shot,
    };
};

/**
 * Writes seed payload into the extension's `chrome.storage.local`.
 */
export const seedStorage = async (context: BrowserContext, seed: SeedStorage): Promise<void> => {
    let [worker] = context.serviceWorkers();
    if (!worker) {
        worker = await context.waitForEvent("serviceworker", { timeout: 15_000 });
    }

    await worker.evaluate(async (payload) => {
        const storage = (
            globalThis as unknown as {
                chrome: { storage: { local: { set: (items: typeof payload) => Promise<void> } } };
            }
        ).chrome.storage.local;
        await storage.set(payload);
    }, seed);
};

/**
 * Runs a named tour with shared launch/teardown and dist checks.
 */
export const runTour = async (
    tourId: string,
    body: (session: DemoSession) => Promise<void>,
    options: Omit<LaunchDemoOptions, "tourId"> = {}
): Promise<void> => {
    await assertDistExists();
    const session = await launchExtensionContext({ tourId, ...options });
    try {
        await body(session);
        console.log(
            `Tour "${tourId}" done (${session.view} ${session.viewport.width}×${session.viewport.height}).\nOutput:\n  ${session.outputDir}`
        );
    } finally {
        await session.context.close();
    }
};
