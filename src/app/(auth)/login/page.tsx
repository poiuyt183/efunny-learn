import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";
import { requireUnauth } from "@/lib/auth-utils";

export const metadata: Metadata = {
  title: "Đăng Nhập - FunnyLearn",
  description: "Đăng nhập vào tài khoản FunnyLearn để tiếp tục học",
};

export const Page = async () => {
  await requireUnauth();
  return <LoginForm />;
};

export default Page;
