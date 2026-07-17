import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/models/User";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Authenticate a user
 *     description: |
 *       Authenticates a user using their username and password.
 *       On successful authentication, a secure HTTP-only JWT cookie named `token`
 *       is returned and used for subsequent authenticated requests.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MySecurePassword123
 *     responses:
 *       200:
 *         description: Login successful.
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only JWT authentication cookie.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 6847d52d2f5d8c7f3d6a9b12
 *                 firstName:
 *                   type: string
 *                   example: John
 *                 lastName:
 *                   type: string
 *                   example: Doe
 *                 username:
 *                   type: string
 *                   example: johndoe
 *       400:
 *         description: Username or password was not provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: username and password are required
 *       401:
 *         description: Invalid username or password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid username or password
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const { username, password } = body;

    if (!username || !password) {
        return NextResponse.json(
            { error: "username and password are required" },
            { status: 400 }
        );
    }

    try {
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

        return response

    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}