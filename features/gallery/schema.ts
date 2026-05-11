import * as z from "zod";

export const galleryStatusOptions = [
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" },
] as const;

const nullableText = z
  .string()
  .trim()
  .transform((value) => (value ? value : null));

export const gallerySchema = z.object({
  image: z.union([
    z.string().url("Image is required"),
    z.array(z.instanceof(File)).min(1, "Image is required"),
  ]),
  title: nullableText,
  category: nullableText,
  featured: z.boolean(),
  status: z.enum(["active", "disabled"]),
});

export type GalleryFormValues = z.input<typeof gallerySchema>;
export type GalleryPayload = z.output<typeof gallerySchema>;
