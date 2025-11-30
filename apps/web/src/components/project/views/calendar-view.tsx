"use client";

import { useMemo, useState, useCallback } from "react";
import {
  Calendar,
  Views,
  dateFnsLocalizer,
  ToolbarProps,
} from "react-big-calendar";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { FilterState } from "../search-filter-content";
import { useTranslations } from "@/hooks/use-translations";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { id, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Setup date-fns locales
const locales = {
  id: id,
  en: enUS,
};

interface CalendarViewProps {
  projectId?: Id<"projects">;
  userId?: string;
  filters: FilterState;
  contentType: "campaign" | "routine";
}

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    contentId: string;
    contentType: "campaign" | "routine";
    platform: string;
    status: string;
    eventType: "scheduled" | "published";
  };
};

// Custom Toolbar Component
function CustomToolbar({
  label,
  onNavigate,
}: ToolbarProps<CalendarEvent, object>) {
  const { t } = useTranslations();

  return (
    <div className="rbc-toolbar flex items-center justify-between mb-4">
      <div className="rbc-btn-group flex items-center gap-1">
        <Button
          variant="outline"
          size="xs"
          onClick={() => onNavigate("PREV")}
          className="h-7 px-2"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => onNavigate("TODAY")}
          className="h-7 px-2 text-xs"
        >
          {t("common.today") || "Today"}
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => onNavigate("NEXT")}
          className="h-7 px-2"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
      <span className="rbc-toolbar-label text-sm font-medium">{label}</span>
    </div>
  );
}

