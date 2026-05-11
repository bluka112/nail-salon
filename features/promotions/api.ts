import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import type { Prisma, Promotion } from "@/lib/generated/prisma/client";

export type PromotionFilters = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  status?: string;
  active?: string;
};

export type PromotionListResponse = {
  success: boolean;
  message: string;
  total: number;
  promotions: Promotion[];
};

export type PromotionItemResponse = {
  success: boolean;
  message: string;
  promotion: Promotion | null;
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

function buildQuery(filters: PromotionFilters) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.status) params.set("status", filters.status);
  if (filters.active) params.set("active", filters.active);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const promotionKeys = {
  all: ["promotions"] as const,
  list: (filters: PromotionFilters) =>
    [...promotionKeys.all, "list", filters] as const,
  detail: (id: string) => [...promotionKeys.all, "detail", id] as const,
};

export const promotionsQueryOptions = (filters: PromotionFilters) =>
  queryOptions({
    queryKey: promotionKeys.list(filters),
    queryFn: () =>
      request<PromotionListResponse>(`/api/promotions${buildQuery(filters)}`),
  });

export const promotionByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: promotionKeys.detail(id),
    queryFn: () => request<PromotionItemResponse>(`/api/promotions/${id}`),
  });

const invalidatePromotions = () =>
  getQueryClient().invalidateQueries({ queryKey: promotionKeys.all });

export const createPromotionMutation = mutationOptions({
  mutationFn: (data: Prisma.PromotionCreateInput) =>
    request<PromotionItemResponse>("/api/promotions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  onSuccess: invalidatePromotions,
});

export const updatePromotionMutation = mutationOptions({
  mutationFn: ({
    id,
    values,
  }: {
    id: string;
    values: Prisma.PromotionUpdateInput;
  }) =>
    request<PromotionItemResponse>(`/api/promotions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(values),
    }),
  onSuccess: invalidatePromotions,
});

export const deletePromotionMutation = mutationOptions({
  mutationFn: (id: string) =>
    request<PromotionItemResponse>(`/api/promotions/${id}`, {
      method: "DELETE",
    }),
  onSuccess: invalidatePromotions,
});
