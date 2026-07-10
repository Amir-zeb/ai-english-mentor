"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/services/auth.service";
import { AuthUser } from "../types";

type AuthContextType = {
    user: AuthUser | null;
    loading: boolean;
    setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCurrentUser()
            .then(setUser)
            .finally(() => setLoading(false));
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}