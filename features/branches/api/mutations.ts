import { mutationOptions } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { Prisma } from "@/lib/generated/prisma/browser";
import { createBranch, deleteBranch, updateBranch } from "./service";
import { branchKeys } from "./queries";

export const createBranchMutation = mutationOptions({
  mutationFn: (data: Prisma.BranchCreateInput) => createBranch(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: branchKeys.all });
  },
});

export const updateBranchMutation = mutationOptions({
  mutationFn: ({
    id,
    values,
  }: {
    id: string;
    values: Prisma.BranchUpdateInput;
  }) => updateBranch(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: branchKeys.all });
  },
});

export const deleteBranchMutation = mutationOptions({
  mutationFn: (id: string) => deleteBranch(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: branchKeys.all });
  },
});
