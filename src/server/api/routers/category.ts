import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const categoryRouter = createTRPCRouter({
  // GET/READ CATEGORIES
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    const categories = await db.category.findMany({
      select: {
        id: true,
        name: true,
        productCount: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return categories;
  }),

  // CREATE A CATEGORY
  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3, "Minimum 3 characters required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const newCategory = await db.category.create({
        data: {
          name: input.name,
        },
        select: {
          id: true,
          name: true,
          productCount: true,
        },
      });

      return newCategory;
    }),

  // UPDATE A CATEGORY
  editCategory: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3, "Minimum 3 characters required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const updatedCategory = await db.category.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
      });

      return updatedCategory;
    }),

  // DELETE A CATEGORY
  deleteCategory: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      await db.category.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
