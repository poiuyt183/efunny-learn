import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/register-form";
import { requireUnauth } from "@/lib/auth-utils";

export const metadata: Metadata = {
  title: "Tạo Tài Khoản - FunnyLearn",
  description: "Tạo tài khoản FunnyLearn để bắt đầu hành trình học tập của bạn",
};

const Page = async () => {
  await requireUnauth();
  return <RegisterForm />;
};

export default Page;
