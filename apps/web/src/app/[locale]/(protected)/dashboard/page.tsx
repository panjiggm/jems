// "use client";

// import { useQuery } from "convex-helpers/react/cache/hooks";
// import { api } from "@packages/backend/convex/_generated/api";
// import { DashboardHeader } from "@/components/dashboard/dashboard-header";
// import { StatsCards } from "@/components/dashboard/stats-cards";
// import { DailySuggestions } from "@/components/dashboard/daily-suggestions";
// import { UpcomingSchedule } from "@/components/dashboard/upcoming-schedule";
// import { RecentActivity } from "@/components/dashboard/recent-activity";
// import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  // const dashboardData = useQuery(api.queries.dashboard.getDashboardOverview, {
  //   days: 7,
  // });

  // if (!dashboardData) {
  //   return <DashboardSkeleton />;
  // }

  return (
    <div className="min-h-screen p-8 space-y-8 animate-in fade-in duration-500">
      {/* <DashboardHeader />

      <DailySuggestions suggestions={dashboardData.contentIdeas?.items || []} />

      <StatsCards data={dashboardData} />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <UpcomingSchedule items={dashboardData.upcomingSchedules.items} />
        </div>
        <div className="col-span-3">
          <RecentActivity stats={dashboardData.recentActivity} />
        </div>
      </div> */}
      <h1 className="text-2xl font-bold">Dashboard</h1>
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
