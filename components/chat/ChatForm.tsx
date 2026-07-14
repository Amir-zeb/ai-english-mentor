import { useSpeechRecognition } from "@/lib/hooks/useSpeechRecognition";
import { MdMic, MdMicOff } from "react-icons/md";
import { toast } from "sonner";

type ChatFormProps = {
    input: string;
    handleSend: (event: React.FormEvent<HTMLFormElement>) => void;
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setInput: React.Dispatch<React.SetStateAction<string>>;
};

export default function ChatForm({ input, handleSend, setInput, handleInputChange }: ChatFormProps) {
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
                    onChange={handleInputChange}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 text-sm text-white outline-none ring-0"
                />
                {isSupported && (
                    <button
                        type="button"
                        onClick={isListening ? stopListening : startListening}
                        title={isListening ? "Stop listening" : "Speak your message"}
                        className={`rounded-xl p-3 transition ${isListening
                                ? "bg-red-500/20 text-red-400 animate-pulse"
                                : "text-white/50 hover:text-white"
                            }`}
                    >
                        {isListening ? <MdMicOff size={18} /> : <MdMic size={18} />}
                    </button>
                )}
                <button
                    type="submit"
                    className="rounded-xl bg-linear-to-r from-slate-800/30 to-slate-900 px-4 py-3 text-sm font-semibold text-white opacity-30 transition hover:opacity-100"
                >
                    Send
                </button>
            </div>
        </form>
    );
}