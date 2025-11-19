import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import ConvexClientProvider from "@/components/providers/convex-providers";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Holobiont | Home",
  description: "Empowering your WHY — with soulful AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="id" suppressHydrationWarning>
        <body className={cn(inter.className)}>
          <ThemeProvider attribute={"class"} defaultTheme="system" enableSystem>
            <ConvexClientProvider>
              <NuqsAdapter>{children}</NuqsAdapter>
            </ConvexClientProvider>
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
