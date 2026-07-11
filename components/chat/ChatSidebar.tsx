import { MdOutlineDeleteOutline, MdSwapHoriz } from "react-icons/md";
import { ConversationSummaryT, MentorSummaryT } from "@/lib/types";
import { toast } from "sonner";

type IDParamFunctionT = (id: string) => void;
type VoidFunctionT = () => void;

export type ChatSideBarProps = {
    activeMentor: MentorSummaryT | null | undefined;
    history: ConversationSummaryT[];
    activeConversationId: string | null;
    onSelectConversation: IDParamFunctionT;
    openModel: VoidFunctionT;
    onNewConversation: VoidFunctionT;
    onDeleteConversation: IDParamFunctionT;
};

export default function ChatSidebar({
    activeMentor,
    history = [],
    activeConversationId,
    onSelectConversation,
    openModel,
    onNewConversation,
    onDeleteConversation
}: ChatSideBarProps) {
    return (
        <div className="flex w-64 flex-col border-r border-white/10">
            <div className="p-2 border-b border-white/10">
                {/* <h4 className="text-center text-lg font-bold">{activeMentor?.title ?? ""}</h4> */}
                <div className="flex items-center justify-between border-b border-white/10 p-2">
                    <h4 className="text-lg font-bold">{activeMentor?.title}</h4>
                    <button
                        type="button"
                        onClick={openModel}
                        className="rounded-lg p-1 text-white/50 hover:text-white"
                        title="Change mentor"
                    >
                        <MdSwapHoriz />
                    </button>
                </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto overflow-x-hidden">
                <ul className="flex flex-col gap-1">
                    <li
                        onClick={() => onNewConversation?.()}
                        className={`cursor-pointer truncate rounded-lg px-3 py-2 text-sm hover:bg-white/10 ${activeConversationId === null ? "bg-white/10" : ""
                            }`}
                    >
                        New chat
                    </li>
                    {history.map((conv) => (
                        <ListItem
                            key={conv._id}
                            conv={conv}
                            activeConversationId={activeConversationId}
                            onSelectConversation={onSelectConversation}
                            onDeleteConversation={onDeleteConversation}
                        />
                    ))}
                </ul>
            </div>
        </div>
    )
}

function ListItem({ conv, activeConversationId, onSelectConversation, onDeleteConversation }: {
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
            className={`group relative flex items-center rounded-lg text-sm hover:bg-white/10 ${conv._id === activeConversationId ? "bg-white/10" : ""
                }`}
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