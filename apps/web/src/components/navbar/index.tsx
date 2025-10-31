"use client";

import Link from "next/link";
import { Logo2 } from "./logo2";
import { NavMenu } from "./nav-menu";
import { NavigationSheet } from "./navigation-sheet";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ButtonPrimary } from "../ui/button-primary";
import { Badge } from "../ui/badge";
import { LogIn } from "lucide-react";
import { usePathname, useParams } from "next/navigation";
import { useTranslations } from "@/hooks/use-translations";
import { useUser, UserButton } from "@clerk/nextjs";
import { Locale } from "@/lib/i18n";

const Navbar = () => {
  const { t } = useTranslations();
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as Locale;
  const isSignIn = pathname.includes("/sign-in");
  const { isSignedIn } = useUser();

  return (
    <nav className="h-16">
      <div className="h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href={`/${locale}`}>
            <div className="flex items-center gap-2">
              <Logo2 />
              <h2 className="text-xl font-black text-[#4a2e1a] dark:text-[#f8e9b0]">
                {t("nav.title")}
              </h2>
              <Badge className="bg-gradient-to-r from-[#f7a641] to-[#4a2e1a] text-white border-0 font-bold text-[10px] px-2 py-0.5 animate-pulse hover:animate-none hidden sm:inline-flex">
                ✨ {t("nav.alpha")}
              </Badge>
            </div>
          </Link>

          {/* Desktop Menu */}
          <NavMenu className="hidden md:block" />
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {isSignedIn ? (
            <>
              <div className="hidden sm:inline-flex">
                <UserButton
                  afterSwitchSessionUrl={`/${locale}`}
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                    },
                  }}
                />
              </div>
              <ButtonPrimary
                asChild
                size={"xs"}
                className="hidden sm:inline-flex"
              >
                <Link href={`/${locale}/dashboard`}>{t("nav.dashboard")}</Link>
              </ButtonPrimary>
              <ButtonPrimary asChild size={"xs"} className="sm:hidden">
                <Link href={`/${locale}/dashboard`}>{t("nav.dashboard")}</Link>
              </ButtonPrimary>
            </>
          ) : isSignIn ? (
            <ButtonPrimary
              asChild
              size={"xs"}
              className="hidden sm:inline-flex"
            >
              <Link href={`/${locale}/sign-up`}>{t("nav.gettingStarted")}</Link>
            </ButtonPrimary>
          ) : (
            <ButtonPrimary
              asChild
              size={"xs"}
              tone={"outline"}
              className="hidden sm:inline-flex"
            >
              <Link href={`/${locale}/sign-in`}>
                <LogIn />
                {t("nav.signIn")}
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
