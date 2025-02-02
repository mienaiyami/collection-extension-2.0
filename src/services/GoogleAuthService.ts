import { backgroundOnlyCode } from "@/utils";
import browser from "webextension-polyfill";

backgroundOnlyCode();

const CLIENT_ID = "309178204165-spf4df9t9l6dlnoo24dkva268jnvfhg7.apps.googleusercontent.com";
const WORKER_URL = "https://collection-extension-gdrive-auth.mienaiyami.workers.dev";
const SCOPES = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.appdata",
];

export class GoogleAuthService {
    private static async generatePKCE() {
        const base64URLEncode = (buffer: Uint8Array): string => {
            return btoa(String.fromCharCode(...buffer))
                .replace(/\+/g, "-")
                .replace(/\//g, "_")
                .replace(/=+$/, "");
        };
        const verifier = base64URLEncode(crypto.getRandomValues(new Uint8Array(32)));
        const challenge = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
        const challengeBase64 = base64URLEncode(new Uint8Array(challenge));
        return { verifier, challenge: challengeBase64 };
    }
    private static async getAccessToken(signal?: AbortSignal): Promise<string> {
        const redirectURL = browser.identity.getRedirectURL();
        const { verifier, challenge } = await this.generatePKCE();
        const authURL = new URL("https://accounts.google.com/o/oauth2/v2/auth");

        authURL.searchParams.append("client_id", CLIENT_ID);
        authURL.searchParams.append("response_type", "code");
        authURL.searchParams.append("redirect_uri", redirectURL);
        authURL.searchParams.append("scope", SCOPES.join(" "));
        authURL.searchParams.append("code_challenge", challenge);
        authURL.searchParams.append("code_challenge_method", "S256");
        authURL.searchParams.append("access_type", "offline");
        authURL.searchParams.append("prompt", "consent");
        if (signal?.aborted) throw new Error(signal.reason);
        try {
            const responseUrl = await browser.identity.launchWebAuthFlow({
                interactive: true,
                url: authURL.toString(),
            });

            const url = new URL(responseUrl);
            const params = new URLSearchParams(url.search);
            console.log("Google auth response:");
            console.log([...params.entries()]);

            const code = params.get("code");
            if (!code) throw new Error("No authorization code found");

            const tokenResponse = await fetch(`${WORKER_URL}/token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code,
                    code_verifier: verifier,
                    redirect_uri: redirectURL,
                }),
                signal,
            });
            if (!tokenResponse.ok)
                throw new Error(`Failed to get access token: ${await tokenResponse.text()}`);
            const tokenData = await tokenResponse.json();
            if (!tokenData.access_token) throw new Error("No access token received");
            if (!tokenData.refresh_token) throw new Error("No refresh token received");
            await browser.storage.local.set({
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                tokenExpiry: Date.now() + tokenData.expires_in * 1000,
            });

            return tokenData.access_token;
        } catch (error) {
            console.error("Auth error:", error);
            throw new Error("Failed to authenticate with Google");
        }
    }

    static async refreshToken(refreshToken: string, signal?: AbortSignal): Promise<string> {
        try {
            const tokenResponse = await fetch(`${WORKER_URL}/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    refresh_token: refreshToken,
                }),
                signal,
            });
            if (!tokenResponse.ok) {
                throw new Error(`Failed to get access token: ${await tokenResponse.text()}`);
            }
            const tokenData = await tokenResponse.json();
            if (!tokenData.access_token) throw new Error("No access token received");
            console.log("Refreshed token:", tokenData);
            await browser.storage.local.set({
                accessToken: tokenData.access_token,
                tokenExpiry: Date.now() + tokenData.expires_in * 1000,
            });

            return tokenData.access_token;
        } catch (error) {
            console.error(error);
            if (error instanceof Error) {
                if (error.message.includes("invalid_grant")) {
                    console.log("Invalid refresh token. Logging out.");
                    this.logout();
                }
            }
            throw error;
        }
    }
    static async getUserInfo(): Promise<GoogleDriveUserData | undefined> {
        if (!navigator.onLine) throw new Error("No internet connection");
        try {
            const token = await this.getValidToken(false);
            const response = await fetch(
                "https://www.googleapis.com/drive/v3/about/?fields=user(displayName,emailAddress,photoLink)",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!response.ok) {
                console.error(response);
                console.error(await response.text());
                return;
            }
            const data = await response.json();
            console.log("User info:", data);
            return {
                displayName: data.user.displayName,
                email: data.user.emailAddress,
                imageUrl: data.user.photoLink,
            };
        } catch (error) {
            console.error("Failed to get user info", error);
            return;
        }
    }
    static async getValidToken(logInIfInvalid = true, signal?: AbortSignal): Promise<string> {
        const { accessToken, tokenExpiry, refreshToken } = (await browser.storage.local.get([
            "accessToken",
            "tokenExpiry",
            "refreshToken",
        ])) as {
            accessToken: string;
            tokenExpiry: number;
            refreshToken: string;
        };
        if (!accessToken || !tokenExpiry || !refreshToken) {
            console.log("Not logged in with Google");
            if (logInIfInvalid) {
                return this.getAccessToken(signal);
            }
            throw new Error("Not logged in with Google");
        }
        // refresh token 5 minutes before expiry to prevent mid sync issues.
        if (tokenExpiry < Date.now() + 1000 * 60 * 5) {
            console.log("Access token expired. Refreshing token.");
            return this.refreshToken(refreshToken, signal);
        }

        return accessToken;
    }
    /** wont check for expired token, call `getValidToken` to check+renew token if expired. */
    static async isLoggedIn(): Promise<boolean> {
        if (!navigator.onLine) throw new Error("No internet connection");
        const { accessToken, refreshToken } = await browser.storage.local.get([
            "accessToken",
            "refreshToken",
        ]);
        return !!(accessToken && refreshToken);
    }

    static async logout(): Promise<void> {
        const { refreshToken } = (await browser.storage.local.get("refreshToken")) as {
            refreshToken: string;
        };
        await browser.storage.local.remove([
            "accessToken",
            "tokenExpiry",
            "refreshToken",
            "syncState",
        ]);
        if (!refreshToken) {
            console.log("Not logged in with Google");
            return;
        }
        await fetch("https://accounts.google.com/o/oauth2/revoke?token=" + refreshToken);
        console.log("Logged out from Google");
    }
}
