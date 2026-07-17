import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Messages } from "@/lib/models/Messages";
import { ConversationHistory } from "@/lib/models/ConversationHistory";
import { getChatCompletion } from "@/lib/aiProvider/ollama";
import { ROLES } from "@/lib/constant";
import { ChatMessageT } from "@/lib/types";
import { getUserId } from "@/lib/auth/getUserId";
import { getMentorByName } from "@/lib/mentors/config";
import { User } from "@/lib/models/User";

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
        return NextResponse.json({ error: "MentorName is required" }, { status: 400 });
    }

    const mentor = getMentorByName(mentorName);
    if (!mentor) {
        return NextResponse.json({ error: "Invalid mentor" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(userId).select('firstName').lean()
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    try {
        const MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:7b";

        const messagesForAI: ChatMessageT[] = [
            {
                role: ROLES.SYSTEM,
                content: `${mentor.systemPrompt}\n\nThe person you're talking to is named ${user.firstName}. Address them by name naturally sometimes (not every message) — like a friend would.`
            },
            {
                role: ROLES.USER,
                content: mentor.openerPrompt,
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
        return NextResponse.json({ error: "Failed to start conversation" }, { status: 500 });
    }
}