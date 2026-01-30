"use client"

import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export function SignoutButton() {

    return (
        <button
            className="text-gray-600 hover:text-gray-900 font-medium"
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
            Đăng xuất
        </button>
    )

}