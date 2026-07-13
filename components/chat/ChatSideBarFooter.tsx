"use client";

import { useState, useRef, useEffect } from "react";
import { MdSettings, MdVolumeUp, MdVolumeOff, MdLogout } from "react-icons/md";
import { useAuth } from "@/lib/auth/AuthContext";
import { logout } from "@/lib/services/auth.service";
import { useRouter } from "next/navigation";

type ChatSidebarFooterT = {
    autoSpeak: boolean,
    setAutoSpeak: (value: boolean) => void
}

export default function ChatSidebarFooter({ autoSpeak, setAutoSpeak }: ChatSidebarFooterT) {
    const { user, setUser } = useAuth();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        setUser(null);
        router.push("/login");
    };

    return (
        <div ref={menuRef} className="relative border-t border-white/10 p-3">
            {isMenuOpen && (
                <div className="absolute bottom-full left-3 mb-2 w-56 rounded-xl border border-white/10 bg-slate-900 p-2 shadow-lg">
                    <button
                        type="button"
                        onClick={() => setAutoSpeak(!autoSpeak)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/10"
                    >
                        {autoSpeak ? <MdVolumeUp /> : <MdVolumeOff />}
                        Auto-speak replies: {autoSpeak ? "On" : "Off"}
                    </button>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-white/10"
                    >
                        <MdLogout />
                        Log out
                    </button>
                </div>
            )}

            <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-2 hover:bg-white/10"
            >
                <span className="truncate text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                </span>
                <MdSettings className="text-white/50" />
            </button>
        </div>
    );
}