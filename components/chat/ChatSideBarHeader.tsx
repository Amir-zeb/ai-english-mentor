import { VoidFunctionT } from "@/lib/types";
import { MdSwapHoriz } from "react-icons/md";

type ChatSideBarHeaderProps = {
    title: string | null;
    openModel: VoidFunctionT;
};

export default function ChatSideBarHeader({ title, openModel }: ChatSideBarHeaderProps) {
    return (
        <div className="p-2 border-b border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 p-2">
                <h4 className="text-lg font-bold">{title}</h4>
                <button
                    type="button"
                    onClick={openModel}
                    className="rounded-lg p-1 text-white/50 hover:text-white"
                    title="Change mentor"
                >
                    <MdSwapHoriz />
                </button>
            </div>
        </div>
    )
}