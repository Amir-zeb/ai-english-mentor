'use client';
import { useEffect, useRef, useState } from "react";
import { sendMessage } from "@/lib/services/chat.service";
import { getConversationMessages, getConversations } from "@/lib/services/conversationService";
import ChatMessage from "./chatMessage";
import TypingIndicator from "./typingIndicator";
import { ConversationMessageT, ConversationSummaryT } from "@/lib/types";
import { ROLES } from "@/lib/constant";
import ChatSidebar from "./chatSidebar";
import ChatForm from "./chatForm";
import { toast } from "sonner";

export type ChatProps = {
    title?: string;
};

// this component will be generic for any mentor, and will be implemented later.
function Chat({ title }: ChatProps) {

    const [messages, setMessages] = useState<ConversationMessageT[]>([]);
    const [input, setInput] = useState<string>("");
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [conversations, setConversations] = useState<ConversationSummaryT[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

    useEffect(() => {
        getConversationHistory();
    }, []);

    const getConversationHistory = () => {
        getConversations()
            .then(setConversations)
            .catch((err) => toast.error(err instanceof Error ? err.message : "Couldn't refresh conversation list"));
    }

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
            const _m = await sendMessage(activeConversationId, userMessage.content);
            setMessages((prev) => [...prev, _m]);
            if (!activeConversationId) {
                setActiveConversationId(_m.conversationId as string);
                getConversationHistory();
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to send message. Please try again.");
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
            toast.error(error instanceof Error ? error.message : "Failed to load conversation");
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
            <div className="flex flex-1 flex-col min-h-screen overflow-hidden overflow-y-auto p-4 pb-0">
                <section className="flex flex-1 flex-col gap-4 overflow-y-auto">
                    {messages.length ? messages.map((message, i) => (
                        <ChatMessage key={i} message={message} />
                    )) :
                        <div>
                            <p className="text-center">No messages yet. Start the conversation!</p>
                        </div>
                    }
                    {isTyping && <TypingIndicator />}
                    <div ref={bottomRef} className='visibility:hidden' />
                </section>
                <ChatForm input={input} handleInputChange={handleInputChange} handleSend={handleSend} />
            </div>
        </div>
    );
}

export default Chat;

