"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const registerSchema = z
  .object({
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
    role: z.enum(["PARENT", "TUTOR"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "PARENT",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    await authClient.signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.name,
        // @ts-expect-error - Better Auth will handle additional fields
        role: values.role,
      },
      {
        onSuccess: () => {
          // Redirect based on role
          if (values.role === "PARENT") {
            router.push("/dashboard");
          } else if (values.role === "TUTOR") {
            router.push("/tutor/dashboard");
          }
        },
        onError: (ctx) => {
          toast.error(ctx.error.error);
        },
      },
    );
  };

  const isPending = form.formState.isSubmitting;

  return (
    <Card className="border-slate-200 shadow-none">
      <CardHeader className="text-center space-y-2 animate-slide-up">
        <CardTitle
          className="text-4xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Tạo tài khoản mới
        </CardTitle>
        <p
          className="text-slate-600 text-base"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Bắt đầu hành trình học tập ngay hôm nay
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4 animate-slide-up delay-100">
              <Button
                variant="outline"
                className="w-full h-12 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
                type="button"
                disabled={isPending}
                style={{ fontFamily: "var(--font-body)" }}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Tiếp tục với Google
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
                type="button"
                disabled={isPending}
                style={{ fontFamily: "var(--font-body)" }}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Tiếp tục với Github
              </Button>
            </div>

            <div className="relative animate-slide-up delay-150">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span
                  className="bg-white px-2 text-slate-500"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  hoặc tiếp tục với email
                </span>
              </div>
            </div>

            <div className="space-y-4 animate-slide-up delay-200">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className="text-slate-700 font-medium"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Bạn là:
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => field.onChange("PARENT")}
                          className={`px-4 py-3 rounded-lg border-2 font-medium transition ${field.value === "PARENT"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-slate-200 hover:border-slate-300"
                            }`}
                        >
                          Phụ huynh
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange("TUTOR")}
                          className={`px-4 py-3 rounded-lg border-2 font-medium transition ${field.value === "TUTOR"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-slate-200 hover:border-slate-300"
                            }`}
                        >
                          Gia sư
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className="text-slate-700 font-medium"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Họ và tên
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Nguyễn Văn A"
                        className="h-12 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150"
                        style={{ fontFamily: "var(--font-body)" }}
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className="text-slate-700 font-medium"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        className="h-12 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150"
                        style={{ fontFamily: "var(--font-body)" }}
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className="text-slate-700 font-medium"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Mật khẩu
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Tạo mật khẩu"
                        className="h-12 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150"
                        style={{ fontFamily: "var(--font-body)" }}
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className="text-slate-700 font-medium"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Xác nhận mật khẩu
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Nhập lại mật khẩu"
                        className="h-12 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150"
                        style={{ fontFamily: "var(--font-body)" }}
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 animate-slide-up delay-250">
              <Button
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                type="submit"
                disabled={isPending}
                style={{ fontFamily: "var(--font-body)" }}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tạo tài khoản...
                  </>
                ) : (
                  "Tạo tài khoản"
                )}
              </Button>

              <p
                className="text-center text-sm text-slate-600"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Đã có tài khoản?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/90 font-medium underline transition-colors duration-150"
                >
                  Đăng nhập
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
