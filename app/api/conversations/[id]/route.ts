import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { ConversationHistory } from "@/lib/models/ConversationHistory";
import { Messages } from "@/lib/models/Messages";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    await connectDB();

    const conversation = await ConversationHistory.findById(id).lean();
    if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const messages = await Messages.find({ conversationId: id })
        .sort({ createdAt: 1 })
        .select("role content createdAt")
        .lean();

    return NextResponse.json({ conversation, messages });
}