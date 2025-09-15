import { Locale } from "./i18n";

export async function getDictionary(locale: Locale) {
  const dictionaries = {
    id: () => import("./dictionaries/id").then((module) => module.dictionary),
    en: () => import("./dictionaries/en").then((module) => module.dictionary),
  };

  return dictionaries[locale]();
}
