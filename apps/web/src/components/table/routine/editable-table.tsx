"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { FilterState } from "../../project/search-filter-content";
import { ContentRoutineStatus, Platform } from "@/types/status";

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

import { EditableTitleCell } from "../editable-title-cell";
import { EditableNotesCell } from "../editable-notes-cell";
import { EditablePlatformCell } from "../editable-platform-cell";
import { EditableRoutineStatusCell } from "../editable-routine-status-cell";

import { Eye } from "lucide-react";
import { MediaItem } from "@packages/backend/convex/schema";

// Routine content type
type RoutineContent = {
  _id: Id<"contentRoutines">;
  _creationTime: number;
  userId: string;
  projectId: Id<"projects">;
  title: string;
  slug?: string;
  notes?: string;
  platform: Platform;
  status: ContentRoutineStatus;
  statusHistory: Array<{
    status: string;
    timestamp: number;
    scheduledAt?: string;
    publishedAt?: string;
    note?: string;
  }>;
  mediaFiles?: Array<MediaItem>;
  statusDurations?: {
    plan_to_in_progress?: string;
    in_progress_to_scheduled?: string;
    scheduled_to_published?: string;
  };
  createdAt: number;
  updatedAt: number;
};

const routineColumnHelper = createColumnHelper<RoutineContent>();

interface EditableRoutineTableProps {
  projectId: Id<"projects">;
  userId: string;
  filters: FilterState;
}

export function EditableRoutineTable({
  projectId,
  userId,
  filters,
}: EditableRoutineTableProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Fetch routines
  const routines = useQuery(api.queries.contentRoutines.getByProject, {
    projectId,
    search: filters.search || undefined,
    status: filters.status.length > 0 ? filters.status : undefined,
    platform: filters.platform.length > 0 ? filters.platform : undefined,
  });

  // Mutations
  const updateRoutine = useMutation(api.mutations.contentRoutines.update);

  const handleNavigate = (slug: string) => {
    router.push(`/${locale}/routines/${slug}`);
  };

  // Routine columns
  const routineColumns = [
    // Selection column
    routineColumnHelper.display({
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
    routineColumnHelper.accessor("title", {
      header: "Name",
      cell: ({ row, getValue }) => (
        <EditableTitleCell
          value={getValue()}
          contentId={row.original._id}
          onUpdate={(newTitle) =>
            updateRoutine({ id: row.original._id, patch: { title: newTitle } })
          }
        />
      ),
    }),

    // Platform column
    routineColumnHelper.accessor("platform", {
      header: "Platform",
      cell: ({ row, getValue }) => (
        <EditablePlatformCell
          value={getValue()}
          contentId={row.original._id}
          onUpdate={(newPlatform) =>
            updateRoutine({
              id: row.original._id,
              patch: { platform: newPlatform },
            })
          }
        />
      ),
    }),

    // Status column
    routineColumnHelper.accessor("status", {
      header: "Status",
      cell: ({ row, getValue }) => (
        <EditableRoutineStatusCell
          value={getValue()}
          routineId={row.original._id}
        />
      ),
    }),

    // Notes column
    routineColumnHelper.accessor("notes", {
      header: "Notes",
      cell: ({ row, getValue }) => (
        <EditableNotesCell
          value={getValue() || ""}
          contentId={row.original._id}
          onUpdate={(newNotes) =>
            updateRoutine({ id: row.original._id, patch: { notes: newNotes } })
          }
        />
      ),
    }),

    // Actions column
    routineColumnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleNavigate(row.original.slug || "");
          }}
        >
          <Eye className="h-3 w-3" />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false,
    }),
  ];

  const table = useReactTable({
    data: routines || [],
    columns: routineColumns,
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

  if (!routines) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-xs text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full space-y-4">
        {/* Table */}
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader className="bg-muted/70">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b border-border"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-foreground text-xs"
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
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/30 transition-colors border-b border-border"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
                    colSpan={routineColumns.length}
                    className="h-16 text-xs text-center text-muted-foreground"
                  >
                    No routines found. Create your first routine to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4 px-1">
          <div className="flex-1 text-xs text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-7 text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-7 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
