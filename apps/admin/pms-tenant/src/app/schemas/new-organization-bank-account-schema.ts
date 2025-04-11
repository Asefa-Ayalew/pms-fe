import z from 'zod';
import { BankAccountType } from '../shared/enum/app.enum';
export const NewOrganizationBankAccountSchema = z.object({
    accountNumber: z.string({
        required_error: "Account Number is Required",
    })
        .regex(/^\d{10,16}$/, "Account number must be 10-16 digits"),
    bankName: z.string()
        .min(3, "Bank name must be at least 3 characters")
        .max(50, "Bank name must be at most 50 characters")
        .regex(/^[a-zA-Z\s]+$/, "Bank name must contain only alphabets and spaces"),

    bankCode: z.string(),
    isActive: z.boolean(),
    accountType: z.nativeEnum(BankAccountType, {
        errorMap: () => ({ message: "Account type must be SAVINGS, CHECKING, BUSINESS, or JOINT" }),
    })
});