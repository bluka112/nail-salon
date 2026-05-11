import * as z from "zod";

export const promotionStatusOptions = [
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" },
] as const;

const nullableText = z
  .string()
  .trim()
  .transform((value) => (value ? value : null));

const dateString = (label: string) =>
  z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} must use YYYY-MM-DD`)
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: `${label} must be a valid date`,
    });

const discountRange = z
  .union([z.string(), z.number()])
  .refine((value) => value !== "" && !Number.isNaN(Number(value)), {
    message: "Discount is required",
  })
  .refine((value) => Number(value) >= 1 && Number(value) <= 100, {
    message: "Discount must be between 1 and 100",
  })
  .transform(Number)
  .pipe(z.int());

export const promotionSchema = z
  .object({
    title: z.string().min(2, "Promotion title must be at least 2 characters."),
    description: nullableText,
    discount: discountRange,
    code: nullableText,
    validFrom: dateString("Valid from"),
    validUntil: dateString("Valid until"),
    status: z.enum(["active", "disabled"]),
  })
  .refine(
    (value) => new Date(value.validUntil) >= new Date(value.validFrom),
    {
      message: "Valid until must be on or after valid from",
      path: ["validUntil"],
    },
  );

export type PromotionFormValues = z.input<typeof promotionSchema>;
export type PromotionPayload = z.output<typeof promotionSchema>;
