"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm, useFormFields } from "@/components/ui/tanstack-form";
import type { Testimonial } from "@/lib/generated/prisma/client";
import { uploadImage } from "@/lib/upload-image";
import {
  TestimonialFormValues,
  testimonialSchema,
  testimonialStatusOptions,
} from "@/features/testimonials/schema";
import {
  createTestimonialMutation,
  updateTestimonialMutation,
} from "@/features/testimonials/api";

type Props = {
  initialData: Testimonial | null;
  pageTitle: string;
};

export default function TestimonialForm({ initialData, pageTitle }: Props) {
  const isEdit = !!initialData;
  const hasExistingImage = isEdit && !!initialData?.image;
  const [initialFiles, setInitialFiles] = useState<File[] | null>(
    hasExistingImage ? null : [],
  );

  useEffect(() => {
    if (!hasExistingImage) return;
    let cancelled = false;

    (async () => {
      const file = await urlToFile(initialData!.image!);
      if (cancelled) return;
      setInitialFiles(file ? [file] : []);
    })();

    return () => {
      cancelled = true;
    };
  }, [hasExistingImage, initialData]);

  if (initialFiles === null) {
    return (
      <Card className="mx-auto w-full">
        <CardHeader>
          <CardTitle className="text-left text-2xl font-bold">
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TestimonialFormInner
      initialData={initialData}
      pageTitle={pageTitle}
      initialFiles={initialFiles}
    />
  );
}

async function urlToFile(url: string): Promise<File | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const filename = url.split("/").pop()?.split("?")[0] ?? "image";
    return new File([blob], filename, { type: blob.type });
  } catch {
    return null;
  }
}

function TestimonialFormInner({
  initialData,
  pageTitle,
  initialFiles,
}: Props & { initialFiles: File[] }) {
  const router = useRouter();
  const isEdit = !!initialData;
  const createMutation = useMutation(createTestimonialMutation);
  const updateMutation = useMutation(updateTestimonialMutation);

  const form = useAppForm({
    defaultValues: {
      image: initialFiles,
      name: initialData?.name ?? "",
      rating: initialData?.rating ?? 5,
      comment: initialData?.comment ?? "",
      service: initialData?.service ?? "",
      featured: initialData?.featured ?? false,
      status: initialData?.status ?? "active",
    } as TestimonialFormValues,
    validators: {
      onChange: testimonialSchema,
      onBlur: testimonialSchema,
      onSubmit: testimonialSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = testimonialSchema.parse(value);
      const file = Array.isArray(parsed.image) ? parsed.image[0] : undefined;
      let imageUrl = initialData?.image ?? null;

      if (file instanceof File) {
        const isSameAsInitial =
          initialFiles[0] &&
          file.name === initialFiles[0].name &&
          file.size === initialFiles[0].size &&
          file.type === initialFiles[0].type;

        if (!isSameAsInitial) {
          try {
            imageUrl = await uploadImage(file);
          } catch {
            toast.error("Image upload failed");
            return;
          }
        }
      }

      const payload = { ...parsed, image: imageUrl };

      const handlers = {
        onSuccess: () => {
          toast.success(
            isEdit ? "Testimonial updated" : "Testimonial created",
          );
          router.push("/admin/testimonial");
        },
        onError: () => {
          toast.error(
            isEdit
              ? "Failed to update testimonial"
              : "Failed to create testimonial",
          );
        },
      };

      if (isEdit) {
        updateMutation.mutate(
          { id: initialData.id, values: payload },
          handlers,
        );
      } else {
        createMutation.mutate(payload, handlers);
      }
    },
  });

  const {
    FormTextField,
    FormTextareaField,
    FormSelectField,
    FormSwitchField,
    FormFileUploadField,
  } = useFormFields<TestimonialFormValues>();

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form.AppForm>
          <form.Form className="space-y-8">
            <FormFileUploadField
              name="image"
              label="Customer Image"
              description="Upload an optional customer image"
              maxSize={5 * 1024 * 1024}
              maxFiles={1}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormTextField
                name="name"
                label="Customer Name"
                required
                placeholder="Enter customer name"
              />
              <FormTextField
                name="service"
                label="Service"
                placeholder="Enter service name"
              />
              <FormTextField
                name="rating"
                label="Rating"
                type="number"
                min={1}
                max={5}
                step={1}
                required
                placeholder="Enter rating"
              />
              <FormSelectField
                name="status"
                label="Status"
                required
                options={[...testimonialStatusOptions]}
              />
              <FormSwitchField
                name="featured"
                label="Featured"
                description="Feature this testimonial in prominent listings"
              />
            </div>

            <FormTextareaField
              name="comment"
              label="Comment"
              required
              placeholder="Enter customer comment"
              maxLength={1000}
              rows={5}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Back
              </Button>
              <form.SubmitButton>
                {isEdit ? "Update Testimonial" : "Add Testimonial"}
              </form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
