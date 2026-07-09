import { ROLES } from "@/lib/constant";
import { ConversationMessageT } from "@/lib/types";

export default function ChatMessage({ message }: { message: ConversationMessageT }) {
    return (
        <div
            className={`flex ${message.role === ROLES.USER ? "justify-end" : "justify-start"}`}
        >
            <div
                className={`max-w-[80%] text-sm sm:max-w-[70%] ${message.role === ROLES.USER
                    ? "bg-slate-800/90 text-white rounded-2xl px-4 py-3 shadow-md"
                    : ""
                    }`}
            >
                <p>{message.content}</p>
            </div>
        </div>
    );
}