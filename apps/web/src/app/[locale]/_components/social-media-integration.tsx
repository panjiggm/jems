"use client";

import { ArrowRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

import { MotionPreset } from "@/components/ui/motion-preset";
import { useTranslations } from "@/hooks/use-translations";
import { ButtonPrimary } from "@/components/ui/button-primary";

type AppGroup = {
  name: string;
  image: string;
}[];

const appGroups: AppGroup[] = [
  [
    {
      name: "Facebook",
      image: "/icons/facebook.svg",
    },
    {
      name: "Instagram",
      image: "/icons/instagram.svg",
    },
  ],
  [
    {
      name: "X",
      image: "/icons/x.svg",
    },
    {
      name: "YouTube",
      image: "/icons/youtube.svg",
    },
    {
      name: "TikTok",
      image: "/icons/tiktok.svg",
    },
  ],
  [
    {
      name: "Threads",
      image: "/icons/thread.svg",
    },
  ],
];

const SocialMediaIntegration = () => {
  const { t } = useTranslations();

  return (
    <section className="py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-16 max-lg:flex-col">
          {/* Apps Section */}
          <div className="relative flex items-center justify-center gap-x-6">
            <div />
            <MotionPreset
              className="bg-primary/30 absolute top-1/2 left-1/2 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full sm:size-96"
              fade
              blur
              zoom={{ initialScale: 0.8 }}
              transition={{ duration: 0.5 }}
            ></MotionPreset>

            {appGroups.map((group: AppGroup, index: number) => (
              <div key={index} className="relative z-10 grid gap-6">
                {group.map((app, i) => (
                  <MotionPreset
                    key={i}
                    fade
                    blur
                    slide={{ direction: "up" }}
                    transition={{ duration: 0.8 }}
                    delay={0.5 + index * 0.3 + i * 0.2}
                  >
                    <Card className="border border-primary-foreground h-35 rounded-md py-0 shadow-[5px_5px_0px_0px_var(--primary-foreground)] sm:w-28.5">
                      <CardContent className="flex h-full flex-col items-center justify-center gap-2.5 px-3">
                        <div className="size-10">
                          <img
                            src={app.image}
                            alt={app.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <CardTitle className="text-center text-base font-medium">
                          {app.name}
                        </CardTitle>
                      </CardContent>
                    </Card>
                  </MotionPreset>
                ))}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <MotionPreset
              fade
              blur
              slide={{ direction: "up" }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="text-xs font-medium">
                {t("home.socialMediaIntegration.badge")}
              </Badge>
            </MotionPreset>
            <MotionPreset
              component="h2"
              className="text-2xl font-semibold md:text-3xl lg:text-4xl"
              delay={0.3}
              fade
              blur
              slide={{ direction: "up" }}
              transition={{ duration: 0.5 }}
            >
              {t("home.socialMediaIntegration.title")}
            </MotionPreset>
            <MotionPreset
              component="p"
              className="text-muted-foreground text-base"
              delay={0.6}
              fade
              blur
              slide={{ direction: "up" }}
              transition={{ duration: 0.5 }}
            >
              {t("home.socialMediaIntegration.description")}
            </MotionPreset>

            <MotionPreset
              delay={0.9}
              fade
              blur
              slide={{ direction: "up" }}
              transition={{ duration: 0.5 }}
            >
              <ButtonPrimary tone="outline" size="sm" asChild>
                <a href="#">
                  {t("home.socialMediaIntegration.cta")}
                  <ArrowRightIcon />
                </a>
              </ButtonPrimary>
            </MotionPreset>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialMediaIntegration;
