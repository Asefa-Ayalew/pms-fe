import z from 'zod';
export const NewPropertySchema = z.object({
    name: z.string({
        required_error: "Property`s Name is required",
    }),
    description: z.string().optional(),  
});