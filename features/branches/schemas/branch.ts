import * as z from "zod";

const MAX_FILE_SIZE = 5_000_000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const usPhoneRegex = /^\+?1?\s*\(?[2-9]\d{2}\)?[\s.-]?[2-9]\d{2}[\s.-]?\d{4}$/;

export const branchSchema = z.object({
  image: z
    .any()
    .refine((files) => files && files.length === 1, "Image is required.")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      "Max file size is 5MB.",
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp files are accepted.",
    ),

  name: z.string().min(2, "Branch name must be at least 2 characters."),

  location: z.string().min(2, "Location name must be at least 2 characters."),

  phoneNumber: z.string().regex(usPhoneRegex, "Invalid US phone number"),

  latitude: z.coerce
    .number()
    .min(-90, "Latitude must be >= -90")
    .max(90, "Latitude must be <= 90"),

  longitude: z.coerce
    .number()
    .min(-180, "Longitude must be >= -180")
    .max(180, "Longitude must be <= 180"),
});
export type BranchFormValues = {
  image: undefined | File | string;
  name: string;
  location: string;
  phoneNumber: string;
  latitude: number | unknown;
  longitude: number | unknown;
};
