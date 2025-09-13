import * as React from "react";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Independent, no-props Hero using project UI components
export default function Hero() {
  return (
    <section className="relative pt-16 sm:pt-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold tracking-wider text-sky-600 dark:text-sky-400">
            Launch Soon • Version 0.1.0
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
            Shaping a <span className="bg-[#f7a641]">purposeful</span>,
            tech-empowered, human-first creative culture
          </h1>
          <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
            We are shaping a new creative work culture — one that is driven by
            purpose, empowered by technology, and rooted in human values.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/sign-up">
              <ButtonPrimary>Get Started</ButtonPrimary>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
