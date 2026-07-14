import { ROLES } from "@/lib/constant";
import { ConversationMessageT } from "@/lib/types";
import { useState } from "react";
import { MdLightbulbOutline, MdStop, MdVolumeUp } from "react-icons/md";

type ChatMessageProps = {
    message: ConversationMessageT;
    isSpeaking: boolean | null;
    loadingSuggestion: boolean;
    currentSpeakingId: string | null;
    onSpeak: (text: string, id: string) => void;
    stop: () => void;
    handleHelp: (id: string) => void;
}

function getScoreColor(score: number): string {
    if (score >= 75) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
}

function formatTime(dateString?: string): string {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function ChatMessage({
    message,
    isSpeaking,
    loadingSuggestion,
    currentSpeakingId,
    stop,
    onSpeak,
    handleHelp
}: ChatMessageProps) {
    const isUser = message.role === ROLES.USER;
    const hasScore = isUser && typeof message.score === "number";
    const isThisMessageSpeaking = isSpeaking && currentSpeakingId === message._id;

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[80%] flex-col sm:max-w-[70%] ${isUser ? "items-end" : "items-start"}`}>
                <div
                    className={`relative text-sm ${isUser
                        ? "rounded-2xl bg-slate-800/90 px-4 py-3 pr-6 text-white shadow-md"
                        : ""
                        }`}
                >
                    <p>{message.content}</p>
                    {message?.suggestion && (
                        <p className="mt-1 max-w-[80%] rounded-lg bg-white/5 px-3 py-2 text-xs italic text-white/60">
                            💡 Try: "{message?.suggestion}"
                        </p>
                    )}
                    {hasScore && (
                        <span
                            title={`Fluency score: ${message.score}/100`}
                            className={`absolute right-2 top-2 h-2 w-2 rounded-full ${getScoreColor(message.score!)}`}
                        />
                    )}
                </div>
                <div className="mt-1 flex items-center gap-2 px-1">
                    {message.createdAt && (
                        <span className="text-[11px] text-white/40">
                            {formatTime(message.createdAt)}
                        </span>
                    )}
                    {!isUser && onSpeak && (
                        <button
                            type="button"
                            onClick={() =>
                                isThisMessageSpeaking ? stop?.() : onSpeak(message.content, message._id as string)
                            }
                            className={`hover:text-white ${isThisMessageSpeaking ? "text-blue-400" : "text-white/40"}`}
                            title={isThisMessageSpeaking ? "Stop" : "Play message"}
                        >
                            {isThisMessageSpeaking ? <MdStop size={14} /> : <MdVolumeUp size={14} />}
                        </button>
                    )}
                    {!isUser && (
                        <button
                            onClick={() => handleHelp(message._id as string)}
                            disabled={loadingSuggestion}
                            className={`hover:text-white ${message.suggestion ? "text-blue-400" : "text-white/40"}`}
                            title="Not sure how to reply?"
                        >
                            <MdLightbulbOutline size={14} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}