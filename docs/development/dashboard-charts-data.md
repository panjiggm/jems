# Dashboard Charts Data Analysis

Dokumen ini menjelaskan query-query dari `dashboard.ts` yang bisa dijadikan chart dan bentuk datanya.

## 1. Social Media Overview Charts

### Query: `getSocialMediaOverview`

#### A. Followers Growth Chart (Line Chart)
**Data:** `platforms` array
**Bentuk Data:**
```typescript
{
  platforms: [
    {
      account: { platform: "instagram", ... },
      latestStats: { followersCount: 1000, followingCount: 500, ... },
      previousStats: { followersCount: 950, followingCount: 480, ... },
      growth: {
        followersChange: 50,  // +50 followers
        followingChange: 20,   // +20 following
        platformMetricsChanges: { ... }
      }
    }
  ]
}
```
**Chart Type:** Line Chart dengan 2 series (followers & following)
**X-axis:** Platform names
**Y-axis:** Count
**Series:**
- Latest followers/following
- Previous followers/following
- Growth indicator (arrow up/down)

#### B. Platform Distribution (Pie/Donut Chart)
**Data:** `byPlatform` object
**Bentuk Data:**
```typescript
{
  byPlatform: {
    "instagram": {
      account: { ... },
      latestStats: { followersCount: 1000, ... },
      growth: { followersChange: 50, ... },
      engagementRate: 3.5
    },
    "youtube": { ... }
  }
}
```
**Chart Type:** Pie/Donut Chart
**Data Points:** Object keys (platform names)
**Values:** `latestStats.followersCount` atau `totals.followers` per platform

#### C. Engagement Rate Comparison (Bar Chart)
**Data:** `byPlatform` object
**Bentuk Data:**
```typescript
{
  byPlatform: {
    "instagram": { engagementRate: 3.5 },
    "youtube": { engagementRate: 2.1 }
  }
}
```
**Chart Type:** Horizontal/Vertical Bar Chart
**X-axis:** Platform names
**Y-axis:** Engagement rate (percentage)

---

## 2. Content Pipeline Charts

### Query: `getContentPipeline` atau `getDashboardOverview.contentPipeline`

#### A. Campaigns by Status (Pie Chart)
**Data:** `campaigns.byStatus`
**Bentuk Data:**
```typescript
{
  campaigns: {
    byStatus: {
      product_obtained: 5,
      production: 10,
      published: 15,
      payment: 3,
      done: 20
    }
  }
}
```
**Chart Type:** Pie/Donut Chart
**Data Points:** Status names
**Values:** Count per status

#### B. Campaigns by Type (Pie Chart)
**Data:** `campaigns.byType`
**Bentuk Data:**
```typescript
{
  campaigns: {
    byType: {
      barter: 30,
      paid: 20
    }
  }
}
```
**Chart Type:** Pie Chart
**Data Points:** "Barter" dan "Paid"
**Values:** Count per type

#### C. Content Distribution by Platform (Stacked Bar Chart)
**Data:** `byPlatform`
**Bentuk Data:**
```typescript
{
  byPlatform: {
    "instagram": {
      campaigns: 10,
      routines: 15,
      total: 25,
      published: 8,
      scheduled: 5
    },
    "youtube": { ... }
  }
}
```
**Chart Type:** Stacked Bar Chart
**X-axis:** Platform names
**Y-axis:** Count
**Stacks:**
- Campaigns
- Routines
- Published
- Scheduled

#### D. Routines by Status (Bar Chart)
**Data:** `routines.byStatus`
**Bentuk Data:**
```typescript
{
  routines: {
    byStatus: {
      plan: 5,
      in_progress: 10,
      scheduled: 8,
      published: 12
    }
  }
}
```
**Chart Type:** Vertical Bar Chart
**X-axis:** Status names
**Y-axis:** Count

---

## 3. Tasks Overview Charts

### Query: `getDashboardOverview.tasks`

#### A. Tasks by Status (Pie Chart)
**Data:** `tasks.byStatus`
**Bentuk Data:**
```typescript
{
  tasks: {
    byStatus: {
      todo: 10,
      doing: 5,
      done: 20,
      skipped: 2
    },
    completionRate: 54  // percentage
  }
}
```
**Chart Type:** Pie Chart
**Data Points:** Status names
**Values:** Count per status

#### B. Task Completion Rate (Gauge/Progress Chart)
**Data:** `tasks.completionRate`
**Bentuk Data:**
```typescript
{
  tasks: {
    completionRate: 54  // 54%
  }
}
```
**Chart Type:** Gauge/Progress Ring Chart
**Value:** `completionRate` (0-100)
**Color:** 
- Green: 70-100%
- Yellow: 40-69%
- Red: 0-39%

---

## 4. Revenue Tracking Charts

### Query: `getRevenueOverview`

#### A. Paid Campaigns by Payment Status (Pie Chart)
**Data:** `byPaymentStatus`
**Bentuk Data:**
```typescript
{
  byPaymentStatus: {
    product_obtained: 5,
    production: 10,
    published: 8,
    payment: 3,
    done: 15
  }
}
```
**Chart Type:** Pie Chart
**Data Points:** Payment status names
**Values:** Count per status

#### B. Pipeline Health (Bar Chart)
**Data:** `pipelineHealth`
**Bentuk Data:**
```typescript
{
  pipelineHealth: {
    total: 41,
    inProgress: 18,      // production + published
    awaitingPayment: 3,
    completed: 15,
    completionRate: 37,  // percentage
    stuckInPayment: 3
  }
}
```
**Chart Type:** Horizontal Bar Chart
**Bars:**
- Total
- In Progress
- Awaiting Payment
- Completed
- Stuck in Payment

