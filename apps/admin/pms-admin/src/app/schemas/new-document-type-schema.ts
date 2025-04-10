import { z } from "zod";

export const NewDocumentTypeSchema = z.object({
    name: z.string().trim()
        .min(3, { message: "Name must be at least 3 characters long" })
        .max(50, { message: "Name must be at most 50 characters long" })
        .regex(/^[A-Za-z\s]+$/, { message: "Name must contain only letters and spaces" }),
    code: z.string().trim()
        .min(2, { message: "Code must be at least 2 characters long" })
        .max(20, { message: "Code must be at most 20 characters long" })
        .regex(/^[A-Z0-9_-]+$/, { message: "Code must contain only uppercase letters, numbers, underscores, or dashes" }),
    description: z.string().trim()
        .min(5, { message: "Description must be at least 5 characters long" })
        .max(255, { message: "Description must be at most 255 characters long" }),
    isMandatory: z.boolean().default(true).optional(),
    hasExpirationDate: z.boolean().default(true).optional(),
});

