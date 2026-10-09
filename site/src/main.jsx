import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";

// The secure hub (and Firebase) loads only on sign-in and hub routes, including the /dashboard,
// /portal and retired /parent-hub and /admin addresses that redirect into it.
const HubApp = lazy(() => import("./hub/HubApp.jsx").then((module) => ({ default: module.HubApp })));
const isHubRoute = /^\/(sign-in|login|dashboard|portal|hub|parent-hub|admin)(\/|$)/.test(window.location.pathname);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isHubRoute ? <Suspense fallback={<div className="hub-loading">Loading…</div>}><HubApp /></Suspense> : <App />}
  </React.StrictMode>,
);
