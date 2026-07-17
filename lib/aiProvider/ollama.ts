import { ChatMessageT } from "@/lib/types";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:7b";

export type AICompletionResult = {
    reply: string;
    feedback?: string;
    score: number;
};

const RESPONSE_SCHEMA = {
    type: "object",
    properties: {
        reply: { type: "string" },
        score: { type: "integer" },
        feedback: { type: "string" },
    },
    required: ["reply", "score"], // feedback stays optional — casual mentor won't use it
};

export async function getChatCompletion(messages: Omit<ChatMessageT, "score">[]): Promise<AICompletionResult> {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: MODEL,
            messages,
            stream: false,
            format: RESPONSE_SCHEMA, // schema-constrained, not just "json"
            options: {
                temperature: 0.4, // a bit of warmth for casual chat, but still stable for JSON adherence
            },
        }),
    });

    if (!response.ok) {
        throw new Error(`Ollama request failed: ${response.status}`);
    }

    const data = await response.json();
    const rawContent: string = data.message?.content ?? "";

    return parseAIResponse(rawContent);

}

function parseAIResponse(raw: string): AICompletionResult {
    try {
        const parsed = JSON.parse(raw.trim());
        const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
        const score = typeof parsed.score === "number"
            ? Math.min(100, Math.max(0, Math.round(parsed.score)))
            : null;
        const feedback = typeof parsed.feedback === "string" && parsed.feedback.trim()
            ? parsed.feedback.trim()
            : undefined;

        if (!reply) {
            throw new Error("Missing reply field");
        }

        return { reply, score: score ?? 70, feedback };
    } catch (err) {
        console.error("Failed to parse AI JSON response:", raw, err);
        return { reply: "Sorry, could you say that again?", score: 70 };
    }
}