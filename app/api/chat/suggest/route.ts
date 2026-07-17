import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Messages } from "@/lib/models/Messages";
import { getChatCompletion } from "@/lib/aiProvider/ollama";
import { ROLES } from "@/lib/constant";
import { ChatMessageT } from "@/lib/types";
import { getUserId } from "@/lib/auth/getUserId";
import { User } from "@/lib/models/User";
import { ConversationHistory } from "@/lib/models/ConversationHistory";
import { getMentorByName } from "@/lib/mentors/config";

/**
 * @swagger
 * /api/chat/suggest:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Generate a suggested reply
 *     description: |
 *       Generates a short and natural reply suggestion when the user
 *       is stuck and does not know how to respond.
 *
 *       The endpoint uses recent conversation history to generate
 *       a suggestion for the specified assistant message.
 *
 *       If a suggestion has already been generated for the message,
 *       the cached suggestion is returned.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messageId
 *             properties:
 *               messageId:
 *                 type: string
 *                 description: ID of the assistant message to generate a reply suggestion for.
 *                 example: 6847d52d2f5d8c7f3d6a9b12
 *     responses:
 *       200:
 *         description: Suggestion generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assistantMessage:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6847d52d2f5d8c7f3d6a9b12
 *                     role:
 *                       type: string
 *                       example: assistant
 *                     content:
 *                       type: string
 *                       example: "I'm doing well, thanks! How about you?"
 *                     suggestion:
 *                       type: string
 *                       example: "I'm doing well too! What have you been up to today?"
 *                     conversationId:
 *                       type: string
 *                       example: 6847d52d2f5d8c7f3d6a9b13
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-07-14T10:30:00.000Z
 *       400:
 *         description: messageId is missing or the mentor is invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: messageId is required
 *       404:
 *         description: Message, conversation, or user not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: messageId is missing or the mentor is invalid.
 *       500:
 *         description: Failed to generate suggestion.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to generate suggestion
 */
export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const { messageId } = body;
    const userId = getUserId(req);

    if (!messageId) {
        return NextResponse.json({ error: "messageId is required" }, { status: 400 });
    }

    try {
        await connectDB();

        const message = await Messages.findById(messageId);
        if (!message || message.role !== ROLES.ASSISTANT) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        // return cached suggestion if already generated
        if (message.suggestion) {
            return NextResponse.json({
                assistantMessage: {
                    _id: message._id.toString(),
                    role: message.role,
                    content: message.content,
                    suggestion: message.suggestion,
                    conversationId: message.conversationId.toString(),
                    createdAt: message.createdAt.toISOString(),
                },
            });
        }

        const recentHistory = await Messages.find({ conversationId: message.conversationId })
            .sort({ createdAt: 1 })
            .select("role content")
            .limit(10)
            .lean();

        const conversation = await ConversationHistory.findOne({ _id: message.conversationId, userId });
        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        const mentor = getMentorByName(conversation.mentorName);
        if (!mentor) {
            return NextResponse.json({ error: "Invalid mentor" }, { status: 400 });
        }

        const user = await User.findById(userId).select("firstName").lean()
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const messagesForAI: ChatMessageT[] = [
            {
                role: ROLES.SYSTEM,
                content: `${mentor.systemPrompt}\n\nThe person you're talking to is named ${user.firstName}. Address them by name naturally sometimes (not every message) — like a friend would.`
            },
            ...recentHistory.map((m) => ({ role: m.role, content: m.content } as ChatMessageT)),
            {
                role: ROLES.USER,
                content: "[The person you're chatting with is stuck and doesn't know how to reply. Suggest ONE short, natural, casual example reply they could send, written from their point of view. Keep it simple, 1 sentence.]",
            },
        ];


        const { reply } = await getChatCompletion(messagesForAI);

        message.suggestion = reply;
        await message.save();

        return NextResponse.json({
            assistantMessage: {
                _id: message._id.toString(),
                role: message.role,
                content: message.content,
                suggestion: message.suggestion,
                conversationId: message.conversationId.toString(),
                createdAt: message.createdAt.toISOString(),
            },
        });

    } catch (error) {
        return NextResponse.json({ error: "Failed to generate suggestion" }, { status: 500 });
    }
}