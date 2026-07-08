import { ROLES } from "./constant";

export type ChatRole = typeof ROLES[keyof typeof ROLES];

export type ChatResponseBody = {
    reply: string;
};

export type ConversationSummaryT = {
    _id: string;
    title: string;
    updatedAt: string;
};

export type ChatSideBarProps = {
    title?: string;
    history?: ConversationSummaryT[];
    activeConversationId?: string | null;
    onSelectConversation?: (id: string) => void;
    onNewConversation?: () => void;
};

export type ConversationMessageT = {
    role: ChatRole;
    content: string;
    createdAt?: string;
};

export type ConversationDetailT = {
    conversation: {
        _id: string;
        title: string;
    };
    messages: ConversationMessageT[];
};

export type ChatRequestBody = {
    messages: ConversationMessageT[];
};
