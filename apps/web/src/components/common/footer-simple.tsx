"use client";

import { useTranslations } from "@/hooks/use-translations";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function FooterSimple() {
  const { t } = useTranslations();
  const params = useParams();
  const locale = params?.locale || "id";
  const year = new Date().getFullYear();

  return (
    <footer className="py-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>© {year} Holobiont</span>
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/terms`}>{t("common.terms")}</Link>
          <Link href={`/${locale}/policy`}>{t("common.policy")}</Link>
          <Link href={`/${locale}/contact`}>{t("common.contact")}</Link>
        </div>
      </div>
    </footer>
  );
}
