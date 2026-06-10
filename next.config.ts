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
          destination: "/triage.html",
        },
        {
          source: "/risk-analysis",
          destination: "/triage.html",
        },
        {
          source: "/enquire",
          destination: "/enquire.html",
        },
        {
          source: "/sample-report",
          destination: "/sample-report.html",
        },
      ],
    };
  },
};

export default nextConfig;
