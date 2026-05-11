import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import type { Prisma, Testimonial } from "@/lib/generated/prisma/client";

export type TestimonialFilters = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  status?: string;
  featured?: string;
};

export type TestimonialListResponse = {
  success: boolean;
  message: string;
  total: number;
  testimonials: Testimonial[];
};

export type TestimonialItemResponse = {
  success: boolean;
  message: string;
  testimonial: Testimonial | null;
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

function buildQuery(filters: TestimonialFilters) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.status) params.set("status", filters.status);
  if (filters.featured) params.set("featured", filters.featured);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const testimonialKeys = {
  all: ["testimonials"] as const,
  list: (filters: TestimonialFilters) =>
    [...testimonialKeys.all, "list", filters] as const,
  detail: (id: string) => [...testimonialKeys.all, "detail", id] as const,
};

export const testimonialsQueryOptions = (filters: TestimonialFilters) =>
  queryOptions({
    queryKey: testimonialKeys.list(filters),
    queryFn: () =>
      request<TestimonialListResponse>(
        `/api/testimonials${buildQuery(filters)}`,
      ),
  });

export const testimonialByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: testimonialKeys.detail(id),
    queryFn: () =>
      request<TestimonialItemResponse>(`/api/testimonials/${id}`),
  });

const invalidateTestimonials = () =>
  getQueryClient().invalidateQueries({ queryKey: testimonialKeys.all });

export const createTestimonialMutation = mutationOptions({
  mutationFn: (data: Prisma.TestimonialCreateInput) =>
    request<TestimonialItemResponse>("/api/testimonials", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  onSuccess: invalidateTestimonials,
});

export const updateTestimonialMutation = mutationOptions({
  mutationFn: ({
    id,
    values,
  }: {
    id: string;
    values: Prisma.TestimonialUpdateInput;
  }) =>
    request<TestimonialItemResponse>(`/api/testimonials/${id}`, {
      method: "PATCH",
      body: JSON.stringify(values),
    }),
  onSuccess: invalidateTestimonials,
});

export const deleteTestimonialMutation = mutationOptions({
  mutationFn: (id: string) =>
    request<TestimonialItemResponse>(`/api/testimonials/${id}`, {
      method: "DELETE",
    }),
  onSuccess: invalidateTestimonials,
});
