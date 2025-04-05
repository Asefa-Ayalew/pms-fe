import z from "zod";
export const ReceivableSchema = z.object({
  propertyId: z.string().optional(),
  roomId: z.string().optional(),
  creditorId: z.string().optional(),
  creditorName: z.string().optional(),
  creditorType: z.string().optional(),
  invoiceType: z.string().optional(),
  creditorAccount: z.string().optional(),
  bankName: z.string().optional(),
  remark: z.string().optional(),
  totalAmount: z.number().optional(),
  finalAmount: z.number().optional(),
  totalTax: z.number().optional(),
  totalDiscount: z.number().optional(),
  metadata: z.any().optional(),
});

export type ReceivableFormSchema = z.infer<typeof ReceivableSchema>;

export const receivableDefaultValues: ReceivableFormSchema = {
  propertyId: "",
  roomId: "",
  creditorId: "",
  creditorName: "",
  creditorType: "",
  invoiceType: "",
  creditorAccount: "",
  bankName: "",
  remark: "",
  totalAmount: 0,
  finalAmount: 0,
  totalTax: 0,
  totalDiscount: 0,
};
