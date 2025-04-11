import z from "zod";
export const GenerateBankSlipSchema = z.object({
  fromAccountId: z.string(),
  mergeSimilarReceivers: z.boolean(),
});

export type GenerateBankSlipFormSchema = z.infer<typeof GenerateBankSlipSchema>;

export const GenerateBankSlipDefaultValues: GenerateBankSlipFormSchema = {
  fromAccountId: "",
  mergeSimilarReceivers: false,
};
