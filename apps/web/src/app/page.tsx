"use client";

import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <main>
      <div className="min-h-screen w-full relative">
        <div
          className="absolute inset-0 z-0 pointer-events-none [--grid-color:#e2e8f0] dark:[--grid-color:#222333]"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
              linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)
            `,
            backgroundSize: "20px 30px",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
          }}
        />
        {/* Your Content/Components */}
        <div className="relative z-10 max-w-(--breakpoint-lg) mx-auto px-4 sm:px-6 lg:px-8">
          <Navbar />
        </div>
      </div>
    </main>
  );
}
