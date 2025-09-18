# Feature #1 - Implementation Checklist (Tasks)

This file is a step-by-step plan to ship Projects & Content Planning CRUD with filters, pagination, and status control.

---

## 2) Data Model

- [ ] Implement convex/schema.ts (projects, contents, tasks) with indexes.
- [ ] Create convex/utils/validators.ts (pagination & filters).

## 3) Server Functions

- [ ] projects/queries.ts
- [ ] projects/mutations.ts
- [ ] projects/actions.ts
- [ ] contents/queries.ts
- [ ] contents/mutations.ts
- [ ] contents/actions.ts
- [ ] tasks/queries.ts
- [ ] tasks/mutations.ts
- [ ] tasks/actions.ts

## 4) Client Screens (MVP)

- [ ] Projects page: List (search, infinite load), Create modal.
- [ ] Project detail: Tabs for Contents & Tasks.
- [ ] Content list: Filters (status, platform, date range, search), pagination.
- [ ] Content editor: Title, platform, due date, notes; status buttons.
- [ ] Tasks: Inline create, status toggle, overdue badge.

## 5) Pagination Pattern

- [ ] Use Convex paginate in queries; return { items, cursor, isDone }.
- [ ] In client, keep cursor state and pass it back to the query params to fetch next page.
- [ ] Page size default 20; cap at 100.

## 6) Filters

- [ ] Server-side filters for projectId, status[], platform[], dateFrom/dateTo, search.
- [ ] Index coverage: by_user, by_user_project, by_user_status, by_user_platform, by_user_dueDate.
- [ ] Client UI: multi-select chips + date pickers + search input.

## 7) Status Rules

- [ ] Content: draft -> in_progress -> scheduled -> published
- [ ] scheduled requires scheduledAt.
- [ ] published sets publishedAt (immutable once set).
- [ ] Tasks: todo -> doing -> done.

## 8) Testing

- [ ] Unit tests for queries/mutations (auth guard, filters, pagination).
- [ ] Transition tests: invalid state changes rejected.
- [ ] Seed action for demo data.
- [ ] Basic e2e smoke (create project -> add content -> set scheduled -> set published).

## 9) MCP (Optional)

- [ ] Define MCP server URL and contract (tool name, inputs/outputs).
- [ ] Convex Action that calls MCP (HTTP bridge) and returns ideas/captions.
- [ ] UI button: "Generate 10 ideas" (disabled without key).

## 10) Ready for V1

- [ ] Docs updated (these three files).
- [ ] Screens demo recorded.
- [ ] PR checklist passed.
