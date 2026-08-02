import ChatComponent from "@/components/chat/chat";
import { MENTORS } from "@/lib/mentors/config";
import { MentorSummaryT } from "@/lib/types";

export default function Chat() {
  const mentors: MentorSummaryT[] = MENTORS.map(({ id, name, title, voiceURI, description, personaName }) => ({
    id,
    name,
    title,
    voiceURI,
    description,
    personaName,
  }));

  return (
    <ChatComponent mentors={mentors} />
  );
}
