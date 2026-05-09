// Listing table. URL search params (page, perPage, name, sort) are kept in
// sync with the URL via nuqs and passed as filters to the query. Columns are
// inlined here on purpose so the table is one self-contained file.

"use client";

import { DataTable } from "@/components/ui/table/data-table";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { useQuery } from "@tanstack/react-query";
import { Column, ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import Image from "next/image";
import { Icons } from "@/components/icons";
import { getSortingStateParser } from "@/lib/parsers";
import type { Branch } from "@/lib/generated/prisma/browser";
import { branchesQueryOptions } from "@/features/branches/api";
import { CellAction } from "@/features/branches/cell-action";

const columns: ColumnDef<Branch>[] = [
  {
    accessorKey: "image",
    header: "IMAGE",
    cell: ({ row }) => (
      <div className="relative aspect-square">
        {row.getValue("image") ? (
          <Image
            src={row.getValue("image")}
            alt={row.getValue("name")}
            fill
            sizes="80px"
            className="rounded-lg"
          />
        ) : null}
      </div>
    ),
  },
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }: { column: Column<Branch, unknown> }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Branch["name"]>()}</div>,
    meta: {
      label: "Name",
      placeholder: "Search branch...",
      variant: "text",
      icon: Icons.text,
    },
    enableColumnFilter: true,
  },
  {
    id: "phoneNumber",
    accessorKey: "phoneNumber",
    header: ({ column }: { column: Column<Branch, unknown> }) => (
      <DataTableColumnHeader column={column} title="Phone Number" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Branch["phoneNumber"]>()}</div>,
  },
  {
    id: "location",
    accessorKey: "location",
    header: ({ column }: { column: Column<Branch, unknown> }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Branch["location"]>()}</div>,
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

export function BranchTable() {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString,
    sort: getSortingStateParser(columnIds).withDefault([]),
  });

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.name && { search: params.name }),
    ...(params.sort.length > 0 && { sort: JSON.stringify(params.sort) }),
  };

  const { data } = useQuery(branchesQueryOptions(filters));
  const branches = data?.branches ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / params.perPage));

  const { table } = useDataTable({
    data: branches,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { right: ["actions"] },
    },
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
