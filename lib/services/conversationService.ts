import { ConversationDetailT, ConversationSummaryT } from "../types";

export async function getConversations(): Promise<ConversationSummaryT[]> {
    const response = await fetch("/api/conversations");
    if (!response.ok) {
        throw new Error("Failed to fetch conversations");
    }
    const data = await response.json();
    return data.conversations;
}

export async function getConversationMessages(id: string): Promise<ConversationDetailT> {
    const response = await fetch(`/api/conversations/${id}`);
    if (!response.ok) {
        throw new Error("Failed to fetch conversation");
    }
    return response.json();
}

export async function createConversationHistory(title: string): Promise<ConversationDetailT> {
    const response = await fetch(`/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: title.trim().slice(0, 100)
        }),
    });
    if (!response.ok) {
        throw new Error("Failed to create conversation history");
    }
    return response.json();
}