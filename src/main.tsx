// import { scan } from "react-scan";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// if (typeof window !== "undefined") {
//     console.log(scan);
//     scan({
//         enabled: true,
//         showToolbar: true,
//         dangerouslyForceRunInProduction: true,
//     });
// }

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
