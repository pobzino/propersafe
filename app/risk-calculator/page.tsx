"use client";

import { useEffect } from "react";

export default function RiskCalculatorPage() {
  useEffect(() => {
    // Since we have the static HTML in public/risk-calculator.html,
    // we can just redirect to it, or Next.js might serve it automatically
    // if we haven't broken the public folder mapping.
    // However, the cleanest way to support /risk-calculator without extension
    // in a way that always works is this page.
    window.location.href = "/risk-calculator.html";
  }, []);

  return (
    <div style={{ 
      background: "#0F0E0A", 
      height: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      color: "#F0EBE0",
      fontFamily: "system-ui, sans-serif"
    }}>
      <p>Loading Risk Assessment...</p>
    </div>
  );
}
