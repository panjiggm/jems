"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { FilterState } from "../project/search-filter-content";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { EditableStatusCell } from "./editable-status-cell";
import { EditableDateCell } from "./editable-date-cell";
import { EditablePlatformCell } from "./editable-platform-cell";
import { EditableTitleCell } from "./editable-title-cell";
import { EditableNotesCell } from "./editable-notes-cell";
import { EditableTypeCell } from "./editable-type-cell";

import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
} from "lucide-react";

type Content = {
  _id: Id<"contents">;
  _creationTime: number;
  userId: string;
  projectId: Id<"projects">;
  title: string;
  platform:
    | "tiktok"
    | "instagram"
    | "youtube"
    | "x"
    | "facebook"
    | "threads"
    | "other";
  status:
    | "confirmed"
    | "shipped"
    | "received"
    | "shooting"
    | "drafting"
    | "editing"
    | "done"
    | "pending_payment"
    | "paid"
    | "canceled"
    | "ideation"
    | "scripting"
    | "scheduled"
    | "published"
    | "archived"
    | "planned"
    | "skipped";
  type: "campaign" | "series" | "routine";
  phase: "plan" | "production" | "review" | "published" | "done";
  dueDate?: string;
  scheduledAt?: string;
  publishedAt?: string;
  notes?: string;
  assetIds?: string[];
  aiMetadata?: any;
  createdAt: number;
  updatedAt: number;
};

const columnHelper = createColumnHelper<Content>();

interface EditableTableProps {
  projectId: Id<"projects">;
  userId: string;
  filters: FilterState;
}

export function EditableTable({
  projectId,
  userId,
  filters,
}: EditableTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Fetch data
  const contents = useQuery(api.queries.contents.getByProject, {
    projectId,
    search: filters.search || undefined,
    status: filters.status.length > 0 ? filters.status : undefined,
    priority: filters.priority.length > 0 ? filters.priority : undefined,
    platform: filters.platform.length > 0 ? filters.platform : undefined,
  });
  const updateContent = useMutation(api.mutations.contents.update);
  const setStatus = useMutation(api.mutations.contents.setStatus);

  const columns = [
    // Selection column
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }),

    // Title column
    columnHelper.accessor("title", {
      header: "Name",
      cell: ({ row, getValue }) => (
        <EditableTitleCell
          value={getValue()}
          contentId={row.original._id}
          onUpdate={(newTitle) =>
            updateContent({ id: row.original._id, patch: { title: newTitle } })
          }
        />
      ),
    }),

    // Platform column
    columnHelper.accessor("platform", {
      header: "Platform",
      cell: ({ row, getValue }) => (
        <EditablePlatformCell
          value={getValue()}
          contentId={row.original._id}
          onUpdate={(newPlatform) =>
            updateContent({
              id: row.original._id,
              patch: { platform: newPlatform },
            })
          }
        />
      ),
    }),

    // Status column
    // columnHelper.accessor("status", {
    //   header: "Status",
    //   cell: ({ row, getValue }) => (
    //     <EditableStatusCell
    //       value={getValue()}
    //       contentId={row.original._id}
    //       onUpdate={(newStatus) =>
    //         setStatus({ id: row.original._id, status: newStatus })
    //       }
    //     />
    //   ),
    // }),

    // Type column
    columnHelper.accessor("type", {
      header: "Type",
      cell: ({ row, getValue }) => (
        <EditableTypeCell
          value={getValue()}
          contentId={row.original._id}
          onUpdate={(newType) =>
            updateContent({
              id: row.original._id,
              patch: { type: newType },
            })
          }
        />
      ),
    }),

    // Due Date column
    columnHelper.accessor("dueDate", {
      header: "Deadline",
      cell: ({ row, getValue }) => (
        <EditableDateCell
          value={getValue()}
          contentId={row.original._id}
          onUpdate={(newDate) =>
            updateContent({ id: row.original._id, patch: { dueDate: newDate } })
          }
        />
      ),
    }),

    // Notes column
    columnHelper.accessor("notes", {
      header: "Notes",
      cell: ({ row, getValue }) => (
        <EditableNotesCell
          value={getValue() || ""}
          contentId={row.original._id}
          onUpdate={(newNotes) =>
            updateContent({ id: row.original._id, patch: { notes: newNotes } })
          }
        />
      ),
    }),

    // Actions column
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    }),
  ];

  const table = useReactTable({
    data: contents || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  if (!contents) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader className="bg-muted/70">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-semibold text-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No content found. Create your first content to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4 px-1">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
