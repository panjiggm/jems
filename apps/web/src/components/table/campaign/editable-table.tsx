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
import {
  ContentCampaignStatus,
  ContentCampaignType,
  Platform,
} from "@/types/status";

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
import { EditableCampaignStatusCell } from "../editable-campaign-status-cell";
import { EditableCampaignTypeCell } from "../editable-campaign-type-cell";

import { Eye } from "lucide-react";
import { MediaItem } from "@packages/backend/convex/schema";

// Campaign content type
type CampaignContent = {
  _id: Id<"contentCampaigns">;
  _creationTime: number;
  userId: string;
  projectId: Id<"projects">;
  title: string;
  slug?: string;
  sow?: string;
  platform: Platform;
  type: ContentCampaignType;
  status: ContentCampaignStatus;
  statusHistory: Array<{
    status: string;
    timestamp: number;
    publishedAt?: string;
    note?: string;
  }>;
  mediaFiles?: Array<MediaItem>;
  statusDurations?: {
    product_obtained_to_production?: string;
    production_to_published?: string;
    published_to_payment?: string;
    payment_to_done?: string;
  };
  notes?: string;
  createdAt: number;
  updatedAt: number;
};

const campaignColumnHelper = createColumnHelper<CampaignContent>();

interface EditableCampaignTableProps {
  projectId: Id<"projects">;
  userId: string;
  filters: FilterState;
}

export function EditableCampaignTable({
  projectId,
  userId,
  filters,
}: EditableCampaignTableProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Fetch campaigns
  const campaigns = useQuery(api.queries.contentCampaigns.getByProject, {
    projectId,
    search: filters.search || undefined,
    status: filters.status.length > 0 ? filters.status : undefined,
    types: filters.campaignTypes.length > 0 ? filters.campaignTypes : undefined,
    platform: filters.platform.length > 0 ? filters.platform : undefined,
  });

  // Mutations
  const updateCampaign = useMutation(api.mutations.contentCampaigns.update);
  const setCampaignStatus = useMutation(
    api.mutations.contentCampaigns.setStatus,
  );

  const handleNavigate = (slug: string) => {
    router.push(`/${locale}/campaigns/${slug}`);
  };

  // Campaign columns
  const campaignColumns = [
    // Selection column
    campaignColumnHelper.display({
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
    campaignColumnHelper.accessor("title", {
      header: "Name",
      cell: ({ row, getValue }) => (
        <EditableTitleCell
          value={getValue()}
          contentId={row.original._id}
          onUpdate={(newTitle) =>
            updateCampaign({ id: row.original._id, patch: { title: newTitle } })
          }
        />
      ),
    }),

    // Platform column
    campaignColumnHelper.accessor("platform", {
      header: "Platform",
      cell: ({ row, getValue }) => (
        <EditablePlatformCell
          value={getValue()}
          contentId={row.original._id}
          onUpdate={(newPlatform) =>
            updateCampaign({
              id: row.original._id,
              patch: { platform: newPlatform },
            })
          }
        />
      ),
    }),

    // Campaign Type column (barter/paid)
    campaignColumnHelper.accessor("type", {
      header: "Type",
      cell: ({ row, getValue }) => (
        <EditableCampaignTypeCell
          value={getValue()}
          campaignId={row.original._id}
        />
      ),
    }),

    // Status column
    campaignColumnHelper.accessor("status", {
      header: "Status",
      cell: ({ row, getValue }) => (
        <EditableCampaignStatusCell
          value={getValue()}
          campaignId={row.original._id}
        />
      ),
    }),

    // Notes column
    campaignColumnHelper.accessor("notes", {
      header: "Notes",
      cell: ({ row, getValue }) => (
        <EditableNotesCell
          value={getValue() || ""}
          contentId={row.original._id}
          onUpdate={(newNotes) =>
            updateCampaign({ id: row.original._id, patch: { notes: newNotes } })
          }
        />
      ),
    }),

    // Actions column
    campaignColumnHelper.display({
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
    data: campaigns || [],
    columns: campaignColumns,
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

  if (!campaigns) {
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
                    colSpan={campaignColumns.length}
                    className="h-16 text-xs text-center text-muted-foreground"
                  >
                    No campaigns found. Create your first campaign to get
                    started.
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
