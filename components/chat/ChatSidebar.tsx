import { ConversationSummaryT, IDParamFunctionT, MentorSummaryT, VoidFunctionT } from "@/lib/types";
import ChatListItem from "./ChatListItem";
import ChatSideBarHeader from "./ChatSideBarHeader";
import ChatSideBarFooter from "./ChatSideBarFooter";

type ChatSideBarProps = {
    activeMentor: MentorSummaryT | null | undefined;
    history: ConversationSummaryT[];
    activeConversationId: string | null;
    autoSpeak: boolean,
    onSelectConversation: IDParamFunctionT;
    openModel: VoidFunctionT;
    onNewConversation: VoidFunctionT;
    setAutoSpeak: (value: boolean) => void,
    onDeleteConversation: IDParamFunctionT;
};

export default function ChatSidebar({
    activeMentor,
    history = [],
    activeConversationId,
    autoSpeak,
    onSelectConversation,
    openModel,
    onNewConversation,
    onDeleteConversation,
    setAutoSpeak
}: ChatSideBarProps) {
    return (
        <div className="flex w-64 flex-col border-r border-white/10">
            <ChatSideBarHeader title={activeMentor?.title ?? null} openModel={openModel} />
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
                        <ChatListItem
                            key={conv._id}
                            conv={conv}
                            activeConversationId={activeConversationId}
                            onSelectConversation={onSelectConversation}
                            onDeleteConversation={onDeleteConversation}
                        />
                    ))}
                </ul>
            </div>
            <ChatSideBarFooter
                setAutoSpeak={setAutoSpeak}
                autoSpeak={autoSpeak}
            />
        </div>
    )
}



