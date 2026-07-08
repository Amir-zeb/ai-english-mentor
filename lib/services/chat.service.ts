import { ROLES } from "../constant";
import { ChatMessage } from "../types";

export async function sendMessage(messages: ChatMessage[]): Promise<ChatMessage> {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
    });

    const data = await response.json();
    const assistantReply: ChatMessage = {
        role: ROLES.ASSISTANT,
        content: data.reply,
    };
    return assistantReply;
}