"use client";

import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import TestimonialForm from "@/features/testimonials/form";
import { testimonialByIdQueryOptions } from "@/features/testimonials/api";

type Props = { testimonialId: string };

export default function TestimonialViewPage({ testimonialId }: Props) {
  if (testimonialId === "new") {
    return (
      <TestimonialForm initialData={null} pageTitle="Create New Testimonial" />
    );
  }

  return <EditTestimonialView testimonialId={testimonialId} />;
}

function EditTestimonialView({ testimonialId }: { testimonialId: string }) {
  const { data, isPending, isError } = useQuery(
    testimonialByIdQueryOptions(testimonialId),
  );

  if (isPending) return <div className="p-4">Loading...</div>;
  if (isError) return <div className="p-4">Failed to load testimonial.</div>;
  if (!data?.testimonial) notFound();

  return (
    <TestimonialForm
      initialData={data.testimonial}
      pageTitle="Edit Testimonial"
    />
  );
}
