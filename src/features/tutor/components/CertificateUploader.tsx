"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Link as LinkIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface CertificateUploaderProps {
    value?: string[];
    onChange: (urls: string[]) => void;
    maxFiles?: number;
}

export function CertificateUploader({
    value = [],
    onChange,
    maxFiles = 5,
}: CertificateUploaderProps) {
    const [urlInput, setUrlInput] = useState("");
    const [urlName, setUrlName] = useState("");

    const parseUrlData = (data: string) => {
        try {
            const parsed = JSON.parse(data);
            return { url: parsed.url, name: parsed.name };
        } catch {
            return { url: data, name: null };
        }
    };

    const handleAddUrl = () => {
        // Validate empty input
        if (!urlInput.trim()) {
            toast.error("Vui lòng nhập link chứng chỉ");
            return;
        }

        // Validate max files limit
        if (value.length >= maxFiles) {
            toast.error(`Bạn chỉ có thể thêm tối đa ${maxFiles} chứng chỉ`);
            return;
        }

        // Validate URL format
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(urlInput.trim());
        } catch {
            toast.error("Link không hợp lệ. Vui lòng nhập URL đầy đủ (bắt đầu với http:// hoặc https://)");
            return;
        }

        // Validate protocol
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            toast.error("Link phải bắt đầu với http:// hoặc https://");
            return;
        }

        // Validate hostname
        if (!parsedUrl.hostname || parsedUrl.hostname.length < 3) {
            toast.error("Link không hợp lệ. Vui lòng kiểm tra lại địa chỉ");
            return;
        }

        // Check for duplicate URLs
        const isDuplicate = value.some((certString) => {
            const { url } = parseUrlData(certString);
            return url === urlInput.trim();
        });

        if (isDuplicate) {
            toast.error("Link này đã được thêm rồi");
            return;
        }

        // Validate name length if provided
        if (urlName.trim() && urlName.trim().length > 100) {
            toast.error("Tên chứng chỉ không được vượt quá 100 ký tự");
            return;
        }

        // Store URL with optional name as JSON string
        const urlData = urlName.trim()
            ? JSON.stringify({ url: urlInput.trim(), name: urlName.trim() })
            : urlInput.trim();

        onChange([...value, urlData]);
        toast.success("Đã thêm chứng chỉ");
        setUrlInput("");
        setUrlName("");
    };

    const handleRemove = (index: number) => {
        const newUrls = value.filter((_, i) => i !== index);
        onChange(newUrls);
        toast.success("Đã xóa chứng chỉ");
    };

    return (
        <div className="space-y-4">
            {/* Add URL Form */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                    <Label htmlFor="cert-url">Link chứng chỉ *</Label>
                    <Input
                        id="cert-url"
                        type="url"
                        placeholder="https://example.com/certificate.pdf"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddUrl();
                            }
                        }}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cert-name">Tên chứng chỉ (tùy chọn)</Label>
                    <Input
                        id="cert-name"
                        type="text"
                        placeholder="VD: IELTS 7.5, TOEFL 100, Bằng Đại học..."
                        value={urlName}
                        onChange={(e) => setUrlName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddUrl();
                            }
                        }}
                    />
                </div>
                <Button
                    type="button"
                    onClick={handleAddUrl}
                    variant="outline"
                    className="w-full"
                    disabled={value.length >= maxFiles}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm chứng chỉ
                </Button>
            </div>

            <p className="text-xs text-muted-foreground">
                Thêm link chứng chỉ (Google Drive, Dropbox, v.v.).
                ({value.length}/{maxFiles})
            </p>

            {/* Certificate List */}
            {value.length > 0 && (
                <div className="space-y-2">
                    <Label>Danh sách chứng chỉ ({value.length})</Label>
                    <div className="grid gap-2">
                        {value.map((certString, index) => {
                            const { url, name } = parseUrlData(certString);
                            return (
                                <div
                                    key={index}
                                    className="group relative flex items-center gap-3 p-3 border rounded-lg bg-background hover:border-primary/50 transition-colors"
                                >
                                    <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        {name && (
                                            <div className="font-medium text-sm mb-0.5">{name}</div>
                                        )}
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-muted-foreground hover:text-primary truncate block"
                                        >
                                            {url}
                                        </a>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleRemove(index);
                                        }}
                                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {value.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                    Chưa có chứng chỉ nào. Thêm link chứng chỉ của bạn ở trên.
                </div>
            )}
        </div>
    );
}
