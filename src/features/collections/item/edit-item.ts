/**
 * Max length for stored image data URLs (upload). Larger files bloat extension
 * storage and Google Drive sync — reject before persisting.
 */
export const MAX_ITEM_IMAGE_DATA_URL_LENGTH = 400_000;

/**
 * Schemes allowed for remote/extension cover images (not `data:` — handled separately).
 * Allowlist avoids incomplete blocklists (`javascript:` / `vbscript:` / executable `data:`).
 */
const SAFE_ITEM_IMAGE_PROTOCOLS = new Set([
    "http:",
    "https:",
    "chrome-extension:",
    "moz-extension:",
    "safari-web-extension:",
    "edge-extension:",
]);

/**
 * Parses and normalizes a page URL for a collection item.
 * Only `http:` / `https:` are accepted so saved links stay safe to open in tabs.
 * Returns `null` when the string is empty, not absolute, or not http(s).
 */
export const parseItemUrl = (raw: string): string | null => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    try {
        const url = new URL(trimmed);
        if (url.protocol !== "http:" && url.protocol !== "https:") return null;
        return url.toString();
    } catch {
        return null;
    }
};

/**
 * Returns a cover image URL safe to assign to `<img src>`, or `null` if unsafe/empty.
 * Allows size-capped `data:image/…` uploads and {@link SAFE_ITEM_IMAGE_PROTOCOLS}.
 */
export const getSafeItemImageSrc = (raw: string): string | null => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("data:image/")) {
        return trimmed.length <= MAX_ITEM_IMAGE_DATA_URL_LENGTH ? trimmed : null;
    }
    try {
        const url = new URL(trimmed);
        if (!SAFE_ITEM_IMAGE_PROTOCOLS.has(url.protocol)) return null;
        return url.toString();
    } catch {
        return null;
    }
};

/**
 * Whether an image field value may be saved: empty (clear) or {@link getSafeItemImageSrc}.
 */
export const isValidItemImageSrc = (raw: string): boolean => {
    if (!raw.trim()) return true;
    return getSafeItemImageSrc(raw) !== null;
};

/**
 * First image {@link File} from clipboard/drag {@link DataTransfer}, if any.
 */
export const getImageFileFromDataTransfer = (
    data: DataTransfer | null | undefined
): File | null => {
    if (!data) return null;
    for (const item of Array.from(data.items)) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
            return item.getAsFile();
        }
    }
    for (const file of Array.from(data.files)) {
        if (file.type.startsWith("image/")) return file;
    }
    return null;
};

/**
 * Reads a local image file as a data URL for item cover storage.
 *
 * @returns data URL string, or `null` if the file is missing / not an image / too large
 */
export const readImageFileAsDataUrl = (file: File): Promise<string | null> =>
    new Promise((resolve) => {
        if (!file.type.startsWith("image/")) {
            resolve(null);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            if (typeof result !== "string" || !result.startsWith("data:image/")) {
                resolve(null);
                return;
            }
            if (result.length > MAX_ITEM_IMAGE_DATA_URL_LENGTH) {
                resolve(null);
                return;
            }
            resolve(result);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
    });
