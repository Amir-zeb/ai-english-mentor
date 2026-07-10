import { AuthUser } from "../types";

export async function signup(data: {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
}): Promise<AuthUser> {
    const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Signup failed");
    return result;
}

export async function login(username: string, password: string): Promise<AuthUser> {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Login failed");
    return result;
}

export async function logout(): Promise<void> {
    await fetch("/api/auth/logout", { method: "POST" });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
    const response = await fetch("/api/auth/me");
    if (!response.ok) return null;
    return response.json();
}