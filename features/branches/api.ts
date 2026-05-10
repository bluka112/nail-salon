// Data layer for branches. One file: types, fetch helper, query keys,
// react-query options. Components import only from here — never call fetch
// directly. To clone for a new entity, copy this whole file and sed-replace
// "Branches"→"Whatever", "branches"→"whatevers", "Branch"→"Whatever",
// "branch"→"whatever" (longest first).

import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import type { Branch, Prisma } from "@/lib/generated/prisma/client";

// ─── Types ──────────────────────────────────────────────────────────────────

export type BranchFilters = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
};

export type BranchListResponse = {
  success: boolean;
  message: string;
  total: number;
  branches: Branch[];
};

export type BranchItemResponse = {
  success: boolean;
  message: string;
  branch: Branch | null;
};

// ─── Fetch helper ───────────────────────────────────────────────────────────
// Thin wrapper around fetch that throws on non-2xx so react-query treats it
// as an error. Always returns parsed JSON typed as T.

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

function buildQuery(filters: BranchFilters) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.sort) params.set("sort", filters.sort);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ─── Query keys ─────────────────────────────────────────────────────────────
// Shared cache keys. `all` is the root used to invalidate every branches
// query at once after a mutation.

export const branchKeys = {
  all: ["branches"] as const,
  list: (filters: BranchFilters) =>
    [...branchKeys.all, "list", filters] as const,
  detail: (id: string) => [...branchKeys.all, "detail", id] as const,
};

// ─── Queries ────────────────────────────────────────────────────────────────

export const branchesQueryOptions = (filters: BranchFilters) =>
  queryOptions({
    queryKey: branchKeys.list(filters),
    queryFn: () =>
      request<BranchListResponse>(`/api/branches${buildQuery(filters)}`),
  });

export const branchByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: branchKeys.detail(id),
    queryFn: () => request<BranchItemResponse>(`/api/branches/${id}`),
  });

// ─── Mutations ──────────────────────────────────────────────────────────────
// Each mutation invalidates the list cache via onSuccess so the table
// refreshes automatically. Components add toast/navigation by passing a
// second `onSuccess` to mutate(value, { onSuccess }) — both run.

const invalidateBranches = () =>
  getQueryClient().invalidateQueries({ queryKey: branchKeys.all });

export const createBranchMutation = mutationOptions({
  mutationFn: (data: Prisma.BranchCreateInput) =>
    request<BranchItemResponse>("/api/branches", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  onSuccess: invalidateBranches,
});

export const updateBranchMutation = mutationOptions({
  mutationFn: ({
    id,
    values,
  }: {
    id: string;
    values: Prisma.BranchUpdateInput;
  }) =>
    request<BranchItemResponse>(`/api/branches/${id}`, {
      method: "PATCH",
      body: JSON.stringify(values),
    }),
  onSuccess: invalidateBranches,
});

export const deleteBranchMutation = mutationOptions({
  mutationFn: (id: string) =>
    request<BranchItemResponse>(`/api/branches/${id}`, { method: "DELETE" }),
  onSuccess: invalidateBranches,
});
