"use client";

import { useAppForm, useFormFields } from "@/components/ui/tanstack-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as z from "zod";
import {
  BranchFormValues,
  branchSchema,
} from "@/features/branches/schemas/branch";
import { Branch,Prisma } from "@/lib/generated/prisma/browser";
import { createBranchMutation, updateBranchMutation } from "../api/mutations";

export default function BranchForm({
  initialData,
  pageTitle,
}: {
  initialData: Branch | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const isEdit = !!initialData;

  const createMutation = useMutation({
    ...createBranchMutation,
    onSuccess: () => {
      toast.success("Branch created successfully");
      router.push("/admin/branch");
    },
    onError: () => {
      toast.error("Failed to create branch");
    },
  });

  const updateMutation = useMutation({
    ...updateBranchMutation,
    onSuccess: () => {
      toast.success("Branch updated successfully");
      router.push("/admin/branch");
    },
    onError: () => {
      toast.error("Failed to update branch");
    },
  });

  const form = useAppForm({
    defaultValues: {
      image: undefined,
      name: initialData?.name ?? "",
      location: initialData?.location ?? "",
      phoneNumber: initialData?.phoneNumber ?? "",
      latitude: initialData?.latitude ?? "",
      longitude: initialData?.longitude ?? "",
    } as BranchFormValues,
    validators: {
      onSubmit: branchSchema,
    },
    onSubmit: ({ value }) => {
      const payload = {
        name: value.name,
        image: "",
        location: value.location ?? "",
        phoneNumber: value.phoneNumber ?? "",
        latitude: value.latitude ?? "",
        longitude: value.longitude ?? "",
      };

      if (isEdit) {
        updateMutation.mutate({ id: initialData.id, values: payload });
      } else {
        createMutation.mutate(payload as Prisma.BranchCreateInput);
      }
    },
  });

  const {
    FormTextField,
    FormSelectField,
    FormTextareaField,
    FormFileUploadField,
  } = useFormFields<BranchFormValues>();

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
              maxFiles={4}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormTextField
                name="name"
                label="Branch Name"
                required
                placeholder="Enter branch name"
                validators={{
                  onBlur: z
                    .string()
                    .min(2, "Branch name must be at least 2 characters."),
                }}
              />
              <FormTextField
                name="phoneNumber"
                label="Phone Number"
                required
                placeholder="Enter phone number"
                validators={{
                  onBlur: z
                    .string()
                    .min(2, "Phone number must be at least 2 characters."),
                }}
              />

              <FormTextField
                name="longitude"
                label="Longitude"
                required
                placeholder="Enter longitude"
                validators={{
                  onBlur: z
                    .string()
                    .refine((val) => !isNaN(Number(val)), {
                      message: "Longitude must be a number",
                    })
                    .refine(
                      (val) => Number(val) >= -180 && Number(val) <= 180,
                      {
                        message: "Longitude must be between -180 and 180",
                      },
                    ),
                }}
              />

              <FormTextField
                name="latitude"
                label="Latitude"
                required
                placeholder="Enter latitude"
                validators={{
                  onBlur: z
                    .string()
                    .refine((val) => !isNaN(Number(val)), {
                      message: "Latitude must be a number",
                    })
                    .refine((val) => Number(val) >= -90 && Number(val) <= 90, {
                      message: "Latitude must be between -90 and 90",
                    }),
                }}
              />
            </div>

            <FormTextareaField
              name="location"
              label="Location"
              required
              placeholder="Enter location"
              maxLength={500}
              rows={4}
              validators={{
                onBlur: z
                  .string()
                  .min(10, "Location must be at least 10 characters."),
              }}
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
