import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Messages } from "@/lib/models/Messages";
import { ConversationHistory } from "@/lib/models/ConversationHistory";
import { getChatCompletion } from "@/lib/aiProvider/ollama";
import { MENTOR_SYSTEM_PROMPT } from "@/lib/prompts/mentor";
import { ROLES } from "@/lib/constant";
import { ChatRequestBodyT, ChatResponseBody, ConversationMessageT } from "@/lib/types";
import { getUserId } from "@/lib/auth/getUserId";

/**
 * @swagger
 * /api/chat:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Send a message and get a response
 *     description: |
 *       Sends a message and retrieves a response from the AI.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - conversationId
 *             properties:
 *               message:
 *                 type: string
 *                 example: Hello, how are you?
 *               conversationId:
 *                 type: string
 *                 example: 6847d52d2f5d8c7f3d6a9b12
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
 *                 role:
 *                   type: string
 *                   example: user | assistant | system
 *                 content:
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
 *                   example: Message is required
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
    const body: ChatRequestBodyT = await req.json().catch(() => ({} as ChatRequestBodyT));
    const { message } = body;
    let { conversationId } = body;
    const userId = getUserId(req);
    let history: ConversationMessageT[] = [];

    if (!message) {
        return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    await connectDB();

    let conversation = conversationId
        ? await ConversationHistory.findById(conversationId)
        : null;

    if (!conversation) {
        const MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:7b";
        conversation = await ConversationHistory.create({
            title: message.trim().slice(0, 100),
            model: MODEL,
            userId
        });
        conversationId = conversation._id.toString();
    } else {
        // fetch existing history for this conversation
        history = await Messages.find({ conversationId, userId })
            .sort({ createdAt: 1 })
            .select("role content")
            .lean();
    }

    // save the user's new message
    await Messages.create({
        conversationId,
        role: ROLES.USER,
        content: message,
    });

    // build full message list for the AI call
    const messagesForAI: ConversationMessageT[] = [
        { role: ROLES.SYSTEM, content: MENTOR_SYSTEM_PROMPT },
        ...history.map((m) => ({ role: m.role, content: m.content } as ConversationMessageT)),
        { role: ROLES.USER, content: message },
    ];

    try {
        const reply = await getChatCompletion(messagesForAI);

        const newMessage = await Messages.create({
            conversationId,
            role: ROLES.ASSISTANT,
            content: reply,
        });

        conversation.updatedAt = new Date();
        await conversation.save();
        const responseBody: ChatResponseBody = {
            role: newMessage.role,
            content: newMessage.content,
            conversationId: conversationId as string,
            createdAt: newMessage.createdAt.toISOString(),
        };
        return NextResponse.json(responseBody);
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
    }
}