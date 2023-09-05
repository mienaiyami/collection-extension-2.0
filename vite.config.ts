import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

const isDev = process.env.NODE_ENV === "development";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        minify: !isDev,
    },
});
