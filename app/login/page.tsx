"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login } from "@/lib/services/auth.service";
import { useAuth } from "@/lib/auth/AuthContext";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { setUser } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(username, password);
            setUser(user);
            router.push("/");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center">
            <form onSubmit={handleSubmit} className="flex w-80 flex-col gap-4">
                <h1 className="text-xl font-bold">Log in</h1>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="rounded-lg border border-white/10 px-3 py-2"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="rounded-lg border border-white/10 px-3 py-2"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                >
                    {loading ? "Logging in..." : "Log in"}
                </button>
                <a href="/signup" className="text-center text-sm text-white/60">
                    Don&apos;t have an account? Sign up
                </a>
            </form>
        </div>
    );
}