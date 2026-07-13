/**
 * Opening this many tabs/windows at once often lags or crashes Chromium-based browsers.
 * Below this count, open without prompting.
 */
export const LARGE_OPEN_URL_THRESHOLD = 20;

/** Whether the open-many warning dialog should be shown for this URL count. */
export const shouldWarnBeforeOpenMany = (urlCount: number): boolean =>
    urlCount >= LARGE_OPEN_URL_THRESHOLD;
