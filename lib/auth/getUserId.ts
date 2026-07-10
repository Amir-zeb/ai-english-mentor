import { NextRequest } from "next/server";

export function getUserId(req: NextRequest): string {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
        throw new Error("Missing x-user-id header — route not protected by middleware?");
    }
    return userId;
}