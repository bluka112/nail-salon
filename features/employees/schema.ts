// Zod schema for the employee form. Drives both validation (per-field on blur,
// whole form on submit) and the typed payload sent to the API. Text inputs
// produce strings; `latitude`/`longitude` are validated as numeric strings
// then `.transform(Number)` so the parsed payload has real numbers.
import * as z from "zod";

const usPhoneRegex = /^\+?1?\s*\(?[2-9]\d{2}\)?[\s.-]?[2-9]\d{2}[\s.-]?\d{4}$/;
export const employeeSchema = z.object({
  name: z.string().min(2, "Employee name must be at least 2 characters."),
  phoneNumber: z.string(),
  branchId: z.string().nonempty("put your branch"),
});
// (usPhoneRegex, "Invalid US phone number"),

export type EmployeeFormValues = z.input<typeof employeeSchema>;
export type EmployeePayload = z.output<typeof employeeSchema>;
