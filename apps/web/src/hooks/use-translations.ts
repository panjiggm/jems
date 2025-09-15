"use client";

import { useParams } from "next/navigation";
import { getDictionary } from "@/lib/get-dictionary";
import { useEffect, useState } from "react";
import { Locale } from "@/lib/i18n";

export function useTranslations() {
  const params = useParams();
  const locale = params.locale as Locale;
  const [dictionary, setDictionary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDictionary(locale).then((dict) => {
      setDictionary(dict);
      setLoading(false);
    });
  }, [locale]);

  const t = (key: string) => {
    if (!dictionary) return key;

    const keys = key.split(".");
    let value = dictionary;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }

    return value;
  };

  return { t, loading, locale };
}
