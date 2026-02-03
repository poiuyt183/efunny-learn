"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createChildAccount } from "../actions/child-account-actions";
import { UserPlus, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const createAccountSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
});

type CreateAccountInput = z.infer<typeof createAccountSchema>;

interface CreateChildAccountDialogProps {
    childId: string;
    childName: string;
}

export function CreateChildAccountDialog({
    childId,
    childName,
}: CreateChildAccountDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [credentials, setCredentials] = useState<{ email: string; password: string }>();
    const [copied, setCopied] = useState(false);

    const form = useForm<CreateAccountInput>({
        resolver: zodResolver(createAccountSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: CreateAccountInput) => {
        setLoading(true);

        const result = await createChildAccount({
            childId,
            email: data.email,
            password: data.password,
        });

        if (result.success) {
            setSuccess(true);
            setCredentials({ email: data.email, password: data.password });
            toast.success("Tạo tài khoản thành công!");
        } else {
            toast.error(result.error || "Có lỗi xảy ra");
        }

        setLoading(false);
    };

    const handleCopy = () => {
        if (credentials) {
            const text = `Tài khoản học tập của ${childName}\nEmail: ${credentials.email}\nMật khẩu: ${credentials.password}\nĐăng nhập tại: ${window.location.origin}/learn/login`;
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success("Đã sao chép!");
        }
    };

    const handleClose = () => {
        setOpen(false);
        setTimeout(() => {
            setSuccess(false);
            setCredentials(undefined);
            form.reset();
        }, 300);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Tạo tài khoản học tập
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Tạo tài khoản học tập cho {childName}</DialogTitle>
                    <DialogDescription>
                        Tạo tài khoản để {childName} có thể đăng nhập và sử dụng AI Linh vật độc lập
                    </DialogDescription>
                </DialogHeader>

                {success && credentials ? (
                    <div className="space-y-4">
                        <Alert className="bg-green-50 border-green-200">
                            <AlertDescription>
                                <div className="space-y-3">
                                    <p className="font-semibold text-green-900">
                                        ✅ Tạo tài khoản thành công!
                                    </p>
                                    <div className="bg-white p-3 rounded border border-green-200 space-y-2">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Email</p>
                                            <p className="font-mono text-sm">{credentials.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Mật khẩu</p>
                                            <p className="font-mono text-sm">{credentials.password}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Đăng nhập tại</p>
                                            <p className="font-mono text-sm text-primary">/learn/login</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-green-800">
                                        ⚠️ Hãy lưu lại thông tin này! Bạn sẽ không thể xem lại mật khẩu.
                                    </p>
                                </div>
                            </AlertDescription>
                        </Alert>

                        <div className="flex gap-2">
                            <Button onClick={handleCopy} variant="outline" className="flex-1">
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Đã sao chép
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 mr-2" />
                                        Sao chép thông tin
                                    </>
                                )}
                            </Button>
                            <Button onClick={handleClose} className="flex-1">
                                Đóng
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email đăng nhập</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="email@example.com"
                                                {...field}
                                                disabled={loading}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Email này sẽ được dùng để đăng nhập vào trang /learn/login
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mật khẩu</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Tối thiểu 6 ký tự"
                                                {...field}
                                                disabled={loading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Xác nhận mật khẩu</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Nhập lại mật khẩu"
                                                {...field}
                                                disabled={loading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Alert>
                                <AlertDescription className="text-xs">
                                    💡 <strong>Lưu ý:</strong> Hãy chọn email và mật khẩu đơn giản để con bạn
                                    dễ nhớ. Bạn có thể đổi mật khẩu sau.
                                </AlertDescription>
                            </Alert>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    disabled={loading}
                                    className="flex-1"
                                >
                                    Hủy
                                </Button>
                                <Button type="submit" disabled={loading} className="flex-1">
                                    {loading ? "Đang tạo..." : "Tạo tài khoản"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
