"use client";

import * as React from "react";
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
} from "@tanstack/react-table";
import { useConvex, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Trash2, Download, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useTranslations } from "@/hooks/use-translations";

type MediaItem = {
  storageId: Id<"_storage">;
  filename: string;
  size: number;
  contentType: string;
  extension: string;
  durationMs?: number;
  width?: number;
  height?: number;
  uploadedAt: number;
};

interface ContentWithMedia {
  contentId: string;
  contentType: "campaign" | "routine";
  title: string;
  slug?: string | null;
  platform: string;
  mediaFiles: MediaItem[];
  projectId: string;
  projectTitle: string;
  updatedAt: number;
}

interface MediaListGroupedProps {
  contents: ContentWithMedia[];
}

// Flattened media item with content context
type FlatMediaItem = MediaItem & {
  contentId: string;
  contentType: "campaign" | "routine";
  contentTitle: string;
  projectTitle: string;
};

const mediaColumnHelper = createColumnHelper<FlatMediaItem>();

export function MediaListTable({ contents }: MediaListGroupedProps) {
  const { t } = useTranslations();
  const convex = useConvex();
  const removeCampaignMedia = useMutation(
    api.mutations.media.removeCampaignMedia,
  );
  const removeRoutineMedia = useMutation(
    api.mutations.media.removeRoutineMedia,
  );

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "uploadedAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [mediaToDelete, setMediaToDelete] = React.useState<{
    contentId: string;
    contentType: "campaign" | "routine";
    storageId: Id<"_storage">;
    filename: string;
  } | null>(null);

  // Flatten the data structure
  const flattenedData = React.useMemo(() => {
    const flattened: FlatMediaItem[] = [];
    contents.forEach((content) => {
      content.mediaFiles.forEach((media) => {
        flattened.push({
          ...media,
          contentId: content.contentId,
          contentType: content.contentType,
          contentTitle: content.title,
          projectTitle: content.projectTitle,
        });
      });
    });
    return flattened;
  }, [contents]);

  const handleView = async (storageId: Id<"_storage">) => {
    try {
      const result = await convex.query(api.queries.media.getFileUrl, {
        storageId,
      });
      if (!result || !result.url) {
        toast.error(
          result
            ? t("drive.errors.fileNotFound")
            : t("drive.errors.notAuthenticated"),
        );
        return;
      }
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      toast.error(t("drive.errors.failedToOpenFile"));
    }
  };

  const handleDownload = async (
    storageId: Id<"_storage">,
    filename: string,
  ) => {
    try {
      const result = await convex.query(api.queries.media.getFileUrl, {
        storageId,
      });
      if (!result || !result.url) {
        toast.error(
          result
            ? t("drive.errors.fileNotFound")
            : t("drive.errors.notAuthenticated"),
        );
        return;
      }
      const a = document.createElement("a");
      a.href = result.url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(t("drive.errors.downloadStarted"));
    } catch (err) {
      console.error(err);
      toast.error(t("drive.errors.failedToDownloadFile"));
    }
  };

  const openDeleteDialog = (
    contentId: string,
    contentType: "campaign" | "routine",
    storageId: Id<"_storage">,
    filename: string,
  ) => {
    setMediaToDelete({ contentId, contentType, storageId, filename });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!mediaToDelete) return;

    try {
      if (mediaToDelete.contentType === "campaign") {
        await removeCampaignMedia({
          campaignId: mediaToDelete.contentId as Id<"contentCampaigns">,
          storageId: mediaToDelete.storageId,
        });
      } else {
        await removeRoutineMedia({
          routineId: mediaToDelete.contentId as Id<"contentRoutines">,
          storageId: mediaToDelete.storageId,
        });
      }
      toast.success(t("drive.errors.mediaDeletedSuccessfully"));
      setDeleteDialogOpen(false);
      setMediaToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error(t("drive.errors.failedToDeleteMedia"));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileTypeIcon = (contentType: string, extension: string): string => {
    if (contentType.startsWith("image/")) return "🖼️";
    if (contentType.startsWith("video/")) return "🎥";
    if (contentType.startsWith("audio/")) return "🎵";
    if (contentType.includes("pdf")) return "📄";
    if (contentType.includes("word") || extension === "docx") return "📝";
    if (contentType.includes("sheet") || extension === "xlsx") return "📊";
    return "📎";
  };

  // Define columns
  const columns = [
    mediaColumnHelper.display({
      id: "icon",
      header: "",
      cell: ({ row }) => (
        <div className="text-lg">
          {getFileTypeIcon(row.original.contentType, row.original.extension)}
        </div>
      ),
      size: 40,
    }),
    mediaColumnHelper.accessor("filename", {
      header: t("drive.table.filename"),
      cell: ({ getValue }) => (
        <div className="font-medium text-sm truncate max-w-[200px]">
          {getValue()}
        </div>
      ),
    }),
    mediaColumnHelper.accessor("contentTitle", {
      header: t("drive.table.content"),
      cell: ({ getValue }) => (
        <div className="text-sm truncate max-w-[150px]">{getValue()}</div>
      ),
    }),
    mediaColumnHelper.accessor("projectTitle", {
      header: t("drive.table.project"),
      cell: ({ getValue }) => (
        <div className="text-sm text-muted-foreground truncate max-w-[150px]">
          {getValue()}
        </div>
      ),
    }),
    mediaColumnHelper.accessor("size", {
      header: t("drive.table.size"),
      cell: ({ getValue }) => (
        <div className="text-sm text-muted-foreground">
          {formatFileSize(getValue())}
        </div>
      ),
      size: 80,
    }),
    mediaColumnHelper.accessor("extension", {
      header: t("drive.table.type"),
      cell: ({ getValue }) => (
        <div className="text-sm text-muted-foreground uppercase">
          {getValue()}
        </div>
      ),
      size: 60,
    }),
    mediaColumnHelper.accessor("uploadedAt", {
      header: t("drive.table.uploaded"),
      cell: ({ getValue }) => (
        <div className="text-sm text-muted-foreground">
          {format(new Date(getValue()), "MMM d, yyyy")}
        </div>
      ),
      size: 100,
    }),
    mediaColumnHelper.display({
      id: "actions",
      header: t("drive.table.actions"),
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => handleView(row.original.storageId)}
            className="h-7 w-7 p-0"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">{t("drive.media.actions.view")}</span>
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() =>
              handleDownload(row.original.storageId, row.original.filename)
            }
            className="h-7 w-7 p-0"
          >
            <Download className="h-4 w-4" />
            <span className="sr-only">{t("drive.media.actions.download")}</span>
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() =>
              openDeleteDialog(
                row.original.contentId,
                row.original.contentType,
                row.original.storageId,
                row.original.filename,
              )
            }
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">{t("drive.media.actions.delete")}</span>
          </Button>
        </div>
      ),
      size: 120,
    }),
  ];

  const table = useReactTable({
    data: flattenedData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  if (flattenedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-sm text-muted-foreground">
          {t("drive.allFiles.noFilesFound")}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {t("drive.allFiles.uploadFilesToGetStarted")}
        </p>
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
                    colSpan={columns.length}
                    className="h-16 text-xs text-center text-muted-foreground"
                  >
                    {t("drive.allFiles.noFilesFound")}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4 px-1">
          <div className="flex-1 text-xs text-muted-foreground">
            {t("drive.table.showing")} {table.getRowModel().rows.length}{" "}
            {t("drive.table.of")} {table.getFilteredRowModel().rows.length}{" "}
            {t("drive.table.file")}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-7 text-xs"
            >
              {t("drive.table.previous")}
            </Button>
            <div className="text-xs text-muted-foreground">
              {t("drive.table.page")}{" "}
              {table.getState().pagination.pageIndex + 1} {t("drive.table.of")}{" "}
              {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-7 text-xs"
            >
              {t("drive.table.next")}
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>{t("drive.media.deleteDialog.title")}</DialogTitle>
            </div>
            <DialogDescription className="pt-3">
              {t("drive.media.deleteDialog.description")}{" "}
              <span className="font-semibold text-foreground">
                {mediaToDelete?.filename}
              </span>
              ? {t("drive.media.deleteDialog.warning")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t("drive.media.deleteDialog.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t("drive.media.deleteDialog.confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
