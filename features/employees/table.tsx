// Listing table. URL search params (page, perPage, name, sort, branchId) are
// kept in sync with the URL via nuqs and passed as filters to the query.
// A branch <Select> at the top updates `branchId` in the URL — picking
// "All branches" clears the filter. Columns are inlined here on purpose so
// the table is one self-contained file.
"use client";

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
import { useDataTable } from "@/hooks/use-data-table";
import { useQuery } from "@tanstack/react-query";
import { Column, ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { Icons } from "@/components/icons";
import { getSortingStateParser } from "@/lib/parsers";
import { Employee, employeesQueryOptions } from "@/features/employees/api";
import { CellAction } from "@/features/employees/cell-action";
import { branchesQueryOptions } from "@/features/branches/api";

const ALL_BRANCHES = "all";

const columns: ColumnDef<Employee>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }: { column: Column<Employee, unknown> }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Employee["name"]>()}</div>,
    meta: {
      label: "Name",
      placeholder: "Search employee...",
      variant: "text",
      icon: Icons.text,
    },
    enableColumnFilter: true,
  },
  {
    id: "phoneNumber",
    accessorKey: "phoneNumber",
    header: ({ column }: { column: Column<Employee, unknown> }) => (
      <DataTableColumnHeader column={column} title="Phone Number" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Employee["phoneNumber"]>()}</div>,
  },
  {
    id: "branch",
    accessorKey: "branch",
    header: ({ column }: { column: Column<Employee, unknown> }) => (
      <DataTableColumnHeader column={column} title="Branch" />
    ),
    cell: ({ cell }) => <div>{cell.row.original.branch.name}</div>,
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

export function EmployeeTable() {
  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString,
    branchId: parseAsString,
    sort: getSortingStateParser(columnIds).withDefault([]),
  });

  const { data: branchesData } = useQuery(branchesQueryOptions({ limit: 100 }));
  const branches = branchesData?.branches ?? [];

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.name && { search: params.name }),
    ...(params.branchId && { branchId: params.branchId }),
    ...(params.sort.length > 0 && { sort: JSON.stringify(params.sort) }),
  };

  const { data } = useQuery(employeesQueryOptions(filters));
  const employees = data?.employees ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / params.perPage));

  const { table } = useDataTable({
    data: employees,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { right: ["actions"] },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Branch:</span>
        <Select
          value={params.branchId ?? ALL_BRANCHES}
          onValueChange={(value) =>
            setParams({
              branchId: value === ALL_BRANCHES ? null : value,
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All branches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_BRANCHES}>All branches</SelectItem>
            {branches.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
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
