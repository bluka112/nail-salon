import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import type { GalleryImage, Prisma } from "@/lib/generated/prisma/client";

export type GalleryFilters = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  category?: string;
  status?: string;
  featured?: string;
};

export type GalleryListResponse = {
  success: boolean;
  message: string;
  total: number;
  images: GalleryImage[];
};

export type GalleryItemResponse = {
  success: boolean;
  message: string;
  image: GalleryImage | null;
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

function buildQuery(filters: GalleryFilters) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  if (filters.featured) params.set("featured", filters.featured);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const galleryKeys = {
  all: ["gallery"] as const,
  list: (filters: GalleryFilters) =>
    [...galleryKeys.all, "list", filters] as const,
  detail: (id: string) => [...galleryKeys.all, "detail", id] as const,
};

export const galleryQueryOptions = (filters: GalleryFilters) =>
  queryOptions({
    queryKey: galleryKeys.list(filters),
    queryFn: () =>
      request<GalleryListResponse>(`/api/gallery${buildQuery(filters)}`),
  });

export const galleryImageByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: galleryKeys.detail(id),
    queryFn: () => request<GalleryItemResponse>(`/api/gallery/${id}`),
  });

const invalidateGallery = () =>
  getQueryClient().invalidateQueries({ queryKey: galleryKeys.all });

export const createGalleryImageMutation = mutationOptions({
  mutationFn: (data: Prisma.GalleryImageCreateInput) =>
    request<GalleryItemResponse>("/api/gallery", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  onSuccess: invalidateGallery,
});

export const updateGalleryImageMutation = mutationOptions({
  mutationFn: ({
    id,
    values,
  }: {
    id: string;
    values: Prisma.GalleryImageUpdateInput;
  }) =>
    request<GalleryItemResponse>(`/api/gallery/${id}`, {
      method: "PATCH",
      body: JSON.stringify(values),
    }),
  onSuccess: invalidateGallery,
});

export const deleteGalleryImageMutation = mutationOptions({
  mutationFn: (id: string) =>
    request<GalleryItemResponse>(`/api/gallery/${id}`, { method: "DELETE" }),
  onSuccess: invalidateGallery,
});
