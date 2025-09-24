"use client";

import { useParams } from "next/navigation";
import { getDictionary } from "@/lib/get-dictionary";
import { useEffect, useState, useCallback } from "react";
import { Locale } from "@/lib/i18n";

export function useTranslations() {
  const params = useParams();
  const locale = params.locale as Locale;
  const [dictionary, setDictionary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const loadDictionary = async () => {
      try {
        const dict = await getDictionary(locale);
        if (!isCancelled) {
          setDictionary(dict);
          setLoading(false);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to load dictionary:", error);
          setLoading(false);
        }
      }
    };

    loadDictionary();

    return () => {
      isCancelled = true;
    };
  }, [locale]);

  const t = useCallback(
    (key: string) => {
      if (!dictionary) return key;

      const keys = key.split(".");
      let value = dictionary;

      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) return key;
      }

      return value;
    },
    [dictionary],
  );

  return { t, loading, locale };
}
