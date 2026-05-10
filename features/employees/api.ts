// Data layer for employees. One file: types, fetch helper, query keys,
// react-query options. Components import only from here — never call fetch
// directly. To clone for a new entity, copy this whole file and sed-replace
// "Employees"→"Whatever", "employees"→"whatevers", "Employee"→"Whatever",
// "employee"→"whatever" (longest first).

import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import type { Prisma } from "@/lib/generated/prisma/client";

// ─── Types ──────────────────────────────────────────────────────────────────
export type Employee = Prisma.EmployeeGetPayload<{ include: { branch: true } }>;

export type EmployeeFilters = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  branchId?: string;
};

export type EmployeeListResponse = {
  success: boolean;
  message: string;
  total: number;
  employees: Employee[];
};

export type EmployeeItemResponse = {
  success: boolean;
  message: string;
  employee: Employee | null;
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

function buildQuery(filters: EmployeeFilters) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.branchId) params.set("branchId", filters.branchId);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ─── Query keys ─────────────────────────────────────────────────────────────
// Shared cache keys. `all` is the root used to invalidate every employees
// query at once after a mutation.

export const employeeKeys = {
  all: ["employees"] as const,
  list: (filters: EmployeeFilters) =>
    [...employeeKeys.all, "list", filters] as const,
  detail: (id: string) => [...employeeKeys.all, "detail", id] as const,
};

// ─── Queries ────────────────────────────────────────────────────────────────

export const employeesQueryOptions = (filters: EmployeeFilters) =>
  queryOptions({
    queryKey: employeeKeys.list(filters),
    queryFn: () =>
      request<EmployeeListResponse>(`/api/employees${buildQuery(filters)}`),
  });

export const employeeByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: employeeKeys.detail(id),
    queryFn: () => request<EmployeeItemResponse>(`/api/employees/${id}`),
  });

// ─── Mutations ──────────────────────────────────────────────────────────────
// Each mutation invalidates the list cache via onSuccess so the table
// refreshes automatically. Components add toast/navigation by passing a
// second `onSuccess` to mutate(value, { onSuccess }) — both run.

const invalidateEmployees = () =>
  getQueryClient().invalidateQueries({ queryKey: employeeKeys.all });

export const createEmployeeMutation = mutationOptions({
  mutationFn: (data: Prisma.EmployeeUncheckedCreateInput) =>
    request<EmployeeItemResponse>("/api/employees", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  onSuccess: invalidateEmployees,
});

export const updateEmployeeMutation = mutationOptions({
  mutationFn: ({
    id,
    values,
  }: {
    id: string;
    values: Prisma.EmployeeUpdateInput;
  }) =>
    request<EmployeeItemResponse>(`/api/employees/${id}`, {
      method: "PATCH",
      body: JSON.stringify(values),
    }),
  onSuccess: invalidateEmployees,
});

export const deleteEmployeeMutation = mutationOptions({
  mutationFn: (id: string) =>
    request<EmployeeItemResponse>(`/api/employees/${id}`, { method: "DELETE" }),
  onSuccess: invalidateEmployees,
});
