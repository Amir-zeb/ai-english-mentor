import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/models/User";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const { username, password } = body;

    if (!username || !password) {
        return NextResponse.json(
            { error: "username and password are required" },
            { status: 400 }
        );
    }

    await connectDB();

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
        return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
        return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const token = await signToken({
        userId: user._id.toString(),
        username: user.username,
    });

    const response = NextResponse.json({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
    });

    response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days, matches JWT expiry
    });

    return response;
}