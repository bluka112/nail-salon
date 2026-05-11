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
import type { Testimonial } from "@/lib/generated/prisma/client";
import { testimonialsQueryOptions } from "@/features/testimonials/api";
import { testimonialStatusOptions } from "@/features/testimonials/schema";
import { CellAction } from "@/features/testimonials/cell-action";

const ALL_STATUSES = "all";
const FEATURED_ONLY = "featured";
const ALL_TESTIMONIALS = "all";

const columns: ColumnDef<Testimonial>[] = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <div className="relative aspect-square h-12 w-12">
        {row.getValue("image") ? (
          <Image
            src={row.getValue("image")}
            alt={row.getValue("name")}
            fill
            sizes="80px"
            className="rounded-lg border object-cover"
          />
        ) : null}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }: { column: Column<Testimonial, unknown> }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Testimonial["name"]>()}</div>,
    meta: {
      label: "Name",
      placeholder: "Search testimonial...",
      variant: "text",
      icon: Icons.text,
    },
    enableColumnFilter: true,
  },
  {
    id: "service",
    accessorKey: "service",
    header: ({ column }: { column: Column<Testimonial, unknown> }) => (
      <DataTableColumnHeader column={column} title="Service" />
    ),
    cell: ({ cell }) => (
      <div>{cell.getValue<Testimonial["service"]>() ?? "—"}</div>
    ),
  },
  {
    id: "rating",
    accessorKey: "rating",
    header: ({ column }: { column: Column<Testimonial, unknown> }) => (
      <DataTableColumnHeader column={column} title="Rating" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Testimonial["rating"]>()}/5</div>,
  },
  {
    id: "featured",
    accessorKey: "featured",
    header: ({ column }: { column: Column<Testimonial, unknown> }) => (
      <DataTableColumnHeader column={column} title="Featured" />
    ),
    cell: ({ cell }) =>
      cell.getValue<Testimonial["featured"]>() ? (
        <Badge variant="outline">Featured</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }: { column: Column<Testimonial, unknown> }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<Testimonial["status"]>();
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

export function TestimonialTable() {
  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString,
    status: parseAsString,
    featured: parseAsString,
    sort: getSortingStateParser(columnIds).withDefault([]),
  });

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.name && { search: params.name }),
    ...(params.status && { status: params.status }),
    ...(params.featured === FEATURED_ONLY && { featured: "true" }),
    ...(params.sort.length > 0 && { sort: JSON.stringify(params.sort) }),
  };

  const { data } = useQuery(testimonialsQueryOptions(filters));
  const testimonials = data?.testimonials ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / params.perPage));

  const { table } = useDataTable({
    data: testimonials,
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
            {testimonialStatusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm font-medium">Featured:</span>
        <Select
          value={params.featured ?? ALL_TESTIMONIALS}
          onValueChange={(value) =>
            setParams({
              featured: value === ALL_TESTIMONIALS ? null : value,
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="All testimonials" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TESTIMONIALS}>All testimonials</SelectItem>
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
