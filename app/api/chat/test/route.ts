import { NextRequest, NextResponse } from "next/server";
import { getChatCompletion } from "@/lib/aiProvider/ollama";
import { MENTOR_SYSTEM_PROMPT } from "@/lib/prompts/mentor";
import { ROLES } from "@/lib/constant";
import { ChatRequestBodyT, ConversationMessageT } from "@/lib/types";

/**
 * @swagger
 * /api/chat/test:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Send a message and get a response
 *     description: |
 *       text api to check ai response json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
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
 *                 reply:
 *                   type: string
 *                   example: hello, how are you doing today?
 *                 score:
 *                   type: number
 *                   example: 0 - 100
 *       400:
 *         description: Missing required field.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Message is required
 */
export async function POST(req: NextRequest) {
    const body: ChatRequestBodyT = await req.json().catch(() => ({} as ChatRequestBodyT));
    const { message } = body;

    if (!message) {
        return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // build full message list for the AI call
    const messagesForAI: ConversationMessageT[] = [
        { role: ROLES.SYSTEM, content: MENTOR_SYSTEM_PROMPT },
        { role: ROLES.USER, content: message },
    ];

    try {
        const res = await getChatCompletion(messagesForAI);
        return NextResponse.json(res);
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
    }
}