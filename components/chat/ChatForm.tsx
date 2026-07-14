import { useSpeechRecognition } from "@/lib/hooks/useSpeechRecognition";
import { MdMic, MdMicOff } from "react-icons/md";
import { toast } from "sonner";

type ChatFormProps = {
    input: string;
    isTyping: boolean;
    loadingSuggestion: boolean;
    handleSend: (event: React.FormEvent<HTMLFormElement>) => void;
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setInput: React.Dispatch<React.SetStateAction<string>>;
};

export default function ChatForm({
    input,
    isTyping,
    loadingSuggestion,
    handleSend,
    setInput,
    handleInputChange
}: ChatFormProps) {
    const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition(
        handleTranscript,
        (error) => {
            if (error === "not-allowed") {
                toast.error("Microphone access was denied. Please allow it in Chrome to use voice input.");
            } else {
                toast.error("Couldn't hear that. Please try again.");
            }
        }
    );
    function handleTranscript(transcript: string) {
        setInput((prev: string) => {
            const trimmedPrev = prev.trim();
            return trimmedPrev ? `${trimmedPrev} ${transcript}` : transcript;
        });
    };


    return (
        <form onSubmit={handleSend} className="border-t border-white/10 py-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 p-3 sm:flex-row sm:items-center">
                <input
                    value={input}
                    disabled={isListening || isTyping || loadingSuggestion}
                    onChange={handleInputChange}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 text-sm text-white outline-none ring-0"
                />
                {isSupported && (
                    <button
                        type="button"
                        disabled={loadingSuggestion || isTyping}
                        onClick={isListening ? stopListening : startListening}
                        title={isListening ? "Stop listening" : "Speak your message"}
                        className={`rounded-xl p-3 transition disabled:cursor-not-allowed hover:opacity-50 ${isListening
                            ? "bg-red-500/20 text-red-400 animate-pulse"
                            : "text-white/50 hover:text-white"
                            }`}
                    >
                        {isListening ? <MdMicOff size={18} /> : <MdMic size={18} />}
                    </button>
                )}
                <button
                    disabled={loadingSuggestion || isTyping || isListening}
                    type="submit"
                    className="btn-primary"
                >
                    Send
                </button>
            </div>
        </form>
    );
}