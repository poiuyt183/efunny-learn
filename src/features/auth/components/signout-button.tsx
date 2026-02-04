"use client"

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";

export function SignoutButton({ title }: { title?: string }) {

    return (
        <Button
            variant={"ghost"}
            size={"sm"}
            // className="text-gray-600 hover:text-gray-900 font-medium"
            onClick={async () => {
                await authClient.signOut({
                    fetchOptions: {
                        onSuccess: () => {
                            redirect("/login"); // redirect to login page
                        },
                    },
                });
            }}
        >
            <LogOut className="h-4 w-4" />
            {title ? <span className="ml-2">{title}</span> : null}
        </Button>
    )

}