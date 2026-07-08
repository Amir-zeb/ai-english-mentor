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