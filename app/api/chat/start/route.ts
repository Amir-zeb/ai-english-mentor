import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Messages } from "@/lib/models/Messages";
import { ConversationHistory } from "@/lib/models/ConversationHistory";
import { getChatCompletion } from "@/lib/aiProvider/ollama";
import { MENTOR_SYSTEM_PROMPT } from "@/lib/prompts/mentor";
import { ROLES } from "@/lib/constant";
import { ConversationMessageT } from "@/lib/types";
import { getUserId } from "@/lib/auth/getUserId";

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