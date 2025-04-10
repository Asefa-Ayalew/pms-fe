import z from "zod";
import { InvoiceItem } from "../models/invoice-item.model";
export const InvoiceItemSchema = z.object({
  propertyId: z.string().optional(),
  roomId: z.string(),
  revenueTypeId: z.string(),
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

export type InvoiceItemFormSchema = z.infer<typeof InvoiceItemSchema>;

export const InvoiceItemDefaultValue: InvoiceItem = {
  propertyId: "",
  roomId: "",
  revenueTypeId: "",
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
