import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { ConversationHistory } from "@/lib/models/ConversationHistory";

const MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:7b";

/**
 * @swagger
 * /api/conversations:
 *   post:
 *     tags:
 *       - ConversationHistory
 *     summary: Create a new conversation
 *     description: |
 *       Creates a new conversation with an initial title and AI model.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Hello, how are you?
 *     responses:
 *       200:
 *         description: Message sent and response received.
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
 *         description: Missing required field.
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
    const { title, model } = body;

    if (!title || typeof title !== "string") {
        return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    await connectDB();

    const conversations = await ConversationHistory.create({
        title: title.trim().slice(0, 100), // guard against a huge first message becoming the title
        model: model ?? MODEL,
    });

    return NextResponse.json({
        conversationId: conversations._id,
        title: conversations.title,
        createdAt: conversations.createdAt,
    });
}

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     tags:
 *       - ConversationHistory
 *     summary: Get all conversations
 *     description: Returns a list of all conversations sorted by the most recently updated.
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

export async function GET() {
    await connectDB();

    const conversations = await ConversationHistory.find({})
        .sort({ updatedAt: -1 })
        .select("_id title updatedAt")
        .lean();

    return NextResponse.json({ conversations });
}