import { MentorSummaryT } from "@/lib/types";

type MentorSelectModalProps = {
    mentors: MentorSummaryT[] | undefined;
    activeMentorName: string | null;
    onSelect: (name: string) => void;
    onClose: () => void;
};

export function MentorSelectModal({
    mentors,
    activeMentorName,
    onSelect,
    onClose,
}: MentorSelectModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
            onClick={() => {
                if (!activeMentorName) return
                onClose()
            }}
        >
            <div
                className="w-80 rounded-xl border border-white/10 bg-slate-900 p-4"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="mb-3 text-sm font-semibold text-white/70">Choose a mentor</h3>
                <ul className="flex flex-col gap-2">
                    {mentors && mentors.map((mentor) => (
                        <li
                            key={mentor.id}
                            onClick={() => onSelect(mentor.name)}
                            className={`cursor-pointer rounded-lg p-3 hover:bg-white/10 ${mentor.name === activeMentorName ? "bg-white/10" : ""
                                }`}
                        >
                            <p className="font-medium">{mentor.name}</p>
                            <p className="text-xs text-white/50">{mentor.description}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}