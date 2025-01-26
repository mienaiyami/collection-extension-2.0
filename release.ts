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

const tagAndPush = () => {
    console.log(`Tagging v${pkgJSON.version} and pushing tags.`);
    const push = () => {
        const gitSpawn = exec(`git push --tags`);
        gitSpawn.stderr?.on("data", (data) => {
            process.stdout.write(`\x1b[91m${data}\x1b[0m`);
        });
        gitSpawn.on("close", (code) => {
            console.log(`push tags: exited with code ${code}.`);
        });
    };
    const gitSpawn = exec(`git tag -a v${pkgJSON.version} -m"v${pkgJSON.version}"`);
    gitSpawn.stderr?.on("data", (data) => {
        process.stdout.write(`\x1b[91m${data}\x1b[0m`);
    });
    gitSpawn.on("close", (code) => {
        console.log(`git tag: exited with code ${code}.`);
        push();
    });
};

const signFireFoxAddon = () => {
    console.log("Signing Firefox add-on...");
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
        console.log(`sign addon: exited with code ${code}.`);
    });
};

const publishChromeExtension = async () => {
    console.log("Publishing Chrome extension...");
    throw new Error("untested");

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

    const { access_token } = await tokenResponse.json();

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

    console.log("Chrome extension published successfully!");
};

rl.question(
    "\x1b[91mMake sure to edit and commit package.json with version change before starting.\x1b[0m",
    async (e) => {
        if (e === "") {
            tagAndPush();
            signFireFoxAddon();
            // try {
            //     await publishChromeExtension();
            // } catch (error) {
            //     console.error("\x1b[91mChrome publish error:", error, "\x1b[0m");
            // }
        }
        rl.close();
    }
);
