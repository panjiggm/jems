"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslations } from "@/hooks/use-translations";

type Props = {
  className?: string;
  labels?: { light?: string; dark?: string };
};

export function ThemeToggle({ className, labels }: Props) {
  const { t } = useTranslations();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";
  const next = isDark ? "light" : "dark";

  return (
    <Button
      type="button"
      aria-label={t("nav.toggleTheme")}
      title={t("nav.toggleTheme")}
      size="xs"
      variant="outline"
      className={className}
      onClick={() => setTheme(next)}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span className="sr-only">
        {isDark
          ? (labels?.light ?? t("nav.switchToLight"))
          : (labels?.dark ?? t("nav.switchToDark"))}
      </span>
    </Button>
  );
}

export default ThemeToggle;
