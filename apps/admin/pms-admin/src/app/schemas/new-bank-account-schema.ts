import { z } from "zod"; // Import the enum
import { OwnerType } from "../models/bank-account.model";

export const NewBankAccountSchema = z.object({
    accountNumber: z.string()
        .regex(/^\d{10,16}$/, "Account number must be 10-16 digits"),

    tenantId: z.string().uuid("Invalid Tenant ID format").optional(),

    bankName: z.string()
        .min(3, "Bank name must be at least 3 characters")
        .max(50, "Bank name must be at most 50 characters")
        .regex(/^[a-zA-Z\s]+$/, "Bank name must contain only alphabets and spaces"),

    bankCode: z.string(),
    // .min(1, "Bank code must be at least 3 characters")
    // .max(10, "Bank code must be at most 10 characters")
    // .regex(/^[a-zA-Z0-9]+$/, "Bank code must be alphanumeric"),

    ownerName: z.string()
        .min(3, "Owner name must be at least 3 characters")
        .max(50, "Owner name must be at most 50 characters")
        .regex(/^[a-zA-Z\s]+$/, "Owner name must contain only alphabets and spaces"),

    ownerId: z.string().uuid("Invalid Owner ID format"),

    isPreferred: z.boolean(),

    ownerType: z.nativeEnum(OwnerType, {
        errorMap: () => ({ message: "Owner type must be INDIVIDUAL, GOVERNMENTAL, COMPANY, or ORGANIZATION" }),
    }),
});

export type NewBankAccountSchema = z.infer<typeof NewBankAccountSchema>;
