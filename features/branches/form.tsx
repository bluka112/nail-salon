// Create/edit form. `initialData = null` → create mode; otherwise edit.
// Validation lives entirely in `schema.ts` — no inline rules per field.
// On submit we `branchSchema.parse(value)` to get the payload with coerced
// numbers, then call the matching mutation.

"use client";

import { useAppForm, useFormFields } from "@/components/ui/tanstack-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BranchFormValues,
  branchSchema,
} from "@/features/branches/schema";
import type { Branch } from "@/lib/generated/prisma/browser";
import {
  createBranchMutation,
  updateBranchMutation,
} from "@/features/branches/api";
import { uploadImage } from "@/lib/upload-image";

type Props = {
  initialData: Branch | null;
  pageTitle: string;
};

export default function BranchForm({ initialData, pageTitle }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;

  const createMutation = useMutation(createBranchMutation);
  const updateMutation = useMutation(updateBranchMutation);

  const form = useAppForm({
    defaultValues: {
      image: undefined,
      name: initialData?.name ?? "",
      location: initialData?.location ?? "",
      phoneNumber: initialData?.phoneNumber ?? "",
      latitude:
        initialData?.latitude !== undefined ? String(initialData.latitude) : "",
      longitude:
        initialData?.longitude !== undefined
          ? String(initialData.longitude)
          : "",
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
      const file = (parsed.image as File[] | undefined)?.[0];
      let imageUrl = initialData?.image ?? "";
      if (file instanceof File) {
        try {
          imageUrl = await uploadImage(file);
        } catch {
          toast.error("Image upload failed");
          return;
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
                name="longitude"
                label="Longitude"
                required
                placeholder="Enter longitude"
              />
              <FormTextField
                name="latitude"
                label="Latitude"
                required
                placeholder="Enter latitude"
              />
            </div>

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
