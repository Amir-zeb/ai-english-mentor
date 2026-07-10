import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout the current user
 *     description: Clears the authentication cookie and logs the user out.
 *     responses:
 *       200:
 *         description: Logout successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 */
export async function POST() {
    const response = NextResponse.json({ success: true });
    response.cookies.set("token", "", {
        httpOnly: true,
        path: "/",
        maxAge: 0, // expire immediately
    });
    return response;
}