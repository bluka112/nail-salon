// Zod schema for the branch form. Drives both validation (per-field on blur,
// whole form on submit) and the typed payload sent to the API. Text inputs
// produce strings; `latitude`/`longitude` are validated as numeric strings
// then `.transform(Number)` so the parsed payload has real numbers.

import * as z from "zod";

const usPhoneRegex = /^\+?1?\s*\(?[2-9]\d{2}\)?[\s.-]?[2-9]\d{2}[\s.-]?\d{4}$/;

const numericRange = (min: number, max: number, label: string) =>
  z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), `${label} is required`)
    .refine(
      (v) => Number(v) >= min && Number(v) <= max,
      `${label} must be between ${min} and ${max}`,
    )
    .transform(Number);

export const branchSchema = z.object({
  image: z.string(),
  name: z.string().min(2, "Branch name must be at least 2 characters."),
  location: z.string().min(10, "Location must be at least 10 characters."),
  phoneNumber: z.string().regex(usPhoneRegex, "Invalid US phone number"),
  latitude: numericRange(-90, 90, "Latitude"),
  longitude: numericRange(-180, 180, "Longitude"),
});

export type BranchFormValues = z.input<typeof branchSchema>;
export type BranchPayload = z.output<typeof branchSchema>;