export default function CalendarView({
  projectId,
  userId,
  filters,
  contentType,
}: CalendarViewProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  // Get current locale for date-fns
  const currentLocale = locale === "id" ? locales.id : locales.en;

  // Create localizer with current locale
  const localizer = useMemo(
    () =>
      dateFnsLocalizer({
        format,
        parse,
        startOfWeek: (date: Date) =>
          startOfWeek(date, { locale: currentLocale }),
        getDay,
        locales,
      }),
    [currentLocale],
  );

  // State for current calendar date
  const [currentDate, setCurrentDate] = useState(new Date());

  // Handle calendar navigation
  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  // Fetch data based on contentType
  const campaignsData = useQuery(
    api.queries.contentCampaigns.getForCalendar,
    contentType === "campaign" && projectId ? { projectId } : "skip",
  );

  const routinesData = useQuery(
    api.queries.contentRoutines.getForCalendar,
    contentType === "routine" && projectId ? { projectId } : "skip",
  );

  // Transform data to calendar events
  const events = useMemo<CalendarEvent[]>(() => {
    const data = contentType === "campaign" ? campaignsData : routinesData;
    if (!data || data.length === 0) return [];

    const allEvents: CalendarEvent[] = [];

    data.forEach((item) => {
      // Apply filters
      if (
        filters.search &&
        !item.title.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return;
      }

      if (filters.status.length > 0 && !filters.status.includes(item.status)) {
        return;
      }

      if (
        filters.platform.length > 0 &&
        !filters.platform.includes(item.platform)
      ) {
        return;
      }

      if (contentType === "campaign" && filters.campaignTypes.length > 0) {
        const campaign = item as any;
        if (!filters.campaignTypes.includes(campaign.type)) {
          return;
        }
      }

      // Create events from calendarEvents
      if (item.calendarEvents && item.calendarEvents.length > 0) {
        item.calendarEvents.forEach((event: any, index: number) => {
          const eventDate = new Date(event.date);

          // Skip invalid dates
          if (isNaN(eventDate.getTime())) return;

          allEvents.push({
            id: `${item._id}-${index}`,
            title: item.title,
            start: eventDate,
            end: new Date(eventDate.getTime() + 60 * 60 * 1000), // 1 hour duration
            resource: {
              contentId: item._id,
              contentType,
              platform: event.platform || item.platform,
              status: event.status || item.status,
              eventType: event.type,
            },
          });
        });
      }

      // Also add created date as milestone if no other events
      if (!item.calendarEvents || item.calendarEvents.length === 0) {
        const createdDate = new Date(item.createdAt);
        if (!isNaN(createdDate.getTime())) {
          allEvents.push({
            id: `${item._id}-created`,
            title: item.title,
            start: createdDate,
            end: new Date(createdDate.getTime() + 60 * 60 * 1000),
            resource: {
              contentId: item._id,
              contentType,
              platform: item.platform,
              status: item.status,
              eventType: "scheduled" as const,
            },
          });
        }
      }
    });

    return allEvents;
  }, [campaignsData, routinesData, filters, contentType]);

  const handleSelectEvent = (event: CalendarEvent) => {
    const slug = (
      contentType === "campaign" ? campaignsData : routinesData
    )?.find((item) => item._id === event.resource.contentId)?.slug;

    if (slug) {
      router.push(`/${locale}/${contentType}s/${slug}`);
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const isScheduled = event.resource.eventType === "scheduled";
    const isPublished = event.resource.eventType === "published";

    let backgroundColor = "#3174ad";
    let borderColor = "#3174ad";

    if (isScheduled) {
      backgroundColor = "#f7a641";
      borderColor = "#f7a641";
    } else if (isPublished) {
      backgroundColor = "#10b981";
      borderColor = "#10b981";
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: "#fff",
        borderRadius: "4px",
        border: "none",
        padding: "2px 4px",
      },
    };
  };

  if (!projectId || !userId) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">
          {t("project.viewMessages.calendar.title")}
        </h3>
        <p className="text-muted-foreground">
          {t("project.viewMessages.calendar.description")}
        </p>
      </div>
    );
  }

  const isLoading =
    contentType === "campaign"
      ? campaignsData === undefined
      : routinesData === undefined;

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full">
      <Calendar
        localizer={localizer}
        culture={locale}
        events={events}
        startAccessor="start"
        endAccessor="end"
        date={currentDate}
        onNavigate={handleNavigate}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        views={[Views.MONTH]}
        defaultView={Views.MONTH}
        components={{
          toolbar: CustomToolbar,
        }}
        popup
        className={cn(
          "bg-card rounded-lg",
          "[&_.rbc-calendar]:bg-transparent",
          "[&_.rbc-header]:border-b [&_.rbc-header]:py-2 [&_.rbc-header]:mb-2",
          "[&_.rbc-header]:text-xs [&_.rbc-header]:font-medium",
          "[&_.rbc-today]:bg-primary/5",
          "[&_.rbc-off-range-bg]:bg-muted/30",
          "[&_.rbc-event]:cursor-pointer",
          "[&_.rbc-event-content]:text-[10px] [&_.rbc-event-content]:leading-tight",
          "[&_.rbc-date-cell]:text-xs",
          "[&_.rbc-day-bg]:text-xs",
          "[&_.rbc-month-view]:text-xs",
          "[&_.rbc-day-slot]:text-xs",
        )}
        formats={{
          monthHeaderFormat: (date) =>
            format(date, "MMMM yyyy", { locale: currentLocale }),
          dayFormat: (date) =>
            format(date, "EEEEEE", { locale: currentLocale }),
          dayHeaderFormat: (date) =>
            format(date, "EEEEEE", { locale: currentLocale }),
          dayRangeHeaderFormat: ({ start, end }) =>
            `${format(start, "MMM d", { locale: currentLocale })} - ${format(end, "MMM d", { locale: currentLocale })}`,
        }}
        messages={{
          next: t("common.next") || "Next",
          previous: t("common.previous") || "Previous",
          today: t("common.today") || "Today",
          month: t("common.month") || "Month",
          noEventsInRange:
            t("project.viewMessages.calendar.noEvents") ||
            "No events in this range",
        }}
      />
    </div>
  );
}
