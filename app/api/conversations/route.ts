import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { ConversationHistory } from "@/lib/models/ConversationHistory";

const MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:7b";

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

export async function GET() {
    await connectDB();

    const conversations = await ConversationHistory.find({})
        .sort({ updatedAt: -1 })
        .select("_id title updatedAt")
        .lean();

    return NextResponse.json({ conversations });
}