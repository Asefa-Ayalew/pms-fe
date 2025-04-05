import { z } from "zod";

export const NewRevenueTypeSchema = z.object({
    name: z.string()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name must be at most 50 characters")
        .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
        .trim(),
    code: z.string()
        .min(2, "Code must be at least 2 characters")
        .max(10, "Code must be at most 10 characters")
        .regex(/^(?=.*[A-Z])(?=.*\d)[A-Z0-9]+$/, "Code must contain at least one uppercase letter and one number")
        .trim(),
    description: z.string()
        .min(5, "Description must be at least 5 characters")
        .max(255, "Description must be at most 255 characters")
        .trim(),
    isActive: z.boolean()
        .default(true),
});
