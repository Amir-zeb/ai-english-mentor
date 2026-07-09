import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/models/User";
import { hashPassword } from "@/lib/auth/password";

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const { firstName, lastName, username, password } = body;

    if (!firstName || !lastName || !username || !password) {
        return NextResponse.json(
            { error: "firstName, lastName, username, and password are all required" },
            { status: 400 }
        );
    }

    if (password.length < 6) {
        return NextResponse.json(
            { error: "Password must be at least 6 characters" },
            { status: 400 }
        );
    }

    await connectDB();

    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.toLowerCase().trim(),
        passwordHash,
    });

    return NextResponse.json({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
    }, { status: 201 });
}