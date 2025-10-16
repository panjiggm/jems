import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { currentUserId } from "../auth";
import { internal } from "../_generated/api";

// Helper function to get month names in Indonesian
const getMonthNameId = (month: number): string => {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return months[month];
};

// Helper function to get start and end date of a month
const getMonthDates = (year: number, month: number) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // Last day of month
  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
};

// Helper function to generate random content titles
const generateContentTitle = (index: number, monthName: string): string => {
  const templates = [
    `Konten ${monthName} #${index}`,
    `Video Tutorial ${monthName} ${index}`,
    `Review Produk ${monthName} ${index}`,
    `Tips & Trik ${monthName} ${index}`,
    `Behind the Scenes ${monthName} ${index}`,
    `Challenge ${monthName} ${index}`,
    `Collab ${monthName} ${index}`,
    `Q&A Session ${monthName} ${index}`,
    `Story Time ${monthName} ${index}`,
    `Tutorial ${monthName} ${index}`,
  ];
  return templates[index % templates.length];
};

// Helper function to get random platform
const getRandomPlatform = ():
  | "tiktok"
  | "instagram"
  | "youtube"
  | "x"
  | "facebook"
  | "threads"
  | "other" => {
  const platforms = [
    "tiktok",
    "instagram",
    "youtube",
    "x",
    "facebook",
    "threads",
  ] as const;
  return platforms[Math.floor(Math.random() * platforms.length)];
};

// Helper function to get random campaign type
const getRandomCampaignType = (): "barter" | "paid" => {
  const types = ["barter", "paid"] as const;
  return types[Math.floor(Math.random() * types.length)];
};

