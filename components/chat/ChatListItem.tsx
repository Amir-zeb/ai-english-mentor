import { MdOutlineDeleteOutline } from "react-icons/md";
import { toast } from "sonner";
import { ConversationSummaryT, IDParamFunctionT } from "@/lib/types";

function ChatListItem({ conv, activeConversationId, onSelectConversation, onDeleteConversation }: {
    conv: ConversationSummaryT;
    activeConversationId?: string | null;
    onSelectConversation?: IDParamFunctionT;
    onDeleteConversation?: IDParamFunctionT;
}) {
    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        toast('Delete this conversation?', {
            description: conv.title,
            action: {
                label: 'Delete',
                onClick: () => onDeleteConversation?.(conv._id),
            },
            cancel: {
                label: 'Cancel',
                onClick: () => { },
            },
        });
    }

    return (
        <li
            className={`group relative flex items-center rounded-lg text-sm hover:${conv._id === activeConversationId ? "bg-slate-900" : "bg-white/10"} ${conv._id === activeConversationId ? "bg-slate-900" : ""}`}
        >
            <button
                type="button"
                onClick={() => onSelectConversation?.(conv._id)}
                className="flex-1 truncate px-3 py-2 text-left"
            >
                {conv.title}
            </button>
            <button
                type="button"
                onClick={handleDelete}
                className="mr-1 rounded-lg p-1 text-white/50 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
            >
                <MdOutlineDeleteOutline />
            </button>
        </li>
    );
}

export default ChatListItem;