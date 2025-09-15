import { Metadata } from "next";
import Navbar from "@/components/navbar";
import FooterSimple from "@/components/common/footer-simple";

export const metadata: Metadata = {
  title: "Authentication | Holobiont",
  description: "Sign in or sign up to Holobiont",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <div className="min-h-screen w-full relative">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 pointer-events-none [--grid-color:#e2e8f0] dark:[--grid-color:#222333]"
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
        <div className="relative z-10 max-w-(--breakpoint-lg) mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            {children}
          </div>
          <FooterSimple />
        </div>
      </div>
    </main>
  );
}
