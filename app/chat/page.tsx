import ChatComponent from "@/components/chat/chat";
import { MENTORS } from "@/lib/mentors/config";
import { MentorSummaryT } from "@/lib/types";

export default function Chat() {
  const mentors: MentorSummaryT[] = MENTORS.map(({ id, name, title, description }) => ({
    id,
    name,
    title,
    description,
  }));

  return (
    <ChatComponent mentors={mentors} />
  );
}
