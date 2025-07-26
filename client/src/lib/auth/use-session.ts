"use client";

import { authClient } from "@/lib/auth-client";

export function useAuth() {
    const {data ,isPending, error,refetch } = authClient.useSession();

    const user = data?.user ?? null;
    const session = data?.user ?? null;
    const isAuthenticated = !!user;

    return {
        session,
        user,
        isPending,
        isAuthenticated,
        error,
        refetch,
    };
}