#### C. Average Duration per Stage (Bar Chart)
**Data:** `averageDurations`
**Bentuk Data:**
```typescript
{
  averageDurations: {
    product_obtained_to_production: 5.5,  // days
    production_to_published: 7.2,
    published_to_payment: 3.1,
    payment_to_done: 2.8
  }
}
```
**Chart Type:** Vertical Bar Chart
**X-axis:** Stage transitions
**Y-axis:** Average days

---

## 5. Recent Performance Charts

### Query: `getRecentPerformance`

#### A. Success Rate by Platform (Bar Chart)
**Data:** `byPlatform`
**Bentuk Data:**
```typescript
{
  byPlatform: {
    "instagram": {
      published: 45,
      failed: 5,
      successRate: 90,  // percentage
      total: 50
    },
    "youtube": { ... }
  }
}
```
**Chart Type:** Grouped Bar Chart
**X-axis:** Platform names
**Y-axis:** Count/Percentage
**Bars:** Published vs Failed

#### B. Overall Success Rate (Gauge Chart)
**Data:** `summary.successRate`
**Bentuk Data:**
```typescript
{
  summary: {
    totalAttempts: 100,
    published: 85,
    failed: 15,
    successRate: 85  // percentage
  }
}
```
**Chart Type:** Gauge Chart
**Value:** `successRate` (0-100)

#### C. Publishing Timeline (Line Chart)
**Data:** `recentPublished` (perlu di-group by date)
**Bentuk Data:**
```typescript
{
  recentPublished: [
    {
      schedule: { publishedAt: 1234567890, platform: "instagram", ... },
      ...
    }
  ]
}
```
**Chart Type:** Line Chart
**X-axis:** Dates (last 30 days)
**Y-axis:** Count of publishes
**Series:** Per platform (optional)

---

## 6. Social Media Stats from Dashboard Overview

### Query: `getDashboardOverview.socialMedia`

#### A. Followers by Platform (Bar Chart)
**Data:** `socialMedia.byPlatform`
**Bentuk Data:**
```typescript
{
  socialMedia: {
    byPlatform: {
      "instagram": {
        followers: 1000,
        following: 500,
        connected: true
      },
      "youtube": { ... }
    }
  }
}
```
**Chart Type:** Vertical Bar Chart
**X-axis:** Platform names
**Y-axis:** Followers count

---

## 7. Recent Activity Charts

### Query: `getDashboardOverview.recentActivity`

#### A. Activity Timeline (Area Chart)
**Data:** `recentActivity`
**Bentuk Data:**
```typescript
{
  recentActivity: {
    recentProjects: 5,
    recentCampaigns: 10,
    recentRoutines: 8,
    recentTasks: 15,
    recentPublishes: 12
  }
}
```
**Chart Type:** Area Chart atau Stacked Bar Chart
**X-axis:** Activity types
**Y-axis:** Count
**Series:** Different activity types

---

## Summary: Recommended Charts Priority

### High Priority (Most Useful):
1. **Social Media Followers Growth** - Line Chart (`getSocialMediaOverview`)
2. **Content Pipeline Status** - Pie Chart (`getContentPipeline.campaigns.byStatus`)
3. **Task Completion Rate** - Gauge Chart (`getDashboardOverview.tasks.completionRate`)
4. **Revenue Pipeline Health** - Bar Chart (`getRevenueOverview.pipelineHealth`)
5. **Publishing Success Rate** - Gauge Chart (`getRecentPerformance.summary.successRate`)

### Medium Priority:
6. **Platform Distribution** - Pie Chart (`getSocialMediaOverview.byPlatform`)
7. **Content by Platform** - Stacked Bar Chart (`getContentPipeline.byPlatform`)
8. **Average Duration per Stage** - Bar Chart (`getRevenueOverview.averageDurations`)

### Low Priority (Nice to Have):
9. **Activity Timeline** - Area Chart (`getDashboardOverview.recentActivity`)
10. **Engagement Rate Comparison** - Bar Chart (`getSocialMediaOverview.byPlatform`)

---

## Data Transformation Examples

### Example 1: Convert `byPlatform` object to chart data
```typescript
// Input
{
  byPlatform: {
    "instagram": { followers: 1000, following: 500 },
    "youtube": { followers: 2000, following: 800 }
  }
}

// Output for Bar Chart
[
  { platform: "Instagram", followers: 1000, following: 500 },
  { platform: "YouTube", followers: 2000, following: 800 }
]
```

### Example 2: Convert `byStatus` object to pie chart data
```typescript
// Input
{
  byStatus: {
    product_obtained: 5,
    production: 10,
    published: 15
  }
}

// Output for Pie Chart
[
  { name: "Product Obtained", value: 5 },
  { name: "Production", value: 10 },
  { name: "Published", value: 15 }
]
```

### Example 3: Convert timeline data for line chart
```typescript
// Input: Array of items with dates
recentPublished: [
  { publishedAt: 1234567890, platform: "instagram" },
  { publishedAt: 1234567891, platform: "youtube" }
]

// Output: Grouped by date
[
  { date: "2024-01-01", instagram: 5, youtube: 3 },
  { date: "2024-01-02", instagram: 8, youtube: 2 }
]
```

