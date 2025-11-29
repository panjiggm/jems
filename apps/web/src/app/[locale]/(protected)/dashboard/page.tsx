"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { api } from "@packages/backend/convex/_generated/api";
import StatisticsCard, { formatNumber } from "./_components/statistics-card";
import { SocialMediaIcon } from "./_components/social-media-icon";
import DailySuggestionsCard from "./_components/daily-suggestions-card";
import { Skeleton } from "@/components/ui/skeleton";

// Platform configuration with colors
const platformConfig = {
  tiktok: {
    title: "TikTok Followers",
    iconClassName: "bg-black/10 dark:bg-white/10",
    badgeConnected: "Terhubung",
    badgeAvailable: "Belum terhubung",
    badgeUnavailable: "Dalam pengembangan",
  },
  instagram: {
    title: "Instagram Followers",
    iconClassName: "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
    badgeConnected: "Terhubung",
    badgeAvailable: "Belum terhubung",
    badgeUnavailable: "Dalam pengembangan",
  },
  facebook: {
    title: "Facebook Followers",
    iconClassName: "bg-blue-500/10",
    badgeConnected: "Terhubung",
    badgeAvailable: "Belum terhubung",
    badgeUnavailable: "Dalam pengembangan",
  },
  youtube: {
    title: "YouTube Subscribers",
    iconClassName: "bg-red-500/10",
    badgeConnected: "Terhubung",
    badgeAvailable: "Belum terhubung",
    badgeUnavailable: "Dalam pengembangan",
  },
} as const;

export default function DashboardPage() {
  const router = useRouter();

  // Fetch platform availability and stats
  const platformAvailability = useQuery(
    api.queries.socialMediaAccounts.getPlatformAvailability,
  );
  const socialMediaStats = useQuery(
    api.queries.socialMediaAccounts.getSocialMediaStatsForDashboard,
  );

  // Map data to cards
  const socialMediaCards = useMemo(() => {
    if (!platformAvailability || !socialMediaStats) {
      return [];
    }

    const platforms: Array<"tiktok" | "instagram" | "facebook" | "youtube"> = [
      "tiktok",
      "instagram",
      "facebook",
      "youtube",
    ];

    return platforms.map((platform) => {
      const config = platformConfig[platform];
      const isAvailable = platformAvailability[platform];
      const platformData = socialMediaStats[platform];
      const isConnected = platformData?.isConnected ?? false;

      // Determine status
      let status: "available" | "connected" | "unavailable";
      let value: string;
      let badgeContent: string;
      let trend: "up" | "down" | undefined;
      let changePercentage: string | undefined;

      if (!isAvailable) {
        // Condition 1: Unavailable
        status = "unavailable";
        value = "Belum tersedia";
        badgeContent = config.badgeUnavailable;
      } else if (!isConnected || !platformData) {
        // Condition 2: Available but not connected
        status = "available";
        value = `Connect with ${platform.charAt(0).toUpperCase() + platform.slice(1)}`;
        badgeContent = config.badgeAvailable;
      } else {
        // Condition 3: Connected
        status = "connected";
        const stats = platformData.stats;
        if (platform === "youtube") {
          // YouTube uses subscribersCount
          const subscribers =
            stats?.platformMetrics?.subscribersCount ??
            stats?.followersCount ??
            0;
          value = formatNumber(subscribers);
        } else {
          // Other platforms use followersCount
          const followers = stats?.followersCount ?? 0;
          value = formatNumber(followers);
        }
        badgeContent = config.badgeConnected;

        // TODO: Calculate trend and change percentage from previous stats
        // For now, we'll leave it undefined
      }

      return {
        platform,
        icon: <SocialMediaIcon platform={platform} width={20} height={20} />,
        title: config.title,
        value,
        badgeContent,
        status,
        iconClassName: config.iconClassName,
        trend,
        changePercentage,
        onConnectClick: () => {
          router.push("/settings/accounts");
        },
      };
    });
  }, [platformAvailability, socialMediaStats, router]);

  const isLoading = !platformAvailability || !socialMediaStats;

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto size-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <div className="grid grid-cols-2 gap-6 xl:grid-cols-3">
          <div className="col-span-2 grid grid-cols-2 gap-6 xl:grid-cols-4">
            {isLoading
              ? Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <Skeleton key={index} className="h-32 rounded-lg" />
                  ))
              : socialMediaCards.map((card) => (
                  <StatisticsCard
                    key={card.platform}
                    icon={card.icon}
                    title={card.title}
                    value={card.value}
                    trend={card.trend}
                    changePercentage={card.changePercentage}
                    badgeContent={card.badgeContent}
                    status={card.status}
                    onConnectClick={card.onConnectClick}
                    className="shadow-none"
                    iconClassName={card.iconClassName}
                  />
                ))}
          </div>

          <DailySuggestionsCard className="shadow-none max-xl:col-span-full" />
        </div>
      </main>
    </div>
  );
}

// function DashboardSkeleton() {
//   return (
//     <div className="min-h-screen p-8 space-y-8">
//       <div className="flex justify-between mb-8">
//         <div className="space-y-2">
//           <Skeleton className="h-8 w-48" />
//           <Skeleton className="h-4 w-32" />
//         </div>
//       </div>
//       <Skeleton className="h-48 w-full rounded-xl" />
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         {Array(4)
//           .fill(0)
//           .map((_, i) => (
//             <Skeleton key={i} className="h-32 rounded-xl" />
//           ))}
//       </div>
//       <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
//         <Skeleton className="col-span-4 h-80 rounded-xl" />
//         <Skeleton className="col-span-3 h-80 rounded-xl" />
//       </div>
//     </div>
//   );
// }
