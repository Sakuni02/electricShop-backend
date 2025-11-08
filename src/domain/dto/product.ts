import { z } from "zod";

const CreateProductDTO = z.object({
    categoryId: z.string().min(1),
    brandId: z.string().min(1),
    colorId: z.string().min(1),
    name: z.string().min(1),
    image: z.string().min(1),
    stock: z.number(),
    price: z.number().nonnegative(),
    description: z.string().optional(),
    specifications: z
        .array(
            z.object({
                key: z.string().min(1, "Key is required"),
                value: z.string().min(1, "Value is required"),
            })
        )
        .optional(),
});

export { CreateProductDTO };