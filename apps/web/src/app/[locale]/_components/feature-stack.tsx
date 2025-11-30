import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, CalendarClock, FolderOpen } from "lucide-react";
import { motion } from "framer-motion";
import type { Transition } from "framer-motion";
import { useTranslations } from "@/hooks/use-translations";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const floatTransition: Transition = {
  duration: 4,
  repeat: Infinity as number,
  repeatType: "mirror" as const,
  ease: [0.42, 0, 0.58, 1],
};

function FeatureCard({
  Icon,
  title,
  desc,
}: {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  desc: string;
}) {
  return (
    <Card className="pointer-events-auto select-none max-w-sm border border-border/60 bg-background/90 supports-[backdrop-filter]:bg-background/70 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-[#f7a641] p-2">
            <Icon className="h-5 w-5 text-[#f7a641]" />
          </div>
          <CardTitle className="text-lg tracking-tight text-[#4a2e1a] dark:text-[#f8e9b0]">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  );
}

export default function FeatureStack() {
  const { t } = useTranslations();

  const features = [
    {
      key: "files",
      title: t("home.features.fileManagement.title"),
      desc: t("home.features.fileManagement.description"),
      Icon: FolderOpen,
    },
    {
      key: "ai",
      title: t("home.features.aiAssistant.title"),
      desc: t("home.features.aiAssistant.description"),
      Icon: Bot,
    },
    {
      key: "organize",
      title: t("home.features.organizeContent.title"),
      desc: t("home.features.organizeContent.description"),
      Icon: CalendarClock,
    },
  ] as const;

  return (
    <section className="w-full">
      {/* Mobile / small screens: vertical list */}
      <div className="md:hidden grid gap-4">
        {features.map(({ key, title, desc, Icon }) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <FeatureCard Icon={Icon} title={title} desc={desc} />
          </motion.div>
        ))}
      </div>

      {/* Desktop / larger screens: stacked layout */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        className="hidden md:block relative h-[420px] lg:h-[460px]"
      >
        {/* Left card */}
        <motion.div
          className="absolute inset-y-0 left-0 flex items-center"
          initial={{ opacity: 0, x: -40, rotate: -8 }}
          animate={{ opacity: 1, x: 0, rotate: -6 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="origin-center"
            animate={{ y: [0, -6, 0] }}
            transition={floatTransition}
          >
            <div className="-rotate-6 scale-[0.92]">
              <FeatureCard
                Icon={features[0].Icon}
                title={features[0].title}
                desc={features[0].desc}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Center card */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, y: 24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
        >
          <motion.div
            className="origin-center"
            animate={{ y: [0, -10, 0] }}
            transition={{ ...floatTransition, duration: 5 }}
          >
            <div className="relative z-20 w-[min(560px,88%)]">
              <FeatureCard
                Icon={features[1].Icon}
                title={features[1].title}
                desc={features[1].desc}
              />
              {/* Glow behind center card */}
              <div className="pointer-events-none absolute -inset-3 -z-10 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent blur-2xl" />
            </div>
          </motion.div>
        </motion.div>

        {/* Right card */}
        <motion.div
          className="absolute inset-y-0 right-0 flex items-center justify-end"
          initial={{ opacity: 0, x: 40, rotate: 8 }}
          animate={{ opacity: 1, x: 0, rotate: 6 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.12 }}
        >
          <motion.div
            className="origin-center"
            animate={{ y: [0, -6, 0] }}
            transition={floatTransition}
          >
            <div className="rotate-6 scale-[0.92]">
              <FeatureCard
                Icon={features[2].Icon}
                title={features[2].title}
                desc={features[2].desc}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
