import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Messages } from "@/lib/models/Messages";
import { ConversationHistory } from "@/lib/models/ConversationHistory";
import { getChatCompletion } from "@/lib/aiProvider/ollama";
import { MENTOR_SYSTEM_PROMPT } from "@/lib/prompts/mentor";
import { ROLES } from "@/lib/constant";
import { ConversationMessageT } from "@/lib/types";
import { getUserId } from "@/lib/auth/getUserId";

/**
 * @swagger
 * /api/chat/start:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Start a new conversation
 *     description: |
 *       Starts a new conversation with the selected AI mentor.
 *
 *       The AI generates an initial greeting and a friendly opening question
 *       based on a random everyday casual topic. A new conversation and the
 *       generated assistant message are then saved to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mentorName
 *             properties:
 *               mentorName:
 *                 type: string
 *                 description: Name of the AI mentor used for the conversation.
 *                 example: English_Conversation_Mentor
 *     responses:
 *       200:
 *         description: Conversation started successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversationId:
 *                   type: string
 *                   description: ID of the newly created conversation.
 *                   example: 6847d52d2f5d8c7f3d6a9b12
 *                 assistantMessage:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID of the generated assistant message.
 *                       example: 6847d52d2f5d8c7f3d6a9b13
 *                     role:
 *                       type: string
 *                       example: assistant
 *                     content:
 *                       type: string
 *                       example: "Hi! I'm your English conversation mentor. What do you usually like to do in your free time?"
 *                     conversationId:
 *                       type: string
 *                       example: 6847d52d2f5d8c7f3d6a9b12
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-07-14T10:30:00.000Z
 *       400:
 *         description: Missing mentorName.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: mentorName is required
 *       500:
 *         description: Failed to start the conversation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to start conversation
 */
export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const { mentorName } = body;
    const userId = getUserId(req);

    if (!mentorName) {
        return NextResponse.json({ error: "mentorName is required" }, { status: 400 });
    }

    await connectDB();

    try {
        const MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:7b";

        const messagesForAI: ConversationMessageT[] = [
            { role: ROLES.SYSTEM, content: MENTOR_SYSTEM_PROMPT },
            {
                role: ROLES.USER,
                content: "[Start a new conversation. Introduce yourself briefly by name, pick a random everyday casual topic, and greet me with a friendly opening question.]",
            },
        ];

        const { reply } = await getChatCompletion(messagesForAI);

        const conversation = await ConversationHistory.create({
            title: reply.trim().slice(0, 100),
            model: MODEL,
            mentorName,
            userId,
        });
        const conversationId = conversation._id.toString();

        const assistantMessageDoc = await Messages.create({
            conversationId,
            role: ROLES.ASSISTANT,
            content: reply,
        });

        return NextResponse.json({
            conversationId,
            assistantMessage: {
                _id: assistantMessageDoc._id.toString(),
                role: assistantMessageDoc.role,
                content: assistantMessageDoc.content,
                conversationId,
                createdAt: assistantMessageDoc.createdAt.toISOString(),
            },
        });
    } catch (error) {
        console.error("Start conversation error:", error);
        return NextResponse.json({ error: "Failed to start conversation" }, { status: 500 });
    }
}