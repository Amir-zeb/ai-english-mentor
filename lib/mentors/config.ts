import { MENTOR_SYSTEM_PROMPT } from "../prompts/mentor";

export type MentorT = {
    id: number;
    name: string;
    title: string;
    description: string;
    systemPrompt: string;
};

export const MENTORS: MentorT[] = [
    {
        id: 1,
        name: "English_Conversation_Mentor",
        title: "English Conversation Mentor",
        description: "Practice everyday spoken English through natural conversation",
        systemPrompt: MENTOR_SYSTEM_PROMPT
    },
];

export function getMentorById(id: number): MentorT | undefined {
    return MENTORS.find((m) => m.id === id);
}