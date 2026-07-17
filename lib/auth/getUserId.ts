import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";

export function getUserId(req: NextRequest): string {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
        throw new Error("Missing x-user-id header — route not protected by middleware?");
    }
    return userId;
}

export async function getServerUserId(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    return payload?.userId ?? null;
}