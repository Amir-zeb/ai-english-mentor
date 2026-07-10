import { ROLES } from "./constant";

export type ChatRole = typeof ROLES[keyof typeof ROLES];

export type ChatResponseBody = ConversationMessageT;

export type ConversationSummaryT = {
    _id: string;
    title: string;
    updatedAt: string;
};

export type ConversationMessageT = {
    role: ChatRole;
    content: string;
    createdAt?: string;
    conversationId?: string;
};

export type ConversationDetailT = {
    conversation: {
        _id: string;
        title: string;
    };
    messages: ConversationMessageT[];
};

export type ChatRequestBodyT = {
    conversationId: string;
    message: string;
};

export type AuthUser = {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
};