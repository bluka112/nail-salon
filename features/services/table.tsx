// Listing table. URL search params (page, perPage, name, sort, category) are
// kept in sync with the URL via nuqs and passed as filters to the query.
"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Column, ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "@/components/icons";
import { useDataTable } from "@/hooks/use-data-table";
import { getSortingStateParser } from "@/lib/parsers";
import type { Service } from "@/lib/generated/prisma/client";
import { servicesQueryOptions } from "@/features/services/api";
import {
  serviceCategoryOptions,
  serviceStatusOptions,
} from "@/features/services/schema";
import { CellAction } from "@/features/services/cell-action";

const ALL_CATEGORIES = "all";
const ALL_STATUSES = "all";

const categoryLabels = Object.fromEntries(
  serviceCategoryOptions.map((option) => [option.value, option.label]),
) as Record<Service["category"], string>;

const columns: ColumnDef<Service>[] = [
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
    header: ({ column }: { column: Column<Service, unknown> }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Service["name"]>()}</div>,
    meta: {
      label: "Name",
      placeholder: "Search service...",
      variant: "text",
      icon: Icons.text,
    },
    enableColumnFilter: true,
  },
  {
    id: "category",
    accessorKey: "category",
    header: ({ column }: { column: Column<Service, unknown> }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ cell }) => {
      const category = cell.getValue<Service["category"]>();
      return <div>{categoryLabels[category]}</div>;
    },
  },
  {
    id: "price",
    accessorKey: "price",
    header: ({ column }: { column: Column<Service, unknown> }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ cell }) => (
      <div>${cell.getValue<Service["price"]>().toFixed(2)}</div>
    ),
  },
  {
    id: "duration",
    accessorKey: "duration",
    header: ({ column }: { column: Column<Service, unknown> }) => (
      <DataTableColumnHeader column={column} title="Duration" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Service["duration"]>()} min</div>,
  },
  {
    id: "popular",
    accessorKey: "popular",
    header: ({ column }: { column: Column<Service, unknown> }) => (
      <DataTableColumnHeader column={column} title="Popular" />
    ),
    cell: ({ cell }) =>
      cell.getValue<Service["popular"]>() ? (
        <Badge variant="outline">Popular</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }: { column: Column<Service, unknown> }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<Service["status"]>();
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

export function ServiceTable() {
  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString,
    category: parseAsString,
    status: parseAsString,
    sort: getSortingStateParser(columnIds).withDefault([]),
  });

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.name && { search: params.name }),
    ...(params.category && { category: params.category }),
    ...(params.status && { status: params.status }),
    ...(params.sort.length > 0 && { sort: JSON.stringify(params.sort) }),
  };

  const { data } = useQuery(servicesQueryOptions(filters));
  const services = data?.services ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / params.perPage));

  const { table } = useDataTable({
    data: services,
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
        <span className="text-sm font-medium">Category:</span>
        <Select
          value={params.category ?? ALL_CATEGORIES}
          onValueChange={(value) =>
            setParams({
              category: value === ALL_CATEGORIES ? null : value,
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-55">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
            {serviceCategoryOptions.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
            {serviceStatusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
