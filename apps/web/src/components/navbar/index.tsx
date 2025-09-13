"use client";

import Link from "next/link";
import { Logo } from "./logo";
import { NavMenu } from "./nav-menu";
import { NavigationSheet } from "./navigation-sheet";
import { ThemeToggle } from "./theme-toggle";
import { ButtonPrimary } from "../ui/button-primary";
import { LogIn } from "lucide-react";

import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  const isSignIn = pathname === "/sign-in";

  return (
    <nav className="h-16">
      <div className="h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/">
            <div className="flex items-center gap-2">
              <Logo />
              <div className="text-sm font-black text-[#4a2e1a] dark:text-[#f8e9b0] leading-4">
                <h2>Hidden</h2>
                <h2>Jems</h2>
              </div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <NavMenu className="hidden md:block" />
        </div>

        <div className="flex items-center gap-3">
          {isSignIn ? (
            <ButtonPrimary
              asChild
              size={"sm"}
              className="hidden sm:inline-flex"
            >
              <Link href="/sign-up">Getting Started</Link>
            </ButtonPrimary>
          ) : (
            <ButtonPrimary
              asChild
              size={"sm"}
              tone={"outline"}
              className="hidden sm:inline-flex"
            >
              <Link href="/sign-in">
                <LogIn />
                Sign In
              </Link>
            </ButtonPrimary>
          )}
          <ThemeToggle />

          {/* Mobile Menu */}
          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
