import { z } from "zod";

export const productFormSchema = z.object({
  name: z
    .string()
    .min(3, {
      message: "Name is required",
    })
    .max(50),
  price: z.coerce.number({ message: "Price is required" }).min(1000),
  categoryId: z.string({ message: "Category is required" }),
  imageUrl: z.string().url({ message: "Image URL must be a valid URL" }),
});

export type ProductFormSchema = z.infer<typeof productFormSchema>;
