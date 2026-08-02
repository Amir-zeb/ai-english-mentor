import { CASUAL_MENTOR_OPENER_PROMPT, CASUAL_MENTOR_SUGGESTION_PROMPT, CASUAL_MENTOR_SYSTEM_PROMPT } from "./prompts/casualMentor";
import { FRIEND_OPENER_PROMPT, FRIEND_SUGGESTION_PROMPT, FRIEND_SYSTEM_PROMPT } from "./prompts/friend";
import { PROFESSIONAL_MENTOR_OPENER_PROMPT, PROFESSIONAL_MENTOR_SUGGESTION_PROMPT, PROFESSIONAL_MENTOR_SYSTEM_PROMPT } from "./prompts/professionalMentor";

export type MentorT = {
    id: number;
    name: string;
    title: string;
    description: string;
    personaName: string;
    systemPrompt: string;
    givesFeedback: boolean;
    voiceURI: string;
    openerPrompt: string;
    suggestionPrompt: string;
};

export const MENTORS: MentorT[] = [
    {
        id: 1,
        name: "English_Conversation_Mentor",
        title: "Casual Conversation Mentor",
        description: "Practice everyday spoken English through relaxed, natural conversation",
        personaName: "Mark",
        systemPrompt: CASUAL_MENTOR_SYSTEM_PROMPT,
        givesFeedback: false,
        voiceURI: "Microsoft Mark - English (United States)",
        openerPrompt: CASUAL_MENTOR_OPENER_PROMPT,
        suggestionPrompt: CASUAL_MENTOR_SUGGESTION_PROMPT,
    },
    {
        id: 2,
        name: "Professional_English_Mentor",
        title: "Professional English Mentor",
        description: "Practice concise, professional English with direct feedback on every message",
        personaName: "David",
        systemPrompt: PROFESSIONAL_MENTOR_SYSTEM_PROMPT,
        givesFeedback: true,
        voiceURI: "Microsoft David - English (United States)",
        openerPrompt: PROFESSIONAL_MENTOR_OPENER_PROMPT,
        suggestionPrompt: PROFESSIONAL_MENTOR_SUGGESTION_PROMPT
    },
    {
        id: 3,
        name: "Friend_Mentor",
        title: "Friend",
        description: "Practice conversational English in a relaxed, friendly environment",
        personaName: "Zira",
        systemPrompt: FRIEND_SYSTEM_PROMPT,
        voiceURI: "Microsoft Zira - English (United States)",
        givesFeedback: false,
        openerPrompt: FRIEND_OPENER_PROMPT,
        suggestionPrompt: FRIEND_SUGGESTION_PROMPT
    }
];

export function getMentorByName(name: string): MentorT | undefined {
    return MENTORS.find((m) => m.name === name);
}