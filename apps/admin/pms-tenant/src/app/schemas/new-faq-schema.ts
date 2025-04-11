import z from 'zod';
export const NewFaqSchema = z.object({
    name: z.string({
        required_error: "Faq`s Name is required",
    }),
    description: z.string().optional(),  
});