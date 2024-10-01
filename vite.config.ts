import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";
import { writeFileSync } from "fs";
import packageJson from "./package.json";

const isDev = process.env.NODE_ENV === "development";

const manifest: chrome.runtime.ManifestV3 & {
    // to support firefox
    background: {
        scripts: string[];
    };
} = {
    manifest_version: 3,
    name: packageJson.productName,
    author: packageJson.author.name,
    homepage_url: packageJson.author.url,
    version: packageJson.version,
    description: packageJson.description,
    background: {
        service_worker: "background.js",
        scripts: ["background.js"],
        type: "module",
    },
    // content_scripts: [
    //     {
    //         matches: ["<all_urls>"],
    //         js: ["content.js"],
    //     },
    // ],
    action: {
        default_popup: "index.html",
    },
    side_panel: {
        default_path: "side_panel.html",
    },
    //firefox support
    sidebar_action: {
        default_panel: "side_panel.html",
        default_title: "Collections",
    },
    permissions: [
        "tabs",
        "activeTab",
        "storage",
        "scripting",
        "unlimitedStorage",
        "alarms",
        "sidePanel",
    ],
    commands: {
        "add-current-tab-to-active-collection": {
            suggested_key: {
                default: "Ctrl+Shift+A",
            },
            description:
                "Add current tab to active/opened collection in side panel",
        },
        _execute_sidebar_action: {
            suggested_key: {
                default: "Ctrl+Shift+Y",
            },
            description: "Open side panel",
        },
    },
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
        rollupOptions: {
            input: {
                index: path.resolve(__dirname, "./index.html"),
                side_panel: path.resolve(__dirname, "./side_panel.html"),
                background: path.resolve(__dirname, "./src/background.ts"),
                content: path.resolve(__dirname, "./src/content.ts"),
            },
            output: {
                entryFileNames: (asset) => {
                    if (["background", "content"].includes(asset.name))
                        return `[name].js`;
                    return `assets/[name]-[hash].js`;
                },
            },
        },
    },
});
