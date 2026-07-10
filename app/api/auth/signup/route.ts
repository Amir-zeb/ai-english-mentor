import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/models/User";
import { hashPassword } from "@/lib/auth/password";

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: |
 *       Creates a new user account with a unique username.
 *       The password is securely hashed before being stored in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - username
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: MySecurePassword123
 *     responses:
 *       201:
 *         description: User registered successfully.
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
 *         description: Missing required fields or password is too short.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples:
 *                     missingFields:
 *                       value: firstName, lastName, username, and password are all required
 *                     shortPassword:
 *                       value: Password must be at least 6 characters
 *       409:
 *         description: Username already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Username already taken
 */

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