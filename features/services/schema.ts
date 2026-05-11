// Zod schema for the service form. Text inputs keep form state simple, then
// numeric fields are transformed before the payload is sent to the API.
import * as z from "zod";

export const serviceCategoryOptions = [
  { value: "manicure", label: "Manicure" },
  { value: "pedicure", label: "Pedicure" },
  { value: "gel_acrylic", label: "Gel & Acrylic" },
  { value: "nail_art", label: "Nail Art" },
  { value: "spa", label: "Spa" },
  { value: "additional", label: "Additional" },
] as const;

export const serviceStatusOptions = [
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" },
] as const;

const nullableText = z
  .string()
  .trim()
  .transform((value) => (value ? value : null));

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

export const serviceSchema = z.object({
  // Holds File[] in form state while picking. The form uploads the file first
  // and replaces it with the returned URL before calling the mutation.
  image: z.union([z.string().url(), z.array(z.instanceof(File))]).optional(),
  name: z.string().min(2, "Service name must be at least 2 characters."),
  description: nullableText,
  price: numericRange(0, 10000, "Price"),
  duration: numericRange(1, 1440, "Duration").pipe(z.int()),
  category: z.enum([
    "manicure",
    "pedicure",
    "gel_acrylic",
    "nail_art",
    "spa",
    "additional",
  ]),
  popular: z.boolean(),
  status: z.enum(["active", "disabled"]),
});

export type ServiceFormValues = z.input<typeof serviceSchema>;
export type ServicePayload = z.output<typeof serviceSchema>;
