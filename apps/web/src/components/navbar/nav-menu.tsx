import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { useTranslations } from "@/hooks/use-translations";
import Link from "next/link";
import { ComponentProps } from "react";
import { useParams } from "next/navigation";
import { Locale } from "@/lib/i18n";

export const NavMenu = (props: ComponentProps<typeof NavigationMenu>) => {
  const { t } = useTranslations();
  const params = useParams();
  const locale = params.locale as Locale;

  return (
    <NavigationMenu {...props}>
      <NavigationMenuList className="gap-3 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:justify-start">
        <NavigationMenuItem>
          <NavigationMenuLink asChild className="font-semibold">
            <Link href={`/${locale}/blog`}>{t("nav.blog")}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className="font-semibold">
            <Link href={`/${locale}/about`}>{t("nav.about")}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className="font-semibold">
            <Link href={`/${locale}/contact`}>{t("nav.contactUs")}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
