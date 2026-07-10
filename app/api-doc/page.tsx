import { getApiDocs } from "@/lib/swagger/swagger";
import ReactSwagger from "./react-swagger";

export default async function ApiDocPage() {
  const spec = await getApiDocs();
  return (
    <main className="container mx-auto p-4 bg-white">
      <ReactSwagger spec={spec} />
    </main>
  );
}
