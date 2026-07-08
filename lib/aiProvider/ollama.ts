import { ChatMessage } from "@/lib/types";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:7b";

export async function getChatCompletion(messages: ChatMessage[]): Promise<string> {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: MODEL,
            messages,
            stream: false,
        }),
    });

    if (!response.ok) {
        throw new Error(`Ollama request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.message?.content ?? "";
}