import { NextRequest, NextResponse } from "next/server";
import { getChatCompletion } from "@/lib/aiProvider/ollama";
import { ROLES } from "@/lib/constant";
import { ChatRequestBodyT, ConversationMessageT } from "@/lib/types";
import { getMentorByName } from "@/lib/mentors/config";

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
 *               - mentorName
 *             properties:
 *               message:
 *                 type: string
 *                 example: Hello, how are you?
 *               mentorName:
 *                 type: string
 *                 example: English_Conversation_Mentor
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
 *                 feedback:
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
    const { message, mentorName } = body;

    if (!message || !mentorName) {
        return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const mentor = getMentorByName(mentorName);
    if (!mentor) {
        return NextResponse.json({ error: "Invalid mentor" }, { status: 400 });
    }

    // build full message list for the AI call
    const messagesForAI: ConversationMessageT[] = [
        { role: ROLES.SYSTEM, content: mentor.systemPrompt },
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