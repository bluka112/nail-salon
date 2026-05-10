// Create/edit form. `initialData = null` → create mode; otherwise edit.
// Validation lives entirely in `schema.ts` — no inline rules per field.
// On submit we `branchSchema.parse(value)` to get the payload with coerced
// numbers, then call the matching mutation.

"use client";

import { useEffect, useState } from "react";
import { useAppForm, useFormFields } from "@/components/ui/tanstack-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BranchFormValues, branchSchema } from "@/features/branches/schema";
import type { Branch } from "@/lib/generated/prisma/client";
import {
  createBranchMutation,
  updateBranchMutation,
} from "@/features/branches/api";
import { uploadImage } from "@/lib/upload-image";
import dynamic from "next/dynamic";

const MapPicker = dynamic(
  () => import("@/components/forms/fields/map-picker"),
  {
    ssr: false,
  },
);

type Props = {
  initialData: Branch | null;
  pageTitle: string;
};

// Fetch a remote image URL and convert it into a File so the file picker
// can show it as the initial value.
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

export default function BranchForm({ initialData, pageTitle }: Props) {
  const isEdit = !!initialData;
  const hasExistingImage = isEdit && !!initialData?.image;

  // null = still loading, [] = ready with no initial file, [File] = ready with file
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
    <BranchFormInner
      initialData={initialData}
      pageTitle={pageTitle}
      initialFiles={initialFiles}
    />
  );
}

function BranchFormInner({
  initialData,
  pageTitle,
  initialFiles,
}: Props & { initialFiles: File[] }) {
  const router = useRouter();
  const isEdit = !!initialData;

  const createMutation = useMutation(createBranchMutation);
  const updateMutation = useMutation(updateBranchMutation);

  const form = useAppForm({
    defaultValues: {
      image: initialFiles,
      name: initialData?.name ?? "",
      location: initialData?.location ?? "",
      phoneNumber: initialData?.phoneNumber ?? "",
      openingTime: initialData?.openingTime ?? "",
      closingTime: initialData?.closingTime ?? "",
      latitude:
        initialData?.latitude !== undefined
          ? String(initialData.latitude)
          : "41.7744291",
      longitude:
        initialData?.longitude !== undefined
          ? String(initialData.longitude)
          : "-88.1505931",
    } as BranchFormValues,
    validators: {
      onChange: branchSchema,
      onBlur: branchSchema,
      onSubmit: branchSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = branchSchema.parse(value);

      // FileUploader stores File[]. If the user picked a new file, POST it
      // to /api/image and use the returned URL. Otherwise keep the existing
      // image (edit) or empty string (create).
      const file = Array.isArray(parsed.image) ? parsed.image[0] : undefined;
      let imageUrl = initialData?.image ?? "";

      if (file instanceof File) {
        // Only re-upload if it's a NEW file (not the one we hydrated from the URL).
        // We detect this by comparing against the initial file we fetched.
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
          toast.success(isEdit ? "Branch updated" : "Branch created");
          router.push("/admin/branch");
        },
        onError: () => {
          toast.error(
            isEdit ? "Failed to update branch" : "Failed to create branch",
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

  const { FormTextField, FormTextareaField, FormFileUploadField } =
    useFormFields<BranchFormValues>();

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
              label="Branch Image"
              description="Upload a branch image"
              maxSize={5 * 1024 * 1024}
              maxFiles={1}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormTextField
                name="name"
                label="Branch Name"
                required
                placeholder="Enter branch name"
              />
              <FormTextField
                name="phoneNumber"
                label="Phone Number"
                required
                placeholder="Enter phone number"
              />
              <FormTextField
                name="openingTime"
                label="Opening Time"
                required
                placeholder="Enter opening time"
              />
              <FormTextField
                name="closingTime"
                label="Closing Time"
                required
                placeholder="Enter closing time"
              />
              <FormTextField
                name="longitude"
                label="Longitude"
                required
                readOnly
                placeholder="Enter longitude"
              />
              <FormTextField
                name="latitude"
                label="Latitude"
                readOnly
                required
                placeholder="Enter latitude"
              />
            </div>

            <form.Subscribe
              selector={(state) => ({
                lat: state.values.latitude,
                lng: state.values.longitude,
              })}
            >
              {({ lat, lng }) => (
                <MapPicker
                  value={{ lat: Number(lat), lng: Number(lng) }}
                  onChange={(pos) => {
                    form.setFieldValue("latitude", String(pos.lat));
                    form.setFieldValue("longitude", String(pos.lng));
                  }}
                />
              )}
            </form.Subscribe>

            <FormTextareaField
              name="location"
              label="Location"
              required
              placeholder="Enter location"
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
                {isEdit ? "Update Branch" : "Add Branch"}
              </form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
