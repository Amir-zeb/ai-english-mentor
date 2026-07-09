export default function TypingIndicator() {
    return (
        <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-white" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-white [animation-delay:0.15s]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-white [animation-delay:0.3s]" />
        </div>
    );
}