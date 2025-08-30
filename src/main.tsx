// import { scan } from "react-scan";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./features/layout/App.tsx";
import "./globals.css";
import "./i18n/config";

// if (typeof window !== "undefined") {
//     console.log(scan);
//     scan({
//         enabled: true,
//         showToolbar: true,
//         dangerouslyForceRunInProduction: true,
//     });
// }

// biome-ignore lint/style/noNonNullAssertion: <explanation>
ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
