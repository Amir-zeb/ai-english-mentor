import { ROLES } from "../constant";
import { ConversationMessageT } from "../types";

export async function sendMessage(conversationId: string | null, message: string): Promise<ConversationMessageT> {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, message }),
    });

    if (!response.ok) {
        throw new Error('Failed to send message');
    }

    const data = await response.json();
    return data;
}