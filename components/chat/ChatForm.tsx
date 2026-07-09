type ChatFormProps = {
    handleSend: (event: React.FormEvent<HTMLFormElement>) => void;
    input: string;
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function ChatForm({ handleSend, input, handleInputChange }: ChatFormProps) {
    return (
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
    );
}