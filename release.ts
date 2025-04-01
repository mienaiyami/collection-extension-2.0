import readline from "readline";
import { exec } from "child_process";
import pkgJSON from "./package.json";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const log = (...args: string[]) => {
    console.log(`[${new Date().toISOString()}] ${args.join(" ")}`);
};

const tagAndPush = (): Promise<void> =>
    new Promise((resolve) => {
        log(`Tagging v${pkgJSON.version} and pushing tags.`);
        const push = () => {
            const gitSpawn = exec(`git push --tags`);
            gitSpawn.stderr?.on("data", (data) => {
                process.stdout.write(`\x1b[91m${data}\x1b[0m`);
            });
            gitSpawn.on("close", (code) => {
                log(`push tags: exited with code ${code}.`);
                if (code === 1) process.exit(1);
                resolve();
            });
        };
        const gitSpawn = exec(`git tag -a v${pkgJSON.version} -m"v${pkgJSON.version}"`);
        gitSpawn.stderr?.on("data", (data) => {
            process.stdout.write(`\x1b[91m${data}\x1b[0m`);
        });
        gitSpawn.on("close", (code) => {
            log(`git tag: exited with code ${code}.`);
            if (code === 1) process.exit(1);
            push();
        });
    });

const signFireFoxAddon = (): Promise<void> =>
    new Promise((resolve) => {
        log("Signing Firefox add-on...");
        const pwshSpawn = exec(
            "cd ./dist && web-ext sign --channel=listed " +
                `--api-key=${process.env.AMO_JWT_ISSUER} ` +
                `--api-secret=${process.env.AMO_JWT_SECRET}`
        );

        pwshSpawn.stdout?.on("data", (data) => {
            process.stdout.write(data);
        });

        pwshSpawn.stderr?.on("data", (data) => {
            process.stdout.write(`\x1b[91m${data}\x1b[0m`);
        });

        pwshSpawn.on("close", (code) => {
            log(`sign addon: exited with code ${code}.`);
            if (code === 1) process.exit(1);
            resolve();
        });
    });

const publishChromeExtension = async (): Promise<void> => {
    log("Publishing Chrome extension...");
    // throw new Error("untested");
    try {
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                client_id: process.env.CHROME_CLIENT_ID,
                client_secret: process.env.CHROME_CLIENT_SECRET,
                refresh_token: process.env.CHROME_REFRESH_TOKEN,
                grant_type: "refresh_token",
            }),
        });
        if (!tokenResponse.ok) {
            throw new Error(`Token request failed: ${await tokenResponse.text()}`);
        }
        const response = await tokenResponse.json();
        const access_token = response.access_token;
        if (!access_token) {
            throw new Error("Access token not found in response");
        }

        const zipFile = fs.readFileSync("./build.zip");
        const uploadResponse = await fetch(
            `https://www.googleapis.com/upload/chromewebstore/v1.1/items/${process.env.CHROME_EXTENSION_ID}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    "x-goog-api-version": "2",
                },
                body: zipFile,
            }
        );

        if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${await uploadResponse.text()}`);
        }

        const publishResponse = await fetch(
            `https://www.googleapis.com/chromewebstore/v1.1/items/${process.env.CHROME_EXTENSION_ID}/publish`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    "x-goog-api-version": "2",
                    "Content-Length": "0",
                },
            }
        );

        if (!publishResponse.ok) {
            throw new Error(`Publish failed: ${await publishResponse.text()}`);
        }

        log("Chrome extension published successfully!");
    } catch (e) {
        console.error("\x1b[91mChrome publish error:", e, "\x1b[0m");
        process.exit(1);
    }
};

const requiredEnvVars = [
    process.env.CHROME_CLIENT_ID,
    process.env.CHROME_CLIENT_SECRET,
    process.env.CHROME_REFRESH_TOKEN,
    process.env.CHROME_EXTENSION_ID,
];
if (requiredEnvVars.some((v) => !v)) {
    throw new Error("Missing required env variables for Chrome extension publish");
}
const fireFoxEnvVars = [process.env.AMO_JWT_ISSUER, process.env.AMO_JWT_SECRET];
if (fireFoxEnvVars.some((v) => !v)) {
    throw new Error("Missing required env variables for Firefox extension publish");
}

rl.question(
    "\x1b[91mMake sure to edit and commit package.json with version change before starting.\x1b[0m",
    async (e) => {
        if (e === "") {
            // await tagAndPush();
            log("--------------------");
            await signFireFoxAddon();
            log("--------------------");
            await publishChromeExtension();
        }
        rl.close();
    }
);
