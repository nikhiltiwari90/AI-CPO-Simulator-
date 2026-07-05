import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ─────────────────────────────────────────────────────────────
// AI CPO Simulator — Vite Config
// Author: Nikhil Tiwari
//
// NOTE ON API CALLS:
// The Anthropic API does not support direct browser → API calls
// in a deployed environment due to CORS policy. This config is
// set up for local development. For production deployment, route
// API calls through a serverless function (see docs/AgentDesign.md
// for a sample Vercel Edge Function proxy implementation).
// ─────────────────────────────────────────────────────────────

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
