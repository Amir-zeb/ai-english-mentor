'use client';
import { ROLES } from "@/lib/constant";
import { sendMessage } from "@/lib/services/chat.service";
import { ChatSideBarProps, ConversationMessageT, ConversationSummaryT } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { getConversationMessages, getConversations } from "@/lib/services/conversationService";

export type ChatProps = {
    title?: string;
};

// this component will be generic for any mentor, and will be passed the title of the mentor and the conversation history as props later.
function Chat({ title }: ChatProps) {

    const [messages, setMessages] = useState<ConversationMessageT[]>([]);
    const [input, setInput] = useState<string>("");
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [conversations, setConversations] = useState<ConversationSummaryT[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

    useEffect(() => {
        getConversations()
            .then(setConversations)
            .catch((err) => console.error("Failed to load conversations:", err));
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleNewConversation = () => {
        setActiveConversationId(null);
        setMessages([]);
        setInput("");
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
    }

    const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!input.trim()) return;

        const userMessage: ConversationMessageT = {
            role: ROLES.USER,
            content: input.trim(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);
        setInput("");

        try {
            const assistantReply = await sendMessage([...messages, userMessage]);
            setMessages((prev) => [...prev, assistantReply]);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSelectConversation = async (id: string) => {
        if (id === activeConversationId) return; // no-op if already active

        setActiveConversationId(id);
        setIsTyping(true); // reuse this as a lightweight loading indicator

        try {
            const data = await getConversationMessages(id);
            const loadedMessages: ConversationMessageT[] = data.messages.map((m, index) => ({
                role: m.role,
                content: m.content,
                createdAt: m.createdAt,
            }));
            setMessages(loadedMessages);
        } catch (error) {
            console.error("Failed to load conversation:", error);
            setMessages([]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex w-full h-screen flex-row overflow-hidden">
            <ChatSidebar
                title={title}
                history={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
            />
            <div className="flex flex-1 flex-col min-h-screen overflow-hidden overflow-y-auto p-4">
                <section className="flex flex-1 flex-col gap-4 overflow-y-auto">
                    {messages.length ? messages.map((message, i) => (
                        <Message key={i} message={message} />
                    )) :
                        <div>
                            <p className="text-center">No messages yet. Start the conversation!</p>
                        </div>
                    }
                    {isTyping && <TypingIndicator />}
                    <div ref={bottomRef} className='visibility:hidden' />
                </section>
                <form onSubmit={handleSend} className="border-t border-white/10 py-4">
                    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 p-3 sm:flex-row sm:items-center">
                        <input
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-3 text-sm text-white outline-none ring-0"
                        />
                        <button
                            type="submit"
                            className="rounded-xl bg-linear-to-r from-slate-800/30 to-slate-900 px-4 py-3 text-sm font-semibold text-white opacity-30 transition hover:opacity-100"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Chat;

const ChatSidebar = ({
    title = 'Mentor',
    history = [],
    activeConversationId,
    onSelectConversation,
    onNewConversation,
}: ChatSideBarProps) => {
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

function TypingIndicator() {
    return (
        <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-white" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-white [animation-delay:0.15s]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-white [animation-delay:0.3s]" />
        </div>
    );
}

function Message({ message }: { message: ConversationMessageT }) {
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