import z from "zod";
export const PayableModalSchema = z.object({
  propertyId: z.string().optional(),
  roomId: z.string().optional(),
  receiverId: z.string().optional(),
  receiverName: z.string().optional(),
  receiverType: z.string().optional(),
  receiverAccount: z.string().optional(),
  bankName: z.string().optional(),
});

export type PayableModalFormSchema = z.infer<typeof PayableModalSchema>;

export const payableModalDefaultValues: PayableModalFormSchema = {
  propertyId: "",
  roomId: "",
  receiverId: "",
  receiverName: "",
  receiverType: "",
  receiverAccount: "",
  bankName: "",
};
