"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Column, ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import { Icons } from "@/components/icons";
import { useDataTable } from "@/hooks/use-data-table";
import { getSortingStateParser } from "@/lib/parsers";
import type { GalleryImage } from "@/lib/generated/prisma/client";
import { galleryQueryOptions } from "@/features/gallery/api";
import { galleryStatusOptions } from "@/features/gallery/schema";
import { CellAction } from "@/features/gallery/cell-action";

const ALL_STATUSES = "all";
const FEATURED_ONLY = "featured";
const ALL_IMAGES = "all";

const columns: ColumnDef<GalleryImage>[] = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <div className="relative aspect-square h-12 w-12">
        <Image
          src={row.getValue("image")}
          alt={row.original.title ?? "Gallery image"}
          fill
          sizes="80px"
          className="rounded-lg border object-cover"
        />
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "title",
    accessorKey: "title",
    header: ({ column }: { column: Column<GalleryImage, unknown> }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ cell }) => (
      <div>{cell.getValue<GalleryImage["title"]>() ?? "—"}</div>
    ),
    meta: {
      label: "Title",
      placeholder: "Search gallery...",
      variant: "text",
      icon: Icons.text,
    },
    enableColumnFilter: true,
  },
  {
    id: "category",
    accessorKey: "category",
    header: ({ column }: { column: Column<GalleryImage, unknown> }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ cell }) => (
      <div>{cell.getValue<GalleryImage["category"]>() ?? "—"}</div>
    ),
  },
  {
    id: "featured",
    accessorKey: "featured",
    header: ({ column }: { column: Column<GalleryImage, unknown> }) => (
      <DataTableColumnHeader column={column} title="Featured" />
    ),
    cell: ({ cell }) =>
      cell.getValue<GalleryImage["featured"]>() ? (
        <Badge variant="outline">Featured</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }: { column: Column<GalleryImage, unknown> }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<GalleryImage["status"]>();
      return (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <CellAction data={row.original} />
      </div>
    ),
    size: 48,
    enableSorting: false,
    enableHiding: false,
  },
];

const columnIds = columns.map((c) => c.id).filter(Boolean) as string[];

export function GalleryTable() {
  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    title: parseAsString,
    status: parseAsString,
    featured: parseAsString,
    sort: getSortingStateParser(columnIds).withDefault([]),
  });

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.title && { search: params.title }),
    ...(params.status && { status: params.status }),
    ...(params.featured === FEATURED_ONLY && { featured: "true" }),
    ...(params.sort.length > 0 && { sort: JSON.stringify(params.sort) }),
  };

  const { data } = useQuery(galleryQueryOptions(filters));
  const images = data?.images ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / params.perPage));

  const { table } = useDataTable({
    data: images,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { right: ["actions"] },
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">Status:</span>
        <Select
          value={params.status ?? ALL_STATUSES}
          onValueChange={(value) =>
            setParams({
              status: value === ALL_STATUSES ? null : value,
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
            {galleryStatusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm font-medium">Featured:</span>
        <Select
          value={params.featured ?? ALL_IMAGES}
          onValueChange={(value) =>
            setParams({
              featured: value === ALL_IMAGES ? null : value,
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="All images" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_IMAGES}>All images</SelectItem>
            <SelectItem value={FEATURED_ONLY}>Featured only</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
