import { queryOptions } from "@tanstack/react-query";
import { BranchFilters } from "./types";
import { getBranchById, getBranches } from "./service";

export const branchKeys = {
  all: ["branches"] as const,
  list: (filters: BranchFilters) =>
    [...branchKeys.all, "list", filters] as const,
  detail: (id: string) => [...branchKeys.all, "detail", id] as const,
};

export const branchesQueryOptions = (filters: BranchFilters) =>
  queryOptions({
    queryKey: branchKeys.list(filters),
    queryFn: () => getBranches(filters),
  });

export const branchByIdOptions = (id: string) =>
  queryOptions({
    queryKey: branchKeys.detail(id),
    queryFn: () => getBranchById(id),
  });
