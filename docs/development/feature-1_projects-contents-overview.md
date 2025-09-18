# Feature #1 - Projects & Content Planning (CRUD): Product Instructions

Scope: Create and manage Projects (campaign/series/routine), break them down into Content items and Tasks, and track Status across the lifecycle (draft -> in_progress -> scheduled -> published).
Stack: Turborepo (apps/web, packages/backend/convex/), Next.js, Convex, Clerk for auth and MCP Convex.

---

## 1) Domain Concepts

- Project

  - type: "campaign" | "series" | "routine"
  - Owns Content and Tasks.
  - Dates: startDate, endDate (optional).

- Content

  - Child of a Project.
  - Fields: title, platform ("tiktok" | "instagram" | "youtube" | "x" | "facebook" | "threads" | "other"), status ("draft" | "in_progress" | "scheduled" | "published"), dueDate, scheduledAt, publishedAt, notes.
  - Optional assetIds (Convex Storage) & aiMetadata (prompt, model, etc.).

- Task
  - Optional, independent or tied to a specific contentId.
  - Fields: title, status ("todo" | "doing" | "done"), dueDate, assignee (future multi-user).

---

## 2) User Stories & Acceptance Criteria

Create Project

- As a user I can create a Project with title, type, description and optional dates.
- AC: Only authenticated users; project listed in Projects with newest first; owner scoping applied.

Plan Content

- As a user I can add Content items to a Project with title, platform, and dueDate.
- AC: Default status="draft", filterable by platform, status, and due date ranges; paginated lists.

Track Status

- As a user I can move Content status through draft -> in_progress -> scheduled -> published.
- AC: Timestamps captured: scheduledAt/publishedAt; updatedAt updated automatically.

Tasks

- As a user I can create Tasks tied to a Project (and optionally a Content item), set dueDate, and complete them.
- AC: Task lists are filterable (status, overdue), and sorted by dueDate (asc).

---

## 3) Status Model & Transitions

- Content.status: draft -> in_progress -> scheduled -> published
- Rules:
  - Setting scheduled requires scheduledAt.
  - Setting published sets publishedAt (server time).
  - Any backward transition allowed but timestamps are preserved once set (do not clear).

---

## 4) Pagination & Filtering (UX expectations)

- Default page size: 20.
- Filters: status[], platform[], dateFrom/dateTo, search (prefix on title), projectId.
- Sorts: dueDate asc (tasks), createdAt desc (projects/contents), with secondary tie-breakers by \_creationTime desc.

---

## 5) Done =

- CRUD for Projects/Content/Tasks with owner scoping.
- Filters + pagination implemented in queries.
- Status transitions validated in mutations.
- Unit tests for functions (happy path + guard rails).
- Basic seeds for demo.
