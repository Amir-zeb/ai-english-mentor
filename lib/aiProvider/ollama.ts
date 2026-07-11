import { ConversationMessageT } from "@/lib/types";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:7b";

export type AICompletionResult = {
    reply: string;
    score: number;
};

export async function getChatCompletion(messages: Omit<ConversationMessageT, "score">[]): Promise<AICompletionResult> {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: MODEL,
            messages,
            stream: false,
            format: "json"
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
    // strip markdown code fences if the model added them despite instructions
    const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");

    try {
        const parsed = JSON.parse(cleaned);
        const reply = typeof parsed.reply === "string" ? parsed.reply : "";
        const score = typeof parsed.score === "number"
            ? Math.min(100, Math.max(0, Math.round(parsed.score)))
            : 0;

        if (!reply) {
            throw new Error("Missing reply field");
        }

        return { reply, score };
    } catch (err) {
        console.error("Failed to parse AI JSON response:", raw, err);
        // fallback: treat the whole raw output as the reply, no score
        return { reply: raw.trim() || "Sorry, I had trouble responding. Could you try again?", score: 0 };
    }
}