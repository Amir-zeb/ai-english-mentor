'use client'

import { useState } from "react";
import Link from "next/link";
import { AiOutlineLogout } from "react-icons/ai";
import { logout } from "@/lib/services/auth.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Header() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter()

    const handleLogout = async () => {
        try {
            setIsLoading(true)
            await logout()
            router.replace('/login')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to logout.");
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <header className="border-b border-slate-500 bg-black">
            <div className="flex flex-row justify-between items-center gap-4 p-4">
                <div>
                    <h4 className="text-2xl">Mentor</h4>
                </div>
                <nav>
                    <ul className="flex flex-row justify-between items-center gap-4">
                        <li>
                            <Link href='/chat'
                                className="text-sm"
                            >Chat</Link>
                        </li>
                        <li>
                            <button
                                disabled={isLoading}
                                type="button"
                                onClick={handleLogout}
                                className="btn-primary"
                            >
                                <AiOutlineLogout size={18} />
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}