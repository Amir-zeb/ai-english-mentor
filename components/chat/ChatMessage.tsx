import { ROLES } from "@/lib/constant";
import { ConversationMessageT } from "@/lib/types";

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

export default function ChatMessage({ message }: { message: ConversationMessageT }) {
    const isUser = message.role === ROLES.USER;
    const hasScore = isUser && typeof message.score === "number";

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[80%] flex-col sm:max-w-[70%] ${isUser ? "items-end" : "items-start"}`}>
                <div
                    className={`relative text-sm ${
                        isUser
                            ? "rounded-2xl bg-slate-800/90 px-4 py-3 pr-6 text-white shadow-md"
                            : ""
                    }`}
                >
                    <p>{message.content}</p>
                    {hasScore && (
                        <span
                            title={`Fluency score: ${message.score}/100`}
                            className={`absolute right-2 top-2 h-2 w-2 rounded-full ${getScoreColor(message.score!)}`}
                        />
                    )}
                </div>
                {message.createdAt && (
                    <span className="mt-1 px-1 text-[11px] text-white/40">
                        {formatTime(message.createdAt)}
                    </span>
                )}
            </div>
        </div>
    );
}