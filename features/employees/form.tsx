// Create/edit form. `initialData = null` → create mode; otherwise edit.
// Validation lives entirely in `schema.ts` — no inline rules per field.
// On submit we `employeeSchema.parse(value)` to get the payload with coerced
// numbers, then call the matching mutation.

"use client";

import { useAppForm, useFormFields } from "@/components/ui/tanstack-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  EmployeeFormValues,
  employeeSchema,
} from "@/features/employees/schema";
import type { Employee } from "@/lib/generated/prisma/client";
import {
  createEmployeeMutation,
  updateEmployeeMutation,
} from "@/features/employees/api";
import { branchesQueryOptions } from "@/features/branches/api";

type Props = {
  initialData: Employee | null;
  pageTitle: string;
};

export default function EmployeeForm({ initialData, pageTitle }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;

  const createMutation = useMutation(createEmployeeMutation);
  const updateMutation = useMutation(updateEmployeeMutation);

  const { data: branchesData, isPending: branchesLoading } = useQuery(
    branchesQueryOptions({ limit: 100 }),
  );
  const branchOptions = (branchesData?.branches ?? []).map((b) => ({
    value: b.id,
    label: b.name,
  }));

  const form = useAppForm({
    defaultValues: {
      branchId: initialData?.branchId ?? "",
      name: initialData?.name ?? "",
      phoneNumber: initialData?.phoneNumber ?? "",
    } satisfies EmployeeFormValues,
    validators: {
      onChange: employeeSchema,
      onBlur: employeeSchema,
      onSubmit: employeeSchema,
    },
    onSubmit: ({ value }) => {
      const payload = employeeSchema.parse(value);

      const handlers = {
        onSuccess: () => {
          toast.success(isEdit ? "Employee updated" : "Employee created");
          router.push("/admin/employee");
        },
        onError: () => {
          toast.error(
            isEdit ? "Failed to update employee" : "Failed to create employee",
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

  const { FormTextField, FormSelectField } =
    useFormFields<EmployeeFormValues>();

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
                label="Employee Name"
                required
                placeholder="Enter employee name"
              />
              <FormTextField
                name="phoneNumber"
                label="Phone Number"
                required
                placeholder="Enter phone number"
              />
              <FormSelectField
                name="branchId"
                label="Branch"
                required
                placeholder={
                  branchesLoading ? "Loading branches..." : "Select a branch"
                }
                options={branchOptions}
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
                {isEdit ? "Update Employee" : "Add Employee"}
              </form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
