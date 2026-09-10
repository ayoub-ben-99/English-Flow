import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // The Piper WASM glue code contains Node-only require("fs"/"path")
    // branches (Emscripten) that never run in the browser.
    resolveAlias: {
      fs: "./lib/empty.js",
      path: "./lib/empty.js",
    },
  },
};

export default nextConfig;
