import z from "zod";
export const LeaseSchema = z.object({
  propertyId: z.string().optional(),
  roomId: z.string(),
  contractorId: z.string(),
  monthlyRent: z.number(),
  startDate: z.date(),
  endDate: z.date(),
});

export type LeaseFormSchema = z.infer<typeof LeaseSchema>;

export const LeaseDefaultValues: LeaseFormSchema = {
  propertyId: "",
  roomId: "",
  contractorId: "",
  monthlyRent: 0,
  startDate: new Date(),
  endDate: new Date(),
};

// lease document
export const leaseDocumentSchema = z.object({
  documentTypeId: z.string(),
  tenantId: z.string(),
  reference: z.string(),
  description: z.string(),
});

export type leaseDocumentFormSchema = z.infer<typeof leaseDocumentSchema>;

export const leaseDocumentDefaultValues: leaseDocumentFormSchema = {
  documentTypeId: "",
  tenantId: "",
  reference: "",
  description: "",
};
