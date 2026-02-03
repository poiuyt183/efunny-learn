import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import prisma from "@/lib/db";

export const childRouter = createTRPCRouter({
    // Get all spirit animals
    getSpiritAnimals: baseProcedure.query(async () => {
        return await prisma.spiritAnimal.findMany({
            orderBy: { name: "asc" },
        });
    }),

    // Get spirit animal by id
    getSpiritAnimalById: baseProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            return await prisma.spiritAnimal.findUnique({
                where: { id: input.id },
            });
        }),

    // Get spirit animal by slug
    getSpiritAnimalBySlug: baseProcedure
        .input(z.object({ slug: z.string() }))
        .query(async ({ input }) => {
            return await prisma.spiritAnimal.findUnique({
                where: { slug: input.slug },
            });
        }),
});
