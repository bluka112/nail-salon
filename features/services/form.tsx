// Create/edit form. `initialData = null` → create mode; otherwise edit.
// Validation lives entirely in `schema.ts`; submit parses/transforms values
// before calling the matching service mutation.

"use client";

import { useEffect, useState } from "react";
import { useAppForm, useFormFields } from "@/components/ui/tanstack-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Service } from "@/lib/generated/prisma/client";
import {
  ServiceFormValues,
  serviceCategoryOptions,
  serviceSchema,
  serviceStatusOptions,
} from "@/features/services/schema";
import {
  createServiceMutation,
  updateServiceMutation,
} from "@/features/services/api";
import { uploadImage } from "@/lib/upload-image";

type Props = {
  initialData: Service | null;
  pageTitle: string;
};

export default function ServiceForm({ initialData, pageTitle }: Props) {
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
    <ServiceFormInner
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

function ServiceFormInner({
  initialData,
  pageTitle,
  initialFiles,
}: Props & { initialFiles: File[] }) {
  const router = useRouter();
  const isEdit = !!initialData;

  const createMutation = useMutation(createServiceMutation);
  const updateMutation = useMutation(updateServiceMutation);

  const form = useAppForm({
    defaultValues: {
      image: initialFiles,
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      price: initialData?.price ?? 0,
      duration: initialData?.duration ?? 30,
      category: initialData?.category ?? "manicure",
      popular: initialData?.popular ?? false,
      status: initialData?.status ?? "active",
    } as ServiceFormValues,
    validators: {
      onChange: serviceSchema,
      onBlur: serviceSchema,
      onSubmit: serviceSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = serviceSchema.parse(value);
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
          toast.success(isEdit ? "Service updated" : "Service created");
          router.push("/admin/service");
        },
        onError: () => {
          toast.error(
            isEdit ? "Failed to update service" : "Failed to create service",
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
  } = useFormFields<ServiceFormValues>();

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
              label="Service Image"
              description="Upload a service image"
              maxSize={5 * 1024 * 1024}
              maxFiles={1}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormTextField
                name="name"
                label="Service Name"
                required
                placeholder="Enter service name"
              />
              <FormSelectField
                name="category"
                label="Category"
                required
                options={[...serviceCategoryOptions]}
              />
              <FormTextField
                name="price"
                label="Price"
                type="number"
                min={0}
                step={0.01}
                required
                placeholder="Enter price"
              />
              <FormTextField
                name="duration"
                label="Duration"
                type="number"
                min={1}
                step={1}
                required
                placeholder="Enter duration in minutes"
              />
              <FormSelectField
                name="status"
                label="Status"
                required
                options={[...serviceStatusOptions]}
              />
              <FormSwitchField
                name="popular"
                label="Popular"
                description="Feature this service in prominent listings"
              />
            </div>

            <FormTextareaField
              name="description"
              label="Description"
              placeholder="Enter service description"
              maxLength={500}
              rows={4}
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
                {isEdit ? "Update Service" : "Add Service"}
              </form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
