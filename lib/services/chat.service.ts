import { ChatResponseBody } from "../types";

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