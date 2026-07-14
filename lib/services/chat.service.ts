import { ChatResponseBody, ConversationMessageT } from "../types";

export async function sendMessage(conversationId: string | null, message: string, mentorName: string): Promise<ChatResponseBody> {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, message, mentorName }),
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message. Please try again.");
    }

    return response.json();
}

export async function startConversation(mentorName: string): Promise<{
    conversationId: string;
    assistantMessage: ConversationMessageT;
}> {
    const response = await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorName }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to start conversation");
    }

    return response.json();
}