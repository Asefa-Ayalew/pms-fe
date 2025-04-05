import z from "zod";
export const MarkAsPidSchema = z.object({
  transactionDate: z.date().optional(),
  transactionType: z.string().optional(),
  transactionReference: z.string().optional(),
  serviceCharge: z.number(),
  paymentMethod: z.string().optional(),
  paidDate: z.date().optional(),
  paidById: z.string().optional(),
  fromAccountId: z.string().optional(),
  remark: z.string().optional(),
});

export type MarkAsPidFormSchema = z.infer<typeof MarkAsPidSchema>;

export const MarkAsPidDefaultValues: MarkAsPidFormSchema = {
  transactionDate: new Date(),
  transactionType: "",
  transactionReference: "",
  serviceCharge: 0,
  paymentMethod: "",
  paidDate: new Date(),
  paidById: "",
  fromAccountId: "",
  remark: "",
};
