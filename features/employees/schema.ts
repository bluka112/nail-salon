// Zod schema for the employee form. Drives both validation (per-field on blur,
// whole form on submit) and the typed payload sent to the API.
import * as z from "zod";

const usPhoneRegex = /^\+?1?\s*\(?[2-9]\d{2}\)?[\s.-]?[2-9]\d{2}[\s.-]?\d{4}$/;

const nullableText = z
  .string()
  .trim()
  .transform((value) => (value ? value : null));

const nullablePhone = nullableText.refine(
  (value) => value === null || usPhoneRegex.test(value),
  "Invalid US phone number",
);

const nullableEmail = nullableText.refine(
  (value) => value === null || z.email().safeParse(value).success,
  "Invalid email address",
);

const numericRange = (min: number, max: number, label: string) =>
  z
    .union([z.string(), z.number()])
    .refine((value) => value !== "" && !Number.isNaN(Number(value)), {
      message: `${label} is required`,
    })
    .refine((value) => Number(value) >= min && Number(value) <= max, {
      message: `${label} must be between ${min} and ${max}`,
    })
    .transform(Number);

export const employeeSchema = z.object({
  // Holds File[] in form state while picking. The form uploads the file first
  // and replaces it with the returned URL before calling the mutation.
  image: z.union([z.string().url(), z.array(z.instanceof(File))]).optional(),
  name: z.string().min(2, "Employee name must be at least 2 characters."),
  title: nullableText,
  phoneNumber: nullablePhone,
  email: nullableEmail,
  specialties: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  rating: numericRange(0, 5, "Rating"),
  status: z.enum(["active", "disabled"]),
  branchId: z.string().nonempty("put your branch"),
});

export type EmployeeFormValues = z.input<typeof employeeSchema>;
export type EmployeePayload = z.output<typeof employeeSchema>;
