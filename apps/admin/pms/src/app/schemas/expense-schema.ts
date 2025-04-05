import z from "zod";
import { Expense } from "../models/expense.model";
export const ExpenseSchema = z.object({
  propertyId: z.string().optional(),
  roomId: z.string(),
  expenseTypeId: z.string(),
  unitPrice: z.number().optional(),
  taxable: z.boolean().optional(),
  numUnits: z.number().optional(),
  chargeCode: z.string().optional(),
  remark: z.string().optional(),
  totalAmount: z.number().optional(),
  finalAmount: z.number().optional(),
  totalTax: z.number().optional(),
  totalDiscount: z.number().optional(),
  discountPercent: z.number().optional(),
  //   metadata: z.object().optional(),
});

export type ExpenseFormSchema = z.infer<typeof ExpenseSchema>;

export const expenseDefaultValue: Expense = {
  propertyId: "",
  roomId: "",
  expenseTypeId: "",
  unitPrice: 0,
  taxable: false,
  numUnits: 0,
  chargeCode: "",
  remark: "",
  totalAmount: 0,
  finalAmount: 0,
  totalTax: 0,
  totalDiscount: 0,
  discountPercent: 0,
  //   metadata: {},
};
