"use client";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import type { Branch } from "@/lib/generated/prisma/browser";
import { Column, ColumnDef } from "@tanstack/react-table";
import { Icons } from "@/components/icons";
import Image from "next/image";
import { CellAction } from "./cell-action";

export const columns: ColumnDef<Branch>[] = [
  {
    accessorKey: "image",
    header: "IMAGE",
    cell: ({ row }) => {
      return (
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
      );
    },
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
      <DataTableColumnHeader column={column} title="phoneNumber" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Branch["phoneNumber"]>()}</div>,
  },
  {
    id: "location",
    accessorKey: "location",
    header: ({ column }: { column: Column<Branch, unknown> }) => (
      <DataTableColumnHeader column={column} title="location" />
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
