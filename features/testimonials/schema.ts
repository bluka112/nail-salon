import * as z from "zod";

export const testimonialStatusOptions = [
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" },
] as const;

const nullableText = z
  .string()
  .trim()
  .transform((value) => (value ? value : null));

const ratingRange = z
  .union([z.string(), z.number()])
  .refine((value) => value !== "" && !Number.isNaN(Number(value)), {
    message: "Rating is required",
  })
  .refine((value) => Number(value) >= 1 && Number(value) <= 5, {
    message: "Rating must be between 1 and 5",
  })
  .transform(Number)
  .pipe(z.int());

export const testimonialSchema = z.object({
  image: z.union([z.string().url(), z.array(z.instanceof(File))]).optional(),
  name: z.string().min(2, "Customer name must be at least 2 characters."),
  rating: ratingRange,
  comment: z.string().min(10, "Comment must be at least 10 characters."),
  service: nullableText,
  featured: z.boolean(),
  status: z.enum(["active", "disabled"]),
});

export type TestimonialFormValues = z.input<typeof testimonialSchema>;
export type TestimonialPayload = z.output<typeof testimonialSchema>;
