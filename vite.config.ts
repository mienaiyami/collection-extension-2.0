import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";
import { writeFileSync } from "fs";
import packageJson from "./package.json";

const isDev = process.env.NODE_ENV === "development";

const manifest: chrome.runtime.ManifestV3 = {
    manifest_version: 3,
    name: packageJson.productName,
    author: packageJson.author.name,
    homepage_url: packageJson.author.url,
    version: packageJson.version,
    description: packageJson.description,
    // background: {
    //     service_worker: "./background.js",
    // },
    action: {
        default_popup: "index.html",
    },
    permissions: ["tabs", "activeTab", "storage", "scripting", "webRequest"],
    host_permissions: ["<all_urls>"],
    icons: {
        16: "/icon16.png",
        32: "/icon32.png",
        48: "/icon48.png",
        128: "/icon128.png",
    },
};

const manifestPlugin = (): PluginOption => {
    return {
        name: "make-extension-manifest",
        buildEnd() {
            writeFileSync(
                path.join(path.resolve("./public"), "manifest.json"),
                JSON.stringify(manifest, null, "\t")
            );
        },
    };
};

export default defineConfig({
    plugins: [react(), manifestPlugin()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },

    build: {
        minify: !isDev,
    },
});
