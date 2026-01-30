import type { UserRole } from "@/generated/prisma/client";

declare module "better-auth" {
  interface User {
    role: UserRole;
  }
}
