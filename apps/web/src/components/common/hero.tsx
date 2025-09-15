"use client";

import * as React from "react";
import { ButtonPrimary } from "@/components/ui/button-primary";
import Link from "next/link";
import { useTranslations } from "@/hooks/use-translations";

// Independent, no-props Hero using project UI components
export default function Hero() {
  const { t } = useTranslations();

  return (
    <section className="relative pt-16 sm:pt-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-sm font-bold tracking-wider text-sky-600 dark:text-sky-400">
            {t("home.hero.badge")}
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
            {t("home.hero.title")}{" "}
            <span className="bg-[#f7a641] px-3">
              {t("home.hero.titleHighlight")}
            </span>
            {t("home.hero.titleSuffix")}
          </h1>
          <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
            {t("home.hero.description")}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/sign-up">
              <ButtonPrimary>{t("home.hero.cta")}</ButtonPrimary>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
