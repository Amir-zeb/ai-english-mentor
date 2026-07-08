import { NextRequest, NextResponse } from "next/server";
import { getChatCompletion } from "@/lib/aiProvider/ollama";
import { MENTOR_SYSTEM_PROMPT } from "@/lib/prompts/mentor";
import { ChatRequestBody, ChatResponseBody } from "@/lib/types";
import { ROLES } from "@/lib/constant";

export async function POST(req: NextRequest) {
    const body: ChatRequestBody = await req.json().catch(() => ({ messages: [] }));

    if (!body.messages || body.messages.length === 0) {
        return NextResponse.json({ error: "messages is required" }, { status: 400 });
    }

    const messagesWithSystem = [
        {
            role: ROLES.SYSTEM,
            content: MENTOR_SYSTEM_PROMPT
        },
        ...body.messages,
    ];

    try {
        const reply = await getChatCompletion(messagesWithSystem);
        const responseBody: ChatResponseBody = { reply };
        return NextResponse.json(responseBody);
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
    }
}