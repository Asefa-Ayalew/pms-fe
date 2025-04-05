import z from "zod";
export const PayableSchema = z.object({
  propertyId: z.string().optional(),
  roomId: z.string().optional(),
  receiverId: z.string().optional(),
  receiverName: z.string().optional(),
  receiverType: z.string().optional(),
  payableType: z.string().optional(),
  receiverAccount: z.string().optional(),
  bankName: z.string().optional(),
  remark: z.string().optional(),
  totalAmount: z.number().optional(),
  finalAmount: z.number().optional(),
  totalTax: z.number().optional(),
  totalDiscount: z.number().optional(),
  metadata: z.any().optional(),
});

export type PayableFormSchema = z.infer<typeof PayableSchema>;

export const payableDefaultValues: PayableFormSchema = {
  propertyId: "",
  roomId: "",
  receiverId: "",
  receiverName: "",
  receiverType: "",
  payableType: "",
  receiverAccount: "",
  bankName: "",
  remark: "",
  totalAmount: 0,
  finalAmount: 0,
  totalTax: 0,
  totalDiscount: 0,
};
