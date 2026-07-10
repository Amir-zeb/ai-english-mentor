"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup, login } from "@/lib/services/auth.service";
import { useAuth } from "@/lib/auth/AuthContext";
import { toast } from "sonner";

export default function SignupPage() {
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const { setUser } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signup({ firstName, lastName, username, password });
            const user = await login(username, password);
            setUser(user);
            router.push("/");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center">
            <form onSubmit={handleSubmit} className="flex w-80 flex-col gap-4">
                <h1 className="text-xl font-bold">Create account</h1>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className="rounded-lg border border-white/10 px-3 py-2" required />
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className="rounded-lg border border-white/10 px-3 py-2" required />
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="rounded-lg border border-white/10 px-3 py-2" required />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="rounded-lg border border-white/10 px-3 py-2" required />
                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? "Creating account..." : "Sign up"}
                </button>
                <a href="/login" className="text-center text-sm text-white/60">
                    Already have an account? Log in
                </a>
            </form>
        </div>
    );
}