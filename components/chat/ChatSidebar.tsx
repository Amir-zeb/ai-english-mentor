import { ChatSideBarProps } from "@/lib/types";

export default function ChatSidebar ({
    title = 'Mentor',
    history = [],
    activeConversationId,
    onSelectConversation,
    onNewConversation,
}: ChatSideBarProps) {
    return (
        <div className="flex w-64 flex-col border-r border-white/10">
            <div className="p-2 border-b border-white/10">
                <h4 className="text-center text-lg font-bold">{title}</h4>
            </div>
            <div className="flex-1 p-4 overflow-y-auto overflow-x-hidden">
                <ul className="flex flex-col gap-1">
                    <li
                        onClick={() => onNewConversation?.()}
                        className={`cursor-pointer truncate rounded-lg px-3 py-2 text-sm hover:bg-white/10 ${activeConversationId === null ? "bg-white/10" : ""
                            }`}
                    >
                        + Start a new conversation
                    </li>
                    {history.map((conv) => (
                        <li
                            key={conv._id}
                            onClick={() => onSelectConversation?.(conv._id)}
                            className={`cursor-pointer truncate rounded-lg px-3 py-2 text-sm hover:bg-white/10 ${conv._id === activeConversationId ? "bg-white/10" : ""
                                }`}
                        >
                            {conv.title}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}