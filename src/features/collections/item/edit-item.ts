/**
 * Max length for stored image data URLs (upload). Larger files bloat extension
 * storage and Google Drive sync — reject before persisting.
 */
export const MAX_ITEM_IMAGE_DATA_URL_LENGTH = 400_000;

/**
 * Parses and normalizes a page URL for a collection item.
 * Returns `null` when the string is not a valid absolute URL.
 */
export const parseItemUrl = (raw: string): string | null => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    try {
        return new URL(trimmed).toString();
    } catch {
        return null;
    }
};

/**
 * Validates an image source: empty (cleared), `data:image/…` under size limit,
 * or any non-`javascript:` absolute URL (includes `http(s)` and browser favicon schemes).
 */
export const isValidItemImageSrc = (raw: string): boolean => {
    const trimmed = raw.trim();
    if (!trimmed) return true;
    if (trimmed.startsWith("data:image/")) {
        return trimmed.length <= MAX_ITEM_IMAGE_DATA_URL_LENGTH;
    }
    if (trimmed.startsWith("data:")) return false;
    try {
        const url = new URL(trimmed);
        return url.protocol !== "javascript:";
    } catch {
        return false;
    }
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
