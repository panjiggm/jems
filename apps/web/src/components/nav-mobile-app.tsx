import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "@/hooks/use-translations";

export function NavMobileApp() {
  const { t } = useTranslations();

  return (
    <Card className="gap-2 py-4 shadow">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">{t("mobileApp.title")}</CardTitle>
        <CardDescription className="text-xs">
          {t("mobileApp.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="">
        <div className="flex flex-row items-center gap-3">
          {/* App Store Badge */}
          <div className="">
            <img
              src="/images/app-store.svg"
              alt="Download on App Store"
              className="w-full"
            />
          </div>

          {/* Google Play Store Badge */}
          <div className="">
            <img
              src="/images/play-store.svg"
              alt="Get it on Google Play"
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
