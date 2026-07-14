'use client';
import { useEffect, useRef, useState } from "react";
import { getSuggestion, sendMessage, startConversation } from "@/lib/services/chat.service";
import { deleteConversationMessages, getConversationMessages, getConversations } from "@/lib/services/conversations.service";
import ChatMessage from "./chatMessage";
import TypingIndicator from "./typingIndicator";
import { ConversationMessageT, ConversationSummaryT, MentorSummaryT } from "@/lib/types";
import { ROLES } from "@/lib/constant";
import ChatSidebar from "./chatSidebar";
import ChatForm from "./chatForm";
import { toast } from "sonner";
import Loader from "../loader/loader";
import { MentorSelectModal } from "./mentorSelectModal";
import { useAutoSpeakPreference } from "@/lib/hooks/useAutoSpeakPreference";
import { useSpeechSynthesis } from "@/lib/hooks/useSpeechSynthesis";

export type ChatProps = {
    mentors?: MentorSummaryT[];
};

// this component will be generic for any mentor, and will be implemented later.
function Chat({ mentors }: ChatProps) {

    const [messages, setMessages] = useState<ConversationMessageT[]>([]);
    const [input, setInput] = useState<string>("");
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [isDeletingRecord, setIsDeletingRecord] = useState<boolean>(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [conversations, setConversations] = useState<ConversationSummaryT[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [activeMentorName, setActiveMentorName] = useState<string | null>(null);
    const activeMentor: MentorSummaryT | null | undefined = activeMentorName && mentors ? mentors.find((m) => m.name === activeMentorName) : null;
    const [isMentorModalOpen, setIsMentorModalOpen] = useState(true);
    const [loadingSuggestion, setLoadingSuggestion] = useState(false);
    const { autoSpeak, setAutoSpeak } = useAutoSpeakPreference();
    const { speak, stop, isSpeaking, currentSpeakingId } = useSpeechSynthesis();

    useEffect(() => {
        if (activeMentorName) {
            getConversationHistory();
        }
    }, [activeMentorName]);

    const getConversationHistory = () => {
        getConversations(activeMentorName as string)
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

        if (isSpeaking) {
            stop()
        }

        if (!input.trim()) return;

        const _userMessage: ConversationMessageT = {
            role: ROLES.USER,
            content: input.trim(),
        };

        setMessages((prev) => [...prev, _userMessage]);
        setIsTyping(true);
        setInput("");

        try {
            const { userMessage, assistantMessage } = await sendMessage(activeConversationId, _userMessage.content, activeMentorName as string);
            setMessages((prev) => {
                const withoutOptimistic = prev.slice(0, -1); // remove the optimistic user message
                return [...withoutOptimistic, userMessage, assistantMessage];
            });
            if (!activeConversationId) {
                setActiveConversationId(assistantMessage.conversationId as string);
                getConversationHistory();
            }
            if (autoSpeak) {
                speak(assistantMessage.content, assistantMessage._id);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to send message. Please try again.");
        } finally {
            setIsTyping(false);
        }
    };

    const handleStartConversation = async () => {
        if (!activeMentorName) return;
        setIsTyping(true);
        try {
            const { conversationId, assistantMessage } = await startConversation(activeMentorName);
            setActiveConversationId(conversationId);
            setMessages([assistantMessage]);
            getConversationHistory();
            if (autoSpeak) {
                speak(assistantMessage.content, assistantMessage._id);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to start conversation");
        } finally {
            setIsTyping(false);
        }
    };

    const handleHelp = async (id: string) => {
        if (!id) return;
        setLoadingSuggestion(true);

        const promise = getSuggestion(id).then(({ assistantMessage }) => {
            setMessages((prev) => prev.map((m) => (m._id === id ? assistantMessage : m)));
        });

        toast.promise(promise, {
            loading: "Thinking of a reply for you...",
            success: "Here's a suggestion!",
            error: "Couldn't get a suggestion right now",
        });

        try {
            await promise;
        } finally {
            setLoadingSuggestion(false);
        }
    };

    const handleSelectConversation = async (id: string) => {
        if (id === activeConversationId) return; // no-op if already active

        setActiveConversationId(id);
        setIsTyping(true); // reuse this as a lightweight loading indicator

        try {
            const data = await getConversationMessages(id);
            const loadedMessages: ConversationMessageT[] = data.messages.map((m, index) => ({
                _id: m._id,
                role: m.role,
                content: m.content,
                suggestion: m.suggestion,
                feedback: m.feedback,
                score: m.score,
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

    const handleSelectMentor = async (name: string) => {
        if (name === activeMentorName) {
            setIsMentorModalOpen(false)
            return
        };
        setActiveMentorName(name);
        setMessages([])
        setActiveConversationId(null)
        setConversations([])
        setIsMentorModalOpen(false)
    };

    const handleDeleteConversation = async (id: string) => {
        setIsDeletingRecord(true);
        try {
            await deleteConversationMessages(id);
            getConversationHistory();
            if (id === activeConversationId) {
                setActiveConversationId(null);
                setMessages([]);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete conversation");
        } finally {
            setIsDeletingRecord(false);
        }
    };

    return (
        <>
            <div className="flex w-full h-screen flex-row overflow-hidden">
                <ChatSidebar
                    activeMentor={activeMentor}
                    history={conversations}
                    activeConversationId={activeConversationId}
                    onSelectConversation={handleSelectConversation}
                    openModel={() => setIsMentorModalOpen(true)}
                    onNewConversation={handleNewConversation}
                    onDeleteConversation={handleDeleteConversation}
                    autoSpeak={autoSpeak}
                    setAutoSpeak={setAutoSpeak}
                />
                <div className="flex flex-1 flex-col min-h-screen overflow-hidden p-4 pb-0">
                    <section className="flex flex-1 flex-col gap-4 overflow-y-auto scrollbar-none">
                        {messages.length ? messages.map((message, i) => (
                            <ChatMessage
                                key={i}
                                message={message}
                                onSpeak={speak}
                                handleHelp={handleHelp}
                                loadingSuggestion={loadingSuggestion}
                                currentSpeakingId={currentSpeakingId}
                                stop={stop}
                                isSpeaking={isSpeaking}
                            />
                        )) :
                            (!activeConversationId && !isTyping && (
                                <div className="flex flex-1 flex-col items-center justify-center gap-3">
                                    <p className="text-white/60">{activeMentor?.description}</p>
                                    <button
                                        type="button"
                                        onClick={handleStartConversation}
                                        className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
                                    >
                                        Start Conversation
                                    </button>
                                </div>
                            ))
                        }
                        {isTyping && <TypingIndicator />}
                        <div ref={bottomRef} className='visibility:hidden' />
                    </section>
                    <ChatForm
                        input={input}
                        loadingSuggestion={loadingSuggestion}
                        isTyping={isTyping}
                        handleInputChange={handleInputChange}
                        handleSend={handleSend}
                        setInput={setInput}
                    />
                </div>
                <Loader isLoading={isDeletingRecord} />
            </div>
            {isMentorModalOpen && (
                <MentorSelectModal
                    mentors={mentors}
                    activeMentorName={activeMentorName}
                    onSelect={handleSelectMentor}
                    onClose={() => setIsMentorModalOpen(false)}
                />
            )}
        </>
    );
}

export default Chat;
