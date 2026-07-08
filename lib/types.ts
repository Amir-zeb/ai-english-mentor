import { ROLES } from "./constant";

export type ChatRole = typeof ROLES[keyof typeof ROLES];

export type ChatMessage = {
    role: ChatRole;
    content: string;
};

export type ChatRequestBody = {
    messages: ChatMessage[];
};

export type ChatResponseBody = {
    reply: string;
};