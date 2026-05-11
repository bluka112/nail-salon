// Data layer for services. One file: types, fetch helper, query keys,
// react-query options. Components import only from here.

import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import type { Prisma, Service } from "@/lib/generated/prisma/client";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ServiceFilters = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  category?: string;
  status?: string;
  popular?: string;
};

export type ServiceListResponse = {
  success: boolean;
  message: string;
  total: number;
  services: Service[];
};

export type ServiceItemResponse = {
  success: boolean;
  message: string;
  service: Service | null;
};

// ─── Fetch helper ───────────────────────────────────────────────────────────

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

function buildQuery(filters: ServiceFilters) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  if (filters.popular) params.set("popular", filters.popular);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ─── Query keys ─────────────────────────────────────────────────────────────

export const serviceKeys = {
  all: ["services"] as const,
  list: (filters: ServiceFilters) =>
    [...serviceKeys.all, "list", filters] as const,
  detail: (id: string) => [...serviceKeys.all, "detail", id] as const,
};

// ─── Queries ────────────────────────────────────────────────────────────────

export const servicesQueryOptions = (filters: ServiceFilters) =>
  queryOptions({
    queryKey: serviceKeys.list(filters),
    queryFn: () =>
      request<ServiceListResponse>(`/api/services${buildQuery(filters)}`),
  });

export const serviceByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: serviceKeys.detail(id),
    queryFn: () => request<ServiceItemResponse>(`/api/services/${id}`),
  });

// ─── Mutations ──────────────────────────────────────────────────────────────

const invalidateServices = () =>
  getQueryClient().invalidateQueries({ queryKey: serviceKeys.all });

export const createServiceMutation = mutationOptions({
  mutationFn: (data: Prisma.ServiceCreateInput) =>
    request<ServiceItemResponse>("/api/services", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  onSuccess: invalidateServices,
});

export const updateServiceMutation = mutationOptions({
  mutationFn: ({
    id,
    values,
  }: {
    id: string;
    values: Prisma.ServiceUpdateInput;
  }) =>
    request<ServiceItemResponse>(`/api/services/${id}`, {
      method: "PATCH",
      body: JSON.stringify(values),
    }),
  onSuccess: invalidateServices,
});

export const deleteServiceMutation = mutationOptions({
  mutationFn: (id: string) =>
    request<ServiceItemResponse>(`/api/services/${id}`, { method: "DELETE" }),
  onSuccess: invalidateServices,
});
