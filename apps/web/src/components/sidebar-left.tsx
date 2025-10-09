"use client";

import * as React from "react";
import {
  CreditCard,
  HardDrive,
  Home,
  Laptop2,
  MessageCircleQuestion,
  User,
  Bell,
} from "lucide-react";

import { NavChats } from "@/components/nav-chats";
import { NavMain } from "@/components/nav-main";
import { NavAccount } from "@/components/nav-account";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { NavMobileApp } from "./nav-mobile-app";
import { useParams } from "next/navigation";
import { Locale } from "@/lib/i18n";

// This is sample data.
const getNavData = (locale: Locale) => ({
  navMain: [
    {
      title: "Dashboard",
      url: `/${locale}/dashboard`,
      icon: Home,
    },
    {
      title: "Chat with AI",
      url: `/${locale}/chats`,
      icon: MessageCircleQuestion,
    },
    {
      title: "Projects",
      url: `/${locale}/projects`,
      icon: Laptop2,
    },
    {
      title: "Drive",
      url: `/${locale}/drive`,
      icon: HardDrive,
    },
  ],
  navAccount: [
    {
      title: "Profile",
      url: `/${locale}/profile`,
      icon: User,
    },
    {
      title: "Billing",
      url: `/${locale}/billing`,
      icon: CreditCard,
    },
    {
      title: "Notifications",
      url: `/${locale}/notifications`,
      icon: Bell,
    },
  ],
  chats: [
    {
      name: "Project Management & Task Tracking",
      url: "#",
      emoji: "📊",
    },
    {
      name: "Family Recipe Collection & Meal Planning",
      url: "#",
      emoji: "🍳",
    },
    {
      name: "Fitness Tracker & Workout Routines",
      url: "#",
      emoji: "💪",
    },
    {
      name: "Book Notes & Reading List",
      url: "#",
      emoji: "📚",
    },
    {
      name: "Sustainable Gardening Tips & Plant Care",
      url: "#",
      emoji: "🌱",
    },
  ],
});

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const params = useParams();
  const locale = params.locale as Locale;
  const data = getNavData(locale);

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavAccount items={data.navAccount} />
        <NavChats chats={data.chats} />
      </SidebarContent>
      <SidebarRail />

      <SidebarFooter>
        <div className="p-1">
          <NavMobileApp />
        </div>
      </SidebarFooter>
      <NavUser />
    </Sidebar>
  );
}
