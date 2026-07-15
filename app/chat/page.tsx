import ChatComponent from "@/components/chat/chat";
import { MENTORS } from "@/lib/mentors/config";
import { MentorSummaryT } from "@/lib/types";

export default function Chat() {
  const mentors: MentorSummaryT[] = MENTORS.map(({ id, name, title, description, personaName }) => ({
    id,
    name,
    title,
    description,
    personaName,
  }));

  return (
    <ChatComponent mentors={mentors} />
  );
}
