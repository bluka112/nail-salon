// Per-row dropdown (Update / Delete). Toast + dialog close are passed to
// `mutate()` directly so they don't override the cache-invalidation
// `onSuccess` defined on `deleteServiceMutation` — both run.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertModal } from "@/components/modal/alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/icons";
import type { Service } from "@/lib/generated/prisma/client";
import { deleteServiceMutation } from "@/features/services/api";

type Props = { data: Service };

export function CellAction({ data }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const deleteMutation = useMutation(deleteServiceMutation);

  const handleDelete = () =>
    deleteMutation.mutate(data.id, {
      onSuccess: () => {
        toast.success("Service deleted");
        setOpen(false);
      },
      onError: () => toast.error("Failed to delete service"),
    });

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <Icons.ellipsis className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => router.push(`/admin/service/${data.id}`)}
          >
            <Icons.edit className="mr-2 h-4 w-4" /> Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Icons.trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
