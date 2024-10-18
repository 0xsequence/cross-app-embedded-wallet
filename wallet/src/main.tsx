import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import { App } from "./App.tsx";

const favicon = document.getElementById("favicon");
const appTitle = document.getElementById("app-title");
const projectName = import.meta.env.VITE_PROJECT_NAME;
const smallLogo = import.meta.env.VITE_PROJECT_SMALL_LOGO;
if (favicon && smallLogo) {
  favicon.href = smallLogo;
}
if (appTitle && projectName) {
  appTitle.textContent = projectName + " " + "Wallet";
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
