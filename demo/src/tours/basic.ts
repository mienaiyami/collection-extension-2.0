/**
 * Short paced highlight reel (search / sort / deep match / items / settings).
 * Output: `demo/output/{screenshots,video}/basic/`
 */
import { hold, runTour, typeSlowly } from "../lib/launch";
import { DEEP_SEARCH_TOKEN, SEED_IDS } from "../lib/seed";

await runTour("basic", async ({ page, shot }) => {
    await shot("01-collection-list", 1400);

    const search = page.getByPlaceholder("Search collections…");
    await typeSlowly(search, "Zeta", 90);
    await page.getByText("Zeta Research").waitFor({ state: "visible" });
    await hold(900);
    await shot("02-search-title", 1300);

    await page.getByLabel("Clear search").click();
    await page.getByText("Alpha Docs").waitFor({ state: "visible" });
    await hold(700);

    await page.getByLabel("Toggle filters").click();
    await hold(800);
    await page.getByRole("radio", { name: "Name" }).click();
    await hold(1000);
    await shot("03-sort-by-name", 1400);

    await page.getByRole("radio", { name: "Item count" }).click();
    await hold(1100);
    await shot("04-sort-by-item-count", 1300);

    await page.getByRole("radio", { name: "Title + items" }).click();
    await hold(600);
    await typeSlowly(search, DEEP_SEARCH_TOKEN, 75);
    await page.getByText("Matched via items").waitFor({ state: "visible" });
    await hold(1000);
    await shot("05-deep-search-match", 1500);

    await page.getByLabel("Clear search").click();
    await page.getByRole("radio", { name: "Default" }).click();
    await hold(700);

    await page.locator(`[data-collection-id="${SEED_IDS.zetaResearch}"]`).click();
    await page.getByText("Paper A (newer)").waitFor({ state: "visible" });
    await hold(1000);
    await shot("06-collection-items", 1500);

    const itemSearch = page.getByPlaceholder("Search items…");
    await typeSlowly(itemSearch, "Paper A", 80);
    await hold(900);
    await shot("07-item-search", 1300);

    await page.getByLabel("Clear search").click();
    await hold(500);

    await page.locator("button:has(svg.lucide-chevron-left)").click();
    await page.getByText("Shopping List").waitFor({ state: "visible" });
    await hold(800);

    await page.locator("button:has(svg.lucide-settings)").click();
    await page.getByText("Language").waitFor({ state: "visible" });
    await hold(900);
    await shot("08-settings", 1500);

    await hold(600);
});
