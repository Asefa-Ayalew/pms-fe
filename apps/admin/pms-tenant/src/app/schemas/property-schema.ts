import { z } from "zod";

const addressSchema = z.object({
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  subcity: z.string().min(1, "Subcity is required"),
  woreda: z.string().min(1, "Woreda is required"),
  kebele: z.string().min(1, "Kebele is required"),
});

export const propertySchema = z.object({
  address: addressSchema,
  description: z.string().optional(),
  numberOfRooms: z.number().min(1, "Must have at least 1 room"),
  size: z.number().min(1, "Size must be a positive number"),
  isFurnished: z.boolean(),
  amenities: z.array(z.string()).optional(),
});

// Infer TypeScript type
export type FormSchema = z.infer<typeof propertySchema>;

// Default Values
export const defaultValue: FormSchema = {
  address: {
    country: "",
    city: "",
    subcity: "",
    woreda: "",
    kebele: "",
  },
  description: "",
  numberOfRooms: 1,
  size: 1,
  isFurnished: false,
  amenities: [],
};
