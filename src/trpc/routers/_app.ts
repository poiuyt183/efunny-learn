import prisma from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "../init";
import { tutorRouter } from "./tutor";
import { childRouter } from "./child";

export const appRouter = createTRPCRouter({
  getUsers: baseProcedure.query((_opts) => {
    return prisma.user.findMany();
  }),
  tutor: tutorRouter,
  child: childRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
