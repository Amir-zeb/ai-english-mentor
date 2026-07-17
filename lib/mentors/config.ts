import { CASUAL_MENTOR_OPENER_PROMPT, CASUAL_MENTOR_SUGGESTION_PROMPT, CASUAL_MENTOR_SYSTEM_PROMPT } from "./prompts/casualMentor";
import { PROFESSIONAL_MENTOR_OPENER_PROMPT, PROFESSIONAL_MENTOR_SUGGESTION_PROMPT, PROFESSIONAL_MENTOR_SYSTEM_PROMPT } from "./prompts/professionalMentor";

export type MentorT = {
    id: number;
    name: string;
    title: string;
    description: string;
    personaName: string;
    systemPrompt: string;
    givesFeedback: boolean;
    openerPrompt: string;
    suggestionPrompt: string;
};

export const MENTORS: MentorT[] = [
    {
        id: 1,
        name: "English_Conversation_Mentor",
        title: "Casual Conversation Mentor",
        description: "Practice everyday spoken English through relaxed, natural conversation",
        personaName: "Danish",
        systemPrompt: CASUAL_MENTOR_SYSTEM_PROMPT,
        givesFeedback: false,
        openerPrompt: CASUAL_MENTOR_OPENER_PROMPT,
        suggestionPrompt: CASUAL_MENTOR_SUGGESTION_PROMPT,
    },
    {
        id: 2,
        name: "Professional_English_Mentor",
        title: "Professional English Mentor",
        description: "Practice concise, professional English with direct feedback on every message",
        personaName: "Anwar",
        systemPrompt: PROFESSIONAL_MENTOR_SYSTEM_PROMPT,
        givesFeedback: true,
        openerPrompt: PROFESSIONAL_MENTOR_OPENER_PROMPT,
        suggestionPrompt: PROFESSIONAL_MENTOR_SUGGESTION_PROMPT
    },
];

export function getMentorByName(name: string): MentorT | undefined {
    return MENTORS.find((m) => m.name === name);
}