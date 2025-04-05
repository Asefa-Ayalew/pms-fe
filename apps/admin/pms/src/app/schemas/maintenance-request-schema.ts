import z from "zod";
export const MaintenanceRequestSchema = z.object({
  title: z.string({
    required_error: "Title is Required",
  }),
  tenantId: z.string().optional(),
  propertyId: z.string().optional(),
  roomId: z.string().optional(),
  description: z.string().optional(),
});
export type MaintenanceRequestFormSchema = z.infer<
  typeof MaintenanceRequestSchema
>;

export const MaintenanceRequestDefaultValues: MaintenanceRequestFormSchema = {
  title: "",
  tenantId: "",
  propertyId: "",
  roomId: "",
  description: "",
};
