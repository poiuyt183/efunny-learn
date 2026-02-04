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
    username: z.string()
        .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
        .max(20, "Tên đăng nhập không được quá 20 ký tự")
        .regex(/^[a-z0-9_]+$/, "Tên đăng nhập chỉ được chứa chữ thường, số và dấu gạch dưới"),
    pin: z.string()
        .length(4, "Mã PIN phải có đúng 4 chữ số")
        .regex(/^\d{4}$/, "Mã PIN chỉ được chứa số"),
    confirmPin: z.string(),
}).refine((data) => data.pin === data.confirmPin, {
    message: "Mã PIN không khớp",
    path: ["confirmPin"],
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
    const [credentials, setCredentials] = useState<{ username: string; pin: string }>();
    const [copied, setCopied] = useState(false);

    const form = useForm<CreateAccountInput>({
        resolver: zodResolver(createAccountSchema),
        defaultValues: {
            username: "",
            pin: "",
            confirmPin: "",
        },
    });

    const onSubmit = async (data: CreateAccountInput) => {
        setLoading(true);

        const result = await createChildAccount({
            childId,
            username: data.username,
            pin: data.pin,
        });

        if (result.success) {
            setSuccess(true);
            setCredentials({ username: data.username, pin: data.pin });
            toast.success("Tạo tài khoản thành công!");
        } else {
            toast.error(result.error || "Có lỗi xảy ra");
        }

        setLoading(false);
    };

    const handleCopy = () => {
        if (credentials) {
            const text = `Tài khoản học tập của ${childName}\nTên đăng nhập: ${credentials.username}\nMã PIN: ${credentials.pin}\nĐăng nhập tại: ${window.location.origin}/learn/login`;
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
                        Tạo tên đăng nhập và mã PIN để {childName} có thể đăng nhập và sử dụng AI Linh vật độc lập
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
                                            <p className="text-xs text-muted-foreground">Tên đăng nhập</p>
                                            <p className="font-mono text-sm">{credentials.username}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Mã PIN</p>
                                            <p className="font-mono text-sm">{credentials.pin}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Đăng nhập tại</p>
                                            <p className="font-mono text-sm text-primary">/learn/login</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-green-800">
                                        ⚠️ Hãy lưu lại thông tin này! Bạn sẽ không thể xem lại mã PIN.
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
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tên đăng nhập</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="vidu123"
                                                {...field}
                                                disabled={loading}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Chỉ được chứa chữ thường, số và dấu gạch dưới (3-20 ký tự)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="pin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mã PIN (4 chữ số)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="1234"
                                                maxLength={4}
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
                                name="confirmPin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Xác nhận mã PIN</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Nhập lại mã PIN"
                                                maxLength={4}
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
                                    💡 <strong>Lưu ý:</strong> Hãy chọn tên đăng nhập và mã PIN đơn giản để con bạn
                                    dễ nhớ. Bạn có thể đổi mã PIN sau.
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
