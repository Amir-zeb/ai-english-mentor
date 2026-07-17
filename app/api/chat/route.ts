import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Messages } from "@/lib/models/Messages";
import { ConversationHistory } from "@/lib/models/ConversationHistory";
import { getChatCompletion } from "@/lib/aiProvider/ollama";
import { ROLES } from "@/lib/constant";
import { ChatRequestBodyT, ChatResponseBody, ChatMessageT } from "@/lib/types";
import { getUserId } from "@/lib/auth/getUserId";
import { getMentorByName } from '@/lib/mentors/config';
import { User } from "@/lib/models/User";

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
 *               - mentorName
 *             properties:
 *               message:
 *                 type: string
 *                 example: Hello, how are you?
 *               conversationId:
 *                 type: string
 *                 example: 6847d52d2f5d8c7f3d6a9b12
 *               mentorName:
 *                 type: string
 *                 example: English_Conversation_Mentor
 *     responses:
 *       200:
 *         description: Message processed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userMessage:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6847d52d2f5d8c7f3d6a9b13
 *                     role:
 *                       type: string
 *                       example: user
 *                     content:
 *                       type: string
 *                       example: Hello, how are you?
 *                     score:
 *                       type: number
 *                       example: 92
 *                     feedback:
 *                       type: string
 *                       example: Great job! Try using a contraction.
 *                     conversationId:
 *                       type: string
 *                       example: 6847d52d2f5d8c7f3d6a9b12
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-07-17T12:34:56.789Z
 *                 assistantMessage:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6847d52d2f5d8c7f3d6a9b14
 *                     role:
 *                       type: string
 *                       example: assistant
 *                     content:
 *                       type: string
 *                       example: I'm doing well, thanks! How about you?
 *                     conversationId:
 *                       type: string
 *                       example: 6847d52d2f5d8c7f3d6a9b12
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-07-17T12:34:57.123Z
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
    const { message, mentorName } = body;
    let { conversationId } = body;
    const userId = getUserId(req);
    let history: ChatMessageT[] = [];

    const mentor = getMentorByName(mentorName);
    if (!mentor) {
        return NextResponse.json({ error: "Invalid mentor" }, { status: 400 });
    }

    if (!message) {
        return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    await connectDB();

    let conversation = conversationId
        ? await ConversationHistory.findOne({
            _id: conversationId,
            userId,
        })
        : null;

    if (!conversation) {
        if (!mentorName) {
            return NextResponse.json({ error: "mentorName is required" }, { status: 400 });
        }
        const MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:7b";
        conversation = await ConversationHistory.create({
            title: message.trim().slice(0, 100),
            model: MODEL,
            mentorName,
            userId
        });
        conversationId = conversation._id.toString();
    } else {
        // fetch existing history for this conversation
        history = await Messages.find({ conversationId })
            .sort({ createdAt: 1 })
            .select("role content")
            .limit(10)
            .lean();
    }

    // save the user's new message
    const userMessageDoc = await Messages.create({
        conversationId,
        role: ROLES.USER,
        content: message,
    });

    const user = await User.findById(userId).select('firstName').lean()
    if (!user) {
        return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    // build full message list for the AI call
    const messagesForAI: ChatMessageT[] = [
        {
            role: ROLES.SYSTEM,
            content: `${mentor.systemPrompt}\n\nThe person you're talking to is named ${user.firstName}. Address them by name naturally sometimes (not every message) — like a friend would.`
        },
        ...history.map((m) => ({ role: m.role, content: m.content } as ChatMessageT)),
        { role: ROLES.USER, content: message },
    ];

    try {
        const { reply, score, feedback } = await getChatCompletion(messagesForAI);

        // now that we have the score, attach it to the user's message we already saved
        userMessageDoc.score = score;
        if (feedback) userMessageDoc.feedback = feedback;
        await userMessageDoc.save();

        const assistantMessageDoc = await Messages.create({
            conversationId,
            role: ROLES.ASSISTANT,
            content: reply,
        });
        conversation.updatedAt = new Date();
        await conversation.save();

        const responseBody: ChatResponseBody = {
            userMessage: {
                _id: userMessageDoc._id,
                role: userMessageDoc.role,
                content: userMessageDoc.content,
                score: userMessageDoc.score,
                feedback: userMessageDoc.feedback,
                conversationId: conversationId as string,
                createdAt: userMessageDoc.createdAt.toISOString(),
            },
            assistantMessage: {
                _id: assistantMessageDoc._id,
                role: assistantMessageDoc.role,
                content: assistantMessageDoc.content,
                conversationId: conversationId as string,
                createdAt: assistantMessageDoc.createdAt.toISOString(),
            },
        };
        return NextResponse.json(responseBody);
    } catch (error) {
        return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
    }
}