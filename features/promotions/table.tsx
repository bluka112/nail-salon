"use client";

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
import type { Promotion } from "@/lib/generated/prisma/client";
import { promotionsQueryOptions } from "@/features/promotions/api";
import { promotionStatusOptions } from "@/features/promotions/schema";
import { CellAction } from "@/features/promotions/cell-action";

const ALL_STATUSES = "all";
const ACTIVE_ONLY = "active";
const ALL_PROMOTIONS = "all";

const formatDate = (value: Date | string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const isCurrentlyActive = (promotion: Promotion) => {
  const now = new Date();
  return (
    promotion.status === "active" &&
    new Date(promotion.validFrom) <= now &&
    new Date(promotion.validUntil) >= now
  );
};

const columns: ColumnDef<Promotion>[] = [
  {
    id: "title",
    accessorKey: "title",
    header: ({ column }: { column: Column<Promotion, unknown> }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Promotion["title"]>()}</div>,
    meta: {
      label: "Title",
      placeholder: "Search promotion...",
      variant: "text",
      icon: Icons.text,
    },
    enableColumnFilter: true,
  },
  {
    id: "code",
    accessorKey: "code",
    header: ({ column }: { column: Column<Promotion, unknown> }) => (
      <DataTableColumnHeader column={column} title="Code" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Promotion["code"]>() ?? "—"}</div>,
  },
  {
    id: "discount",
    accessorKey: "discount",
    header: ({ column }: { column: Column<Promotion, unknown> }) => (
      <DataTableColumnHeader column={column} title="Discount" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Promotion["discount"]>()}%</div>,
  },
  {
    id: "validity",
    accessorKey: "validity",
    header: ({ column }: { column: Column<Promotion, unknown> }) => (
      <DataTableColumnHeader column={column} title="Validity" />
    ),
    cell: ({ row }) => (
      <div>
        {formatDate(row.original.validFrom)} → {formatDate(row.original.validUntil)}
      </div>
    ),
  },
  {
    id: "active",
    header: ({ column }: { column: Column<Promotion, unknown> }) => (
      <DataTableColumnHeader column={column} title="Active Now" />
    ),
    cell: ({ row }) =>
      isCurrentlyActive(row.original) ? (
        <Badge variant="outline">Active now</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
    enableSorting: false,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }: { column: Column<Promotion, unknown> }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<Promotion["status"]>();
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

export function PromotionTable() {
  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    title: parseAsString,
    status: parseAsString,
    active: parseAsString,
    sort: getSortingStateParser(columnIds).withDefault([]),
  });

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.title && { search: params.title }),
    ...(params.status && { status: params.status }),
    ...(params.active === ACTIVE_ONLY && { active: "true" }),
    ...(params.sort.length > 0 && { sort: JSON.stringify(params.sort) }),
  };

  const { data } = useQuery(promotionsQueryOptions(filters));
  const promotions = data?.promotions ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / params.perPage));

  const { table } = useDataTable({
    data: promotions,
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
            {promotionStatusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm font-medium">Active:</span>
        <Select
          value={params.active ?? ALL_PROMOTIONS}
          onValueChange={(value) =>
            setParams({
              active: value === ALL_PROMOTIONS ? null : value,
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="All promotions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_PROMOTIONS}>All promotions</SelectItem>
            <SelectItem value={ACTIVE_ONLY}>Active only</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
