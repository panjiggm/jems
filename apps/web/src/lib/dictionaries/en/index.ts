import { common } from "./common";
import { nav } from "./navigation";
import { home } from "./home";
import { auth } from "./auth";
import { onboarding } from "./onboarding";
import { projects } from "./projects";
import { project } from "./project";
import { mobileApp } from "./mobile";
import { contents } from "./contents";
import { drive } from "./drive";
import { kanban } from "./kanban";
import { list } from "./list";
import { profile } from "./profile";
import { table } from "./table";
import { terms } from "./terms";
import { policy } from "./policy";

export const dictionary = {
  nav,
  home,
  common,
  auth,
  onboarding,
  projects,
  project,
  mobileApp,
  contents,
  drive,
  kanban,
  list,
  profile,
  table,
  terms,
  policy,
} as const;
