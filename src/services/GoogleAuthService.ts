import { isBackgroundScript } from "@/utils";
import browser from "webextension-polyfill";

const CLIENT_ID = "309178204165-spf4df9t9l6dlnoo24dkva268jnvfhg7.apps.googleusercontent.com";
const SCOPES = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.appdata",
];

if (!isBackgroundScript()) {
    throw new Error("This file should not be imported in frontend code");
}

export class GoogleAuthService {
    private static async getAuthToken(): Promise<string> {
        const redirectURL = browser.identity.getRedirectURL();
        const authURL = new URL("https://accounts.google.com/o/oauth2/v2/auth");

        authURL.searchParams.append("client_id", CLIENT_ID);
        authURL.searchParams.append("response_type", "token");
        authURL.searchParams.append("redirect_uri", redirectURL);
        authURL.searchParams.append("scope", SCOPES.join(" "));

        try {
            const responseUrl = await browser.identity.launchWebAuthFlow({
                interactive: true,
                url: authURL.toString(),
            });

            const url = new URL(responseUrl);
            const hash = url.hash.substring(1);
            const params = new URLSearchParams(hash);
            const accessToken = params.get("access_token");

            if (!accessToken) {
                throw new Error("No access token found in response");
            }

            return accessToken;
        } catch (error) {
            console.error("Auth error:", error);
            throw new Error("Failed to authenticate with Google");
        }
    }

    static async getValidToken(): Promise<string> {
        let token = await browser.storage.local
            .get("googleAuthToken")
            .then((data) => data.googleAuthToken);

        if (!token || typeof token !== "string") {
            token = await this.getAuthToken();
            await browser.storage.local.set({ googleAuthToken: token });
        }
        return String(token);
    }

    static async isLoggedIn(): Promise<boolean> {
        const token = await browser.storage.local
            .get("googleAuthToken")
            .then((data) => data.googleAuthToken);
        return !!token;
    }

    static async logout(): Promise<void> {
        await browser.storage.local.remove("googleAuthToken");
    }
}
