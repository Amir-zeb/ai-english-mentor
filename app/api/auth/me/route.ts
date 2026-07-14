import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/models/User";
import { verifyToken } from "@/lib/auth/jwt";

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Returns the authenticated user
 *     responses:
 *       200:
 *         description: User returned successfully
 *       401:
 *         description: Unauthorized
 */
export async function GET(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(payload.userId).select("firstName lastName username");
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    return NextResponse.json({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
    });
}