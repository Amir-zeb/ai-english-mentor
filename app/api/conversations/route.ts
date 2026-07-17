import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { ConversationHistory } from "@/lib/models/ConversationHistory";
import { getUserId } from "@/lib/auth/getUserId";

const MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:7b";

/**
 * @swagger
 * /api/conversations:
 *   post:
 *     tags:
 *       - Conversations
 *     summary: Create a new conversation
 *     description: |
 *       Creates a new conversation for the authenticated user.
 *       The conversation is associated with the specified mentor.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - mentorName
 *             properties:
 *               title:
 *                 type: string
 *                 example: Hello, how are you?
 *               mentorName:
 *                 type: string
 *                 example: English_Conversation_Mentor
 *     responses:
 *       200:
 *         description: Conversation created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversationId:
 *                   type: string
 *                   example: 6847d52d2f5d8c7f3d6a9b12
 *                 title:
 *                   type: string
 *                   example: Hello, how are you?
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2023-01-01T00:00:00.000Z
 *       400:
 *         description: title is missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Title is required
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
    const { title, model, mentorName } = body;
    const userId = getUserId(req);

    if (!title ||
        !mentorName ||
        typeof title !== "string" ||
        typeof mentorName !== "string") {
        return NextResponse.json({ error: "title and mentorName is required" }, { status: 400 });
    }

    try {
        await connectDB();

        const conversations = await ConversationHistory.create({
            userId,
            title: title.trim().slice(0, 100), // guard against a huge first message becoming the title
            model: model ?? MODEL,
            mentorName,
        });

        return NextResponse.json({
            conversationId: conversations._id,
            title: conversations.title,
            createdAt: conversations.createdAt,
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     tags:
 *       - Conversations
 *     summary: Get user's conversations
 *     description: Returns the authenticated user's conversations for the specified mentor, sorted by most recently updated.
 *     parameters:
 *       - in: query
 *         name: mentorName
 *         schema:
 *           type: string
 *         required: true
 *         description: Used to filter results based on mentor.
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 6847d52d2f5d8c7f3d6a9b12
 *                       title:
 *                         type: string
 *                         example: Hello, how are you?
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-07-09T12:34:56.789Z
 *       400:
 *         description: mentorName query parameter is required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: mentorName is required
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
export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const mentorName = searchParams.get('mentorName');

    if (!mentorName) {
        return NextResponse.json({ error: "mentorName is required" }, { status: 400 });
    }

    try {
        await connectDB();
        const userId = getUserId(req);

        const conversations = await ConversationHistory.find({ userId, mentorName })
            .sort({ updatedAt: -1 })
            .select("_id title updatedAt")
            .lean();

        return NextResponse.json({ conversations });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}