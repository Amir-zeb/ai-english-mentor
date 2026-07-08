import { ROLES } from "../constant";
import { ConversationMessageT } from "../types";

export async function sendMessage(messages: ConversationMessageT[]): Promise<ConversationMessageT> {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
    });

    const data = await response.json();
    const assistantReply: ConversationMessageT = {
        role: ROLES.ASSISTANT,
        content: data.reply,
    };
    return assistantReply;
}