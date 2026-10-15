import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { CookiePreferencesProvider } from "./components/CookiePreferences.jsx";
import "./styles.css";
import "./components/hero-video.css";
import "./components/hero-photo.css";
import "./components/home-polish.css";
import "./components/outcome-tabs.css";
import "./components/values-garden.css";
import "./components/academic-overview.css";
import "./components/cookie-preferences.css";
import "./components/school-moments.css";
import "./components/assembly-polish.css";
import "./components/about-polish.css";
import "./components/landing-brand.css";
import "./components/our-people.css";

// The secure hub (and Firebase) loads only on sign-in and hub routes, including the /dashboard,
// /portal and retired /parent-hub and /admin addresses that redirect into it.
const HubApp = lazy(() => import("./hub/HubApp.jsx").then((module) => ({ default: module.HubApp })));
const isHubRoute = /^\/(sign-in|login|dashboard|portal|hub|parent-hub|admin)(\/|$)/.test(window.location.pathname);

const root = import.meta.hot?.data.root || createRoot(document.getElementById("root"));
if (import.meta.hot) import.meta.hot.dispose((data) => { data.root = root; });
root.render(
  <React.StrictMode>
    <CookiePreferencesProvider>{isHubRoute ? <Suspense fallback={<div className="hub-loading">Loading…</div>}><HubApp /></Suspense> : <App />}</CookiePreferencesProvider>
  </React.StrictMode>,
);
