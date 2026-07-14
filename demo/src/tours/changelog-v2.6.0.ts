/**
 * Full v2.6.0 changelog walk — search/sort, multi-select, open-many warning,
 * remove duplicates, edit item, language, auto-remove duplicates setting.
 * Output: `demo/output/{screenshots,video}/changelog-v2.6.0/`
 */
import { hold, pause, runTour, toggleCollectionCheckbox, typeSlowly } from "../lib/launch";
import { DEEP_SEARCH_TOKEN, SEED_IDS } from "../lib/seed";

await runTour("changelog-v2.6.0", async ({ page, shot }) => {
    /* —— Overview —— */
    await shot("01-list-overview", 1600);

    /* —— Search & sort (list) —— */
    const listSearch = page.getByPlaceholder("Search collections…");
    await typeSlowly(listSearch, "Design", 85);
    await page.getByText("Gamma Design").waitFor({ state: "visible" });
    await hold(1000);
    await shot("02-search-title", 1400);

    await page.getByLabel("Clear search").click();
    await hold(600);

    await page.getByLabel("Toggle filters").click();
    await hold(900);
    await shot("03-filters-open", 1200);

    await page.getByRole("radio", { name: "Name" }).click();
    await hold(1100);
    await shot("04-sort-name", 1400);

    await page.getByLabel("Toggle sort direction").click();
    await hold(1100);
    await shot("05-sort-name-desc", 1400);

    await page.getByRole("radio", { name: "Item count" }).click();
    await hold(1100);
    await shot("06-sort-item-count", 1300);

    await page.getByRole("radio", { name: "Modified" }).click();
    await hold(1000);
    await page.getByRole("radio", { name: "Date" }).click();
    await hold(1000);
    await shot("07-sort-date", 1200);

    /* —— Deep search —— */
    await page.getByRole("radio", { name: "Title + items" }).click();
    await hold(700);
    await typeSlowly(listSearch, DEEP_SEARCH_TOKEN, 70);
    await page.getByText("Matched via items").waitFor({ state: "visible" });
    await hold(1200);
    await shot("08-deep-search", 1600);

    /* —— Session search survives open/back —— */
    await page.locator(`[data-collection-id="${SEED_IDS.zetaResearch}"]`).click();
    await page.getByText("Paper A (newer)").waitFor({ state: "visible" });
    await hold(900);
    await page.locator("button:has(svg.lucide-chevron-left)").click();
    await page.getByPlaceholder("Search collections…").waitFor({ state: "visible" });
    await page.getByText("Matched via items").waitFor({ state: "visible" });
    await hold(1000);
    await shot("09-search-persists-after-back", 1500);

    await page.getByLabel("Clear search").click();
    await page.getByRole("radio", { name: "Default" }).click();
    await hold(800);

    /* —— Multi-select —— */
    await toggleCollectionCheckbox(page, SEED_IDS.alphaDocs);
    await hold(500);
    await toggleCollectionCheckbox(page, SEED_IDS.betaTools);
    await hold(700);
    await page.getByText("2 selected").waitFor({ state: "visible" });
    await shot("10-multi-select", 1500);

    await page.keyboard.down("Shift");
    await toggleCollectionCheckbox(page, SEED_IDS.gammaDesign);
    await page.keyboard.up("Shift");
    await hold(900);
    await shot("11-shift-range-select", 1500);

    await page.keyboard.press("Control+a");
    await hold(1000);
    await shot("12-select-all-visible", 1400);

    await page.getByRole("button", { name: "More actions" }).click();
    await page.getByRole("menuitem", { name: "Copy Data" }).waitFor({ state: "visible" });
    await hold(800);
    await shot("13-batch-overflow-menu", 1400);
    await page.keyboard.press("Escape");
    await hold(400);

    /* Escape clears multi-select without hitting the top-bar close button. */
    await page.locator("body").click({ position: { x: 8, y: 200 } });
    await page.keyboard.press("Escape");
    await hold(600);

    /* —— Open-many warning (≥20 links) —— */
    await toggleCollectionCheckbox(page, SEED_IDS.bulkLinks);
    await hold(700);
    await page.getByRole("button", { name: "Open" }).click();
    await page.getByText("Open many links?").waitFor({ state: "visible" });
    await hold(1200);
    await shot("14-open-many-warning", 1800);
    await page.getByRole("button", { name: "Cancel" }).click();
    await hold(600);
    await page.keyboard.press("Escape");
    await hold(500);

    /* —— Remove duplicates —— */
    await toggleCollectionCheckbox(page, SEED_IDS.zetaResearch);
    await hold(500);
    await page.getByRole("button", { name: "More actions" }).click();
    await page.getByRole("menuitem", { name: "Remove duplicates" }).click();
    await page.getByText("Remove duplicates?").waitFor({ state: "visible" });
    await hold(1100);
    await shot("15-remove-duplicates-choose", 1600);

    await page.getByRole("button", { name: "Keep most recent" }).click();
    await page.getByText("Confirm remove duplicates").waitFor({ state: "visible" });
    await hold(1100);
    await shot("16-remove-duplicates-confirm", 1600);
    await page.getByRole("button", { name: "Cancel" }).click();
    await hold(500);
    await page.keyboard.press("Escape");
    await hold(500);

    /* —— Inside collection: item search / sort / edit —— */
    await page.locator(`[data-collection-id="${SEED_IDS.zetaResearch}"]`).click();
    await page.getByText("Paper A (newer)").waitFor({ state: "visible" });
    await hold(1000);
    await shot("17-collection-items", 1500);

    await page.getByLabel("Toggle filters").click();
    await hold(700);
    await page.getByRole("radio", { name: "Name" }).click();
    await hold(1000);
    await shot("18-item-sort-name", 1300);

    const itemSearch = page.getByPlaceholder("Search items…");
    await typeSlowly(itemSearch, "Paper", 80);
    await hold(1000);
    await shot("19-item-search", 1400);
    await page.getByLabel("Clear search").click();
    await hold(500);

    await page.locator("[data-url-id]").filter({ hasText: "Methodology Draft" }).click({
        button: "right",
    });
    await page.getByRole("menuitem", { name: "Edit" }).waitFor({ state: "visible" });
    await hold(800);
    await shot("20-item-context-menu", 1400);
    await page.getByRole("menuitem", { name: "Edit" }).click();
    await page.getByRole("heading", { name: "Edit" }).waitFor({ state: "visible" });
    await hold(900);
    await shot("21-edit-item-dialog", 1600);

    await page.locator("#edit-item-title").fill("Methodology Draft (edited)");
    await hold(800);
    await shot("22-edit-item-title", 1300);
    await page.getByRole("button", { name: "Cancel" }).click();
    await hold(600);

    await page.locator("button:has(svg.lucide-chevron-left)").click();
    await page.getByText("Bulk Links").waitFor({ state: "visible" });
    await hold(700);

    /* —— Settings: language + auto-remove duplicates —— */
    await page.locator("button:has(svg.lucide-settings)").click();
    await page.getByText("Language").waitFor({ state: "visible" });
    await hold(900);
    await shot("23-settings", 1400);

    await page.getByRole("button", { name: "English" }).click();
    await page.getByText("Français").waitFor({ state: "visible" });
    await hold(600);
    await page.getByText("Français").click();
    await hold(1200);
    await shot("24-language-french", 1600);

    await page.getByRole("button", { name: "Français" }).click();
    await page.getByRole("menuitem").filter({ hasText: "English" }).click();
    await hold(900);

    await page.getByText("Auto-remove older duplicate URLs").scrollIntoViewIfNeeded();
    await hold(700);
    await page.locator("#auto-remove-dups").click();
    await hold(1000);
    await shot("25-auto-remove-duplicates", 1600);

    await pause(800);
});
