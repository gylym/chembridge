import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ChemBridgeApp, { type View } from "../app/ChemBridgeApp";
import "../app/globals.css";

const route = window.location.pathname.replace(/^\/chembridge\/?/, "/").replace(/\/$/, "") || "/";
const routeViews: Record<string, View> = {
  "/": "home",
  "/dashboard": "dashboard",
  "/lessons": "world",
  "/periodic": "periodic",
  "/reactions": "reactions",
  "/laboratory": "laboratory",
  "/quizzes": "quizzes",
  "/videos": "videos",
  "/syllabuses": "syllabuses",
  "/feedback": "feedback",
  "/profile": "profile",
  "/admin": "admin",
};
const initialAuthMode = route === "/register" ? "register" : "login";
const initialView = route === "/login" || route === "/register" ? "auth" : (routeViews[route] ?? "home");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChemBridgeApp initialView={initialView} initialAuthMode={initialAuthMode} />
  </StrictMode>,
);