// Helper function to get random campaign status
const getRandomCampaignStatus = ():
  | "product_obtained"
  | "production"
  | "published"
  | "payment"
  | "done" => {
  const statuses = [
    "product_obtained",
    "production",
    "published",
    "payment",
    "done",
  ] as const;
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Helper function to get random routine status
const getRandomRoutineStatus = ():
  | "plan"
  | "in_progress"
  | "scheduled"
  | "published" => {
  const statuses = ["plan", "in_progress", "scheduled", "published"] as const;
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Helper function to get random task status
const getRandomTaskStatus = (): "todo" | "doing" | "done" | "skipped" => {
  const statuses = ["todo", "doing", "done"] as const;
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Helper function to generate task titles
const generateTaskTitle = (contentTitle: string, index: number): string => {
  const taskTemplates = [
    `Riset dan Brainstorming untuk ${contentTitle}`,
    `Buat Script untuk ${contentTitle}`,
    `Shooting untuk ${contentTitle}`,
    `Edit Video ${contentTitle}`,
    `Review dan QC ${contentTitle}`,
    `Upload dan Schedule ${contentTitle}`,
    `Siapkan Thumbnail ${contentTitle}`,
    `Tulis Caption ${contentTitle}`,
    `Persiapan Props ${contentTitle}`,
  ];
  return taskTemplates[index % taskTemplates.length];
};

export const createMonthlyTemplate = mutation({
  args: {
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed (0 = January, 11 = December)

    // Calculate how many months remaining (including current month)
    const monthsToCreate = 12 - currentMonth; // Maximum 12 months
    const isIndonesian = args.locale === "id";

    const createdData = {
      projects: [] as string[],
      campaigns: [] as string[],
      routines: [] as string[],
      tasks: [] as string[],
      summary: {
        projectsCreated: 0,
        campaignsCreated: 0,
        routinesCreated: 0,
        tasksCreated: 0,
      },
    };

    // Create projects for remaining months
    for (let i = 0; i < monthsToCreate; i++) {
      const monthIndex = currentMonth + i;
      const monthName = getMonthNameId(monthIndex);
      const { startDate, endDate } = getMonthDates(currentYear, monthIndex);

      // Create project
      const projectTitle = isIndonesian
        ? `Project ${monthName} ${currentYear}`
        : `${monthName} ${currentYear} Project`;

      const projectDescription = isIndonesian
        ? `Project konten untuk bulan ${monthName} ${currentYear}`
        : `Content project for ${monthName} ${currentYear}`;

      const projectId = await ctx.db.insert("projects", {
        userId,
        title: projectTitle,
        description: projectDescription,
        startDate,
        endDate,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      createdData.projects.push(projectId);
      createdData.summary.projectsCreated++;

      // Log project creation activity
      await ctx.scheduler.runAfter(
        0,
        internal.mutations.projectActivities.logActivity,
        {
          userId,
          projectId,
          entityType: "project" as const,
          entityId: projectId,
          action: "created" as const,
          description: `Project "${projectTitle}" was created via template`,
          metadata: {
            template: "monthly",
            month: monthName,
            year: currentYear,
          },
        },
      );

      // Create 3 campaigns for each project
      const campaignsPerProject = 3;
      for (let j = 0; j < campaignsPerProject; j++) {
        const campaignTitle = `Campaign ${monthName} #${j + 1}`;
        const platform = getRandomPlatform();
        const type = getRandomCampaignType();
        const status = getRandomCampaignStatus();

        // Calculate due date within the month (spread throughout the month)
        const dayOfMonth = Math.floor(((j + 1) / campaignsPerProject) * 28) + 1;
        const dueDate = new Date(currentYear, monthIndex, dayOfMonth)
          .toISOString()
          .split("T")[0];

        const campaignId = await ctx.db.insert("contentCampaigns", {
          userId,
          projectId,
          title: campaignTitle,
          platform,
          type,
          status,
          statusHistory: [
            {
              status,
              timestamp: Date.now(),
            },
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        createdData.campaigns.push(campaignId);
        createdData.summary.campaignsCreated++;

        // Log campaign creation activity
        await ctx.scheduler.runAfter(
          0,
          internal.mutations.projectActivities.logActivity,
          {
            userId,
            projectId,
            entityType: "content_campaign" as any,
            entityId: campaignId,
            action: "created" as const,
            description: `Campaign "${campaignTitle}" was created via template`,
            metadata: {
              template: "monthly",
              platform,
              type,
            },
          },
        );

        // Create 2 tasks for each campaign
        const tasksPerCampaign = 2;
        for (let k = 0; k < tasksPerCampaign; k++) {
          const taskTitle = generateTaskTitle(campaignTitle, k);
          const taskStatus = getRandomTaskStatus();

          // Calculate task due date (before campaign due date)
          const taskDueDateObj = new Date(dueDate);
          taskDueDateObj.setDate(
            taskDueDateObj.getDate() - (tasksPerCampaign - k),
          );
          const taskDueDate = taskDueDateObj.toISOString().split("T")[0];

          const taskId = await ctx.db.insert("tasks", {
            userId,
            projectId,
            contentId: campaignId,
            contentType: "campaign" as const,
            title: taskTitle,
            status: taskStatus,
            dueDate: taskDueDate,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          createdData.tasks.push(taskId);
          createdData.summary.tasksCreated++;

          // Log task creation activity
          await ctx.scheduler.runAfter(
            0,
            internal.mutations.projectActivities.logActivity,
            {
              userId,
              projectId,
              entityType: "task" as const,
              entityId: taskId,
              action: "created" as const,
              description: `Task "${taskTitle}" was created via template`,
              metadata: {
                template: "monthly",
                campaignId,
              },
            },
          );
        }
      }

      // Create 3 routines for each project
      const routinesPerProject = 3;
      for (let j = 0; j < routinesPerProject; j++) {
        const routineTitle = `Routine ${monthName} #${j + 1}`;
        const platform = getRandomPlatform();
        const status = getRandomRoutineStatus();

        // Calculate due date within the month (spread throughout the month)
        const dayOfMonth = Math.floor(((j + 1) / routinesPerProject) * 28) + 1;
        const dueDate = new Date(currentYear, monthIndex, dayOfMonth)
          .toISOString()
          .split("T")[0];

        const routineId = await ctx.db.insert("contentRoutines", {
          userId,
          projectId,
          title: routineTitle,
          platform,
          status,
          statusHistory: [
            {
              status,
              timestamp: Date.now(),
            },
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        createdData.routines.push(routineId);
        createdData.summary.routinesCreated++;

        // Log routine creation activity
        await ctx.scheduler.runAfter(
          0,
          internal.mutations.projectActivities.logActivity,
          {
            userId,
            projectId,
            entityType: "content_routine" as any,
            entityId: routineId,
            action: "created" as const,
            description: `Routine "${routineTitle}" was created via template`,
            metadata: {
              template: "monthly",
              platform,
            },
          },
        );

        // Create 2 tasks for each routine
        const tasksPerRoutine = 2;
        for (let k = 0; k < tasksPerRoutine; k++) {
          const taskTitle = generateTaskTitle(routineTitle, k);
          const taskStatus = getRandomTaskStatus();

          // Calculate task due date (before routine due date)
          const taskDueDateObj = new Date(dueDate);
          taskDueDateObj.setDate(
            taskDueDateObj.getDate() - (tasksPerRoutine - k),
          );
          const taskDueDate = taskDueDateObj.toISOString().split("T")[0];

          const taskId = await ctx.db.insert("tasks", {
            userId,
            projectId,
            contentId: routineId,
            contentType: "routine" as const,
            title: taskTitle,
            status: taskStatus,
            dueDate: taskDueDate,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          createdData.tasks.push(taskId);
          createdData.summary.tasksCreated++;

          // Log task creation activity
          await ctx.scheduler.runAfter(
            0,
            internal.mutations.projectActivities.logActivity,
            {
              userId,
              projectId,
              entityType: "task" as const,
              entityId: taskId,
              action: "created" as const,
              description: `Task "${taskTitle}" was created via template`,
              metadata: {
                template: "monthly",
                routineId,
              },
            },
          );
        }
      }
    }

    return {
      success: true,
      message: isIndonesian
        ? `Berhasil membuat ${createdData.summary.projectsCreated} projects, ${createdData.summary.campaignsCreated} campaigns, ${createdData.summary.routinesCreated} routines, dan ${createdData.summary.tasksCreated} tasks`
        : `Successfully created ${createdData.summary.projectsCreated} projects, ${createdData.summary.campaignsCreated} campaigns, ${createdData.summary.routinesCreated} routines, and ${createdData.summary.tasksCreated} tasks`,
      data: createdData,
    };
  },
});

// Additional template: Create Quarterly Template (bonus)
export const createQuarterlyTemplate = mutation({
  args: {
    quarter: v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4)),
    year: v.optional(v.number()),
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    const year = args.year || new Date().getFullYear();
    const isIndonesian = args.locale === "id";

    // Define quarter months
    const quarterMonths = {
      1: [0, 1, 2], // Q1: Jan, Feb, Mar
      2: [3, 4, 5], // Q2: Apr, May, Jun
      3: [6, 7, 8], // Q3: Jul, Aug, Sep
      4: [9, 10, 11], // Q4: Oct, Nov, Dec
    };

    const months = quarterMonths[args.quarter];
    const quarterName = isIndonesian
      ? `Q${args.quarter}`
      : `Quarter ${args.quarter}`;

    const createdData = {
      projects: [] as string[],
      campaigns: [] as string[],
      routines: [] as string[],
      tasks: [] as string[],
      summary: {
        projectsCreated: 0,
        campaignsCreated: 0,
        routinesCreated: 0,
        tasksCreated: 0,
      },
    };

    // Create projects for each month in the quarter
    for (const monthIndex of months) {
      const monthName = getMonthNameId(monthIndex);
      const { startDate, endDate } = getMonthDates(year, monthIndex);

      const projectTitle = isIndonesian
        ? `${quarterName} - ${monthName} ${year}`
        : `${quarterName} - ${monthName} ${year}`;

      const projectDescription = isIndonesian
        ? `Project konten ${quarterName} untuk bulan ${monthName} ${year}`
        : `${quarterName} content project for ${monthName} ${year}`;

      const projectId = await ctx.db.insert("projects", {
        userId,
        title: projectTitle,
        description: projectDescription,
        startDate,
        endDate,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      createdData.projects.push(projectId);
      createdData.summary.projectsCreated++;

      // Log project creation
      await ctx.scheduler.runAfter(
        0,
        internal.mutations.projectActivities.logActivity,
        {
          userId,
          projectId,
          entityType: "project" as const,
          entityId: projectId,
          action: "created" as const,
          description: `Project "${projectTitle}" was created via quarterly template`,
          metadata: {
            template: "quarterly",
            quarter: args.quarter,
            month: monthName,
            year,
          },
        },
      );

      // Create 3 campaigns per project
      for (let j = 0; j < 3; j++) {
        const campaignTitle = `Campaign ${monthName} #${j + 1}`;
        const platform = getRandomPlatform();
        const type = getRandomCampaignType();
        const status = getRandomCampaignStatus();

        const dayOfMonth = Math.floor(((j + 1) / 3) * 28) + 1;
        const dueDate = new Date(year, monthIndex, dayOfMonth)
          .toISOString()
          .split("T")[0];

        const campaignId = await ctx.db.insert("contentCampaigns", {
          userId,
          projectId,
          title: campaignTitle,
          platform,
          type,
          status,
          statusHistory: [
            {
              status,
              timestamp: Date.now(),
            },
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        createdData.campaigns.push(campaignId);
        createdData.summary.campaignsCreated++;

        // Log campaign creation
        await ctx.scheduler.runAfter(
          0,
          internal.mutations.projectActivities.logActivity,
          {
            userId,
            projectId,
            entityType: "content_campaign" as any,
            entityId: campaignId,
            action: "created" as const,
            description: `Campaign "${campaignTitle}" was created via quarterly template`,
            metadata: {
              template: "quarterly",
              quarter: args.quarter,
              platform,
              type,
            },
          },
        );

        // Create 2 tasks per campaign
        for (let k = 0; k < 2; k++) {
          const taskTitle = generateTaskTitle(campaignTitle, k);
          const taskStatus = getRandomTaskStatus();

          const taskDueDateObj = new Date(dueDate);
          taskDueDateObj.setDate(taskDueDateObj.getDate() - (2 - k));
          const taskDueDate = taskDueDateObj.toISOString().split("T")[0];

          const taskId = await ctx.db.insert("tasks", {
            userId,
            projectId,
            contentId: campaignId,
            contentType: "campaign" as const,
            title: taskTitle,
            status: taskStatus,
            dueDate: taskDueDate,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          createdData.tasks.push(taskId);
          createdData.summary.tasksCreated++;

          // Log task creation
          await ctx.scheduler.runAfter(
            0,
            internal.mutations.projectActivities.logActivity,
            {
              userId,
              projectId,
              entityType: "task" as const,
              entityId: taskId,
              action: "created" as const,
              description: `Task "${taskTitle}" was created via quarterly template`,
              metadata: {
                template: "quarterly",
                quarter: args.quarter,
                campaignId,
              },
            },
          );
        }
      }

      // Create 3 routines per project
      for (let j = 0; j < 3; j++) {
        const routineTitle = `Routine ${monthName} #${j + 1}`;
        const platform = getRandomPlatform();
        const status = getRandomRoutineStatus();

        const dayOfMonth = Math.floor(((j + 1) / 3) * 28) + 1;
        const dueDate = new Date(year, monthIndex, dayOfMonth)
          .toISOString()
          .split("T")[0];

        const routineId = await ctx.db.insert("contentRoutines", {
          userId,
          projectId,
          title: routineTitle,
          platform,
          status,
          statusHistory: [
            {
              status,
              timestamp: Date.now(),
            },
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        createdData.routines.push(routineId);
        createdData.summary.routinesCreated++;

        // Log routine creation
        await ctx.scheduler.runAfter(
          0,
          internal.mutations.projectActivities.logActivity,
          {
            userId,
            projectId,
            entityType: "content_routine" as any,
            entityId: routineId,
            action: "created" as const,
            description: `Routine "${routineTitle}" was created via quarterly template`,
            metadata: {
              template: "quarterly",
              quarter: args.quarter,
              platform,
            },
          },
        );

        // Create 2 tasks per routine
        for (let k = 0; k < 2; k++) {
          const taskTitle = generateTaskTitle(routineTitle, k);
          const taskStatus = getRandomTaskStatus();

          const taskDueDateObj = new Date(dueDate);
          taskDueDateObj.setDate(taskDueDateObj.getDate() - (2 - k));
          const taskDueDate = taskDueDateObj.toISOString().split("T")[0];

          const taskId = await ctx.db.insert("tasks", {
            userId,
            projectId,
            contentId: routineId,
            contentType: "routine" as const,
            title: taskTitle,
            status: taskStatus,
            dueDate: taskDueDate,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          createdData.tasks.push(taskId);
          createdData.summary.tasksCreated++;

          // Log task creation
          await ctx.scheduler.runAfter(
            0,
            internal.mutations.projectActivities.logActivity,
            {
              userId,
              projectId,
              entityType: "task" as const,
              entityId: taskId,
              action: "created" as const,
              description: `Task "${taskTitle}" was created via quarterly template`,
              metadata: {
                template: "quarterly",
                quarter: args.quarter,
                routineId,
              },
            },
          );
        }
      }
    }

    return {
      success: true,
      message: isIndonesian
        ? `Berhasil membuat template ${quarterName}: ${createdData.summary.projectsCreated} projects, ${createdData.summary.campaignsCreated} campaigns, ${createdData.summary.routinesCreated} routines, dan ${createdData.summary.tasksCreated} tasks`
        : `Successfully created ${quarterName} template: ${createdData.summary.projectsCreated} projects, ${createdData.summary.campaignsCreated} campaigns, ${createdData.summary.routinesCreated} routines, and ${createdData.summary.tasksCreated} tasks`,
      data: createdData,
    };
  },
});
