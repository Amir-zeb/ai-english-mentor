export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatResponseBody = {
    userMessage: ChatMessageT,
    assistantMessage: ChatMessageT,
};

export type ConversationSummaryT = {
    _id: string;
    title: string;
    updatedAt: string;
};

export type ChatMessageT = {
    _id?: string;
    role: ChatRole;
    content: string;
    createdAt?: string;
    suggestion?: string;
    feedback?: string;
    score?: number;
    conversationId?: string;
};

export type ConversationDetailT = {
    conversation: {
        _id: string;
        title: string;
    };
    messages: ChatMessageT[];
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
    personaName: string;
    description: string;
};

export type IDParamFunctionT = (id: string) => void;

export type VoidFunctionT = () => void;

export type ScoreBandCounts = { red: number; yellow: number; green: number };

export type PeriodBucket = {
    label: string;
    scoreBands: ScoreBandCounts;
    avgScore: number | null;
    totalMessages: number;
    suggestionsUsed: number;
};

export type MentorStats = {
    mentorName: string;
    mentorTitle: string;
    weekly: PeriodBucket[];
    monthly: PeriodBucket[];
};

export type DashboardStats = {
    mentors: MentorStats[];
};