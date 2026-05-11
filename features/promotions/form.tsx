"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm, useFormFields } from "@/components/ui/tanstack-form";
import type { Promotion } from "@/lib/generated/prisma/client";
import {
  PromotionFormValues,
  promotionSchema,
  promotionStatusOptions,
} from "@/features/promotions/schema";
import {
  createPromotionMutation,
  updatePromotionMutation,
} from "@/features/promotions/api";

type Props = {
  initialData: Promotion | null;
  pageTitle: string;
};

const formatDateInput = (value?: Date | string | null) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};

export default function PromotionForm({ initialData, pageTitle }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;
  const createMutation = useMutation(createPromotionMutation);
  const updateMutation = useMutation(updatePromotionMutation);

  const form = useAppForm({
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      discount: initialData?.discount ?? 10,
      code: initialData?.code ?? "",
      validFrom: formatDateInput(initialData?.validFrom),
      validUntil: formatDateInput(initialData?.validUntil),
      status: initialData?.status ?? "active",
    } as PromotionFormValues,
    validators: {
      onChange: promotionSchema,
      onBlur: promotionSchema,
      onSubmit: promotionSchema,
    },
    onSubmit: ({ value }) => {
      const payload = promotionSchema.parse(value);

      const handlers = {
        onSuccess: () => {
          toast.success(isEdit ? "Promotion updated" : "Promotion created");
          router.push("/admin/promotion");
        },
        onError: () => {
          toast.error(
            isEdit
              ? "Failed to update promotion"
              : "Failed to create promotion",
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

  const { FormTextField, FormTextareaField, FormSelectField } =
    useFormFields<PromotionFormValues>();

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
                name="title"
                label="Promotion Title"
                required
                placeholder="Enter promotion title"
              />
              <FormTextField
                name="code"
                label="Code"
                placeholder="Enter discount code"
              />
              <FormTextField
                name="discount"
                label="Discount"
                type="number"
                min={1}
                max={100}
                step={1}
                required
                placeholder="Enter percentage discount"
              />
              <FormSelectField
                name="status"
                label="Status"
                required
                options={[...promotionStatusOptions]}
              />
              <FormTextField
                name="validFrom"
                label="Valid From"
                required
                placeholder="YYYY-MM-DD"
              />
              <FormTextField
                name="validUntil"
                label="Valid Until"
                required
                placeholder="YYYY-MM-DD"
              />
            </div>

            <FormTextareaField
              name="description"
              label="Description"
              placeholder="Enter promotion description"
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
                {isEdit ? "Update Promotion" : "Add Promotion"}
              </form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
