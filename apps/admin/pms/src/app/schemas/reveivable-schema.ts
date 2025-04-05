import z from "zod";
export const ReceivableSchema = z.object({
  propertyId: z.string().optional(),
  roomId: z.string().optional(),
  creditorId: z.string().optional(),
  creditorName: z.string().optional(),
  creditorType: z.string().optional(),
  creditorAccount: z.string().optional(),
  bankName: z.string().optional(),
});

export type ReceivableFormSchema = z.infer<typeof ReceivableSchema>;

export const ReceivableDefaultValues: ReceivableFormSchema = {
  propertyId: "",
  roomId: "",
  creditorId: "",
  creditorName: "",
  creditorType: "",
  creditorAccount: "",
  bankName: "",
};
