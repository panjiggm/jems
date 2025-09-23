import { common } from "./common";
import { nav } from "./navigation";
import { home } from "./home";
import { auth } from "./auth";
import { onboarding } from "./onboarding";
import { projects } from "./projects";
import { mobileApp } from "./mobile";
import { contents } from "./contents";

export const dictionary = {
  nav,
  home,
  common,
  auth,
  onboarding,
  projects,
  mobileApp,
  contents,
} as const;
