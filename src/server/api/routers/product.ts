import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { supabaseAdmin } from "../../supabase-admin";
import { Bucket } from "@/server/bucket";
import { TRPCError } from "@trpc/server";

export const productRouter = createTRPCRouter({
  getProducts: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;

    const products = await db.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return products;
  }),

  createProduct: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3, "Minimum of 3 characters"),
        price: z.number().min(1000),
        categoryId: z.string(),
        imageUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const newProduct = await db.product.create({
        data: {
          name: input.name,
          price: input.price,
          category: {
            connect: {
              id: input.categoryId,
            },
          },
          imageUrl: input.imageUrl,
        },
      });

      return newProduct;
    }),

  createProductImageUploadSignedUrl: protectedProcedure.mutation(async () => {
    const { data, error } = await supabaseAdmin.storage
      .from(Bucket.ProductImages)
      .createSignedUploadUrl(`${Date.now()}.jpeg`);

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }

    return data;
  }),

  deleteProductById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const product = await db.product.delete({
        where: {
          id: input.id,
        },
      });

      return product;
    }),

  editProduct: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3, "Minimum of 3 characters"),
        price: z.number().min(1000),
        categoryId: z.string(),
        // imageUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const product = await db.product.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          price: input.price,
          category: {
            connect: {
              id: input.categoryId,
            },
          },
          imageUrl: "https://placehold.co/600x400",
        },
      });

      return product;
    }),
});
