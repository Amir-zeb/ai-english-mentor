import { useEffect, useRef, useState } from "react";

type ChatProps = {
    title?: string;
};

type ChatSideBarProps = {
    title?: string;
    history?: string[];
};

type Message = {
    id: number;
    sender: "user" | "assistant";
    text: string;
};

// this component will be generic for any mentor, and will be passed the title of the mentor and the conversation history as props later.
function Chat({ title }: ChatProps) {

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>("");
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
    }

    const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now(),
            sender: "user",
            text: input.trim(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: input.trim() }),
            });
            const data = await response.json();
            const assistantReply: Message = {
                id: Date.now() + 1,
                sender: "assistant",
                text: data.reply,
            };
            setMessages((prev) => [...prev, assistantReply]);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex w-full h-screen flex-row overflow-hidden">
            <ChatSidebar title={title} history={['History Item 1', 'History Item 2']} />
            <div className="flex flex-1 flex-col min-h-screen overflow-hidden overflow-y-auto p-4">
                <section className="flex flex-1 flex-col gap-4 overflow-y-auto">
                    {messages.length ? messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] text-sm sm:max-w-[70%] ${message.sender === "user"
                                    ? "bg-slate-800/90 text-white rounded-2xl px-4 py-3 shadow-md"
                                    : ""
                                    }`}
                            >
                                <p>{message.text}</p>
                            </div>
                        </div>
                    )) :
                        <div>
                            <p className="text-center">No messages yet. Start the conversation!</p>
                        </div>
                    }
                    {isTyping && (
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-white" />
                            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-white [animation-delay:0.15s]" />
                            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-white [animation-delay:0.3s]" />
                        </div>
                    )}
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

const ChatSidebar = ({ title = 'Mentor', history = [] }: ChatSideBarProps) => {
    return (
        <div className="flex w-64 flex-col border-r border-white/10">
            <div className="p-2 border-b border-white/10">
                <h4 className="text-center text-lg font-bold">{title}</h4>
            </div>
            <div className="flex-1 p-4 overflow-y-auto overflow-x-hidden">
                <ul>
                    {history.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>
        </div>
    )
}