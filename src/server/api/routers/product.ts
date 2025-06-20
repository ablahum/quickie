import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { supabaseAdmin } from "@/server/supabase-admin";
import { Bucket } from "@/server/bucket";
import { TRPCError } from "@trpc/server";
import type { Prisma } from "@prisma/client";

export function extractPathFromSupabaseUrl(url: string): string {
  const parts = url.split("/object/public/");
  return parts[1] ?? "";
}

export const productRouter = createTRPCRouter({
  // GET/READ PRODUCTS ------------------------------------------------
  getProducts: protectedProcedure
    .input(
      z.object({
        categoryId: z.string(),
        search: z.string().optional().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const whereClause: Prisma.ProductWhereInput = {};

      if (input.categoryId !== "ALL") whereClause.categoryId = input.categoryId;

      if (input.search.trim() !== "") {
        whereClause.name = {
          contains: input.search,
          mode: "insensitive",
        };
      }

      const products = await db.product.findMany({
        where: whereClause,
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

  // CREATE A PRODUCT -------------------------------------------------
  createProduct: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3, "Minimum of 3 characters required"),
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

  // UPLOAD A PRODUCT's IMAGE -----------------------------------------
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

  // UPDATE A PRODUCT -------------------------------------------------
  updateProduct: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3).max(100),
        price: z.coerce.number().min(1000),
        categoryId: z.string(),
        imageUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      await db.product.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          price: input.price,
          categoryId: input.categoryId,
          imageUrl: input.imageUrl,
        },
      });
    }),

  // DELETE A PRODUCT -------------------------------------------------
  deleteProduct: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      await db.product.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
