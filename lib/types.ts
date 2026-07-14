import { ROLES } from "./constant";

export type ChatRole = typeof ROLES[keyof typeof ROLES];

export type ChatResponseBody = {
    userMessage: ConversationMessageT,
    assistantMessage: ConversationMessageT,
};

export type ConversationSummaryT = {
    _id: string;
    title: string;
    updatedAt: string;
};

export type ConversationMessageT = {
    _id?: string;
    role: ChatRole;
    content: string;
    createdAt?: string;
    score?: number;
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
    mentorName: string;
};

export type AuthUser = {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
};

export type MentorSummaryT = {
    id: number;
    name: string;
    title: string;
    persona: string;
    description: string;
};

export type IDParamFunctionT = (id: string) => void;
export type VoidFunctionT = () => void;