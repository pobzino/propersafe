import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: resolve("."),
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          destination: "/landing.html",
        },
        {
          source: "/risk-calculator",
          destination: "/risk-calculator.html",
        },
        {
          source: "/enquire",
          destination: "/enquire.html",
        },
      ],
    };
  },
};

export default nextConfig;
