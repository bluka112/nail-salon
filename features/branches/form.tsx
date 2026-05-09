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
      image: initialData?.image ?? "",
      name: initialData?.name ?? "",
      location: initialData?.location ?? "",
      phoneNumber: initialData?.phoneNumber ?? "",
      latitude:
        initialData?.latitude !== undefined ? String(initialData.latitude) : "",
      longitude:
        initialData?.longitude !== undefined
          ? String(initialData.longitude)
          : "",
    } satisfies BranchFormValues,
    validators: {
      onBlur: branchSchema,
      onSubmit: branchSchema,
    },
    onSubmit: ({ value }) => {
      const payload = branchSchema.parse(value);

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

  const { FormTextField, FormTextareaField } = useFormFields<BranchFormValues>();

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
