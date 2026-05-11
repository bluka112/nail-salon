"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm, useFormFields } from "@/components/ui/tanstack-form";
import type { GalleryImage } from "@/lib/generated/prisma/client";
import { uploadImage } from "@/lib/upload-image";
import {
  GalleryFormValues,
  gallerySchema,
  galleryStatusOptions,
} from "@/features/gallery/schema";
import {
  createGalleryImageMutation,
  updateGalleryImageMutation,
} from "@/features/gallery/api";

type Props = {
  initialData: GalleryImage | null;
  pageTitle: string;
};

export default function GalleryForm({ initialData, pageTitle }: Props) {
  const isEdit = !!initialData;
  const hasExistingImage = isEdit && !!initialData?.image;
  const [initialFiles, setInitialFiles] = useState<File[] | null>(
    hasExistingImage ? null : [],
  );

  useEffect(() => {
    if (!hasExistingImage) return;
    let cancelled = false;

    (async () => {
      const file = await urlToFile(initialData!.image);
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
    <GalleryFormInner
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

function GalleryFormInner({
  initialData,
  pageTitle,
  initialFiles,
}: Props & { initialFiles: File[] }) {
  const router = useRouter();
  const isEdit = !!initialData;
  const createMutation = useMutation(createGalleryImageMutation);
  const updateMutation = useMutation(updateGalleryImageMutation);

  const form = useAppForm({
    defaultValues: {
      image: initialFiles,
      title: initialData?.title ?? "",
      category: initialData?.category ?? "",
      featured: initialData?.featured ?? false,
      status: initialData?.status ?? "active",
    } as GalleryFormValues,
    validators: {
      onChange: gallerySchema,
      onBlur: gallerySchema,
      onSubmit: gallerySchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = gallerySchema.parse(value);
      const file = Array.isArray(parsed.image) ? parsed.image[0] : undefined;
      let imageUrl = initialData?.image ?? "";

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
      } else if (typeof parsed.image === "string") {
        imageUrl = parsed.image;
      }

      const payload = { ...parsed, image: imageUrl };

      const handlers = {
        onSuccess: () => {
          toast.success(
            isEdit ? "Gallery image updated" : "Gallery image created",
          );
          router.push("/admin/gallery");
        },
        onError: () => {
          toast.error(
            isEdit
              ? "Failed to update gallery image"
              : "Failed to create gallery image",
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
    FormSelectField,
    FormSwitchField,
    FormFileUploadField,
  } = useFormFields<GalleryFormValues>();

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
              label="Gallery Image"
              description="Upload a gallery image"
              maxSize={5 * 1024 * 1024}
              maxFiles={1}
              required
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormTextField
                name="title"
                label="Title"
                placeholder="Enter image title"
              />
              <FormTextField
                name="category"
                label="Category"
                placeholder="Enter category"
              />
              <FormSelectField
                name="status"
                label="Status"
                required
                options={[...galleryStatusOptions]}
              />
              <FormSwitchField
                name="featured"
                label="Featured"
                description="Feature this image in prominent listings"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Back
              </Button>
              <form.SubmitButton>
                {isEdit ? "Update Gallery Image" : "Add Gallery Image"}
              </form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
