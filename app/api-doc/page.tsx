import { getApiDocs } from "@/lib/swagger/swagger";
import SwaggerDocsClient from "./swagger-docs-client";

export const revalidate = 3600;

export default async function ApiDocPage() {
  const spec = await getApiDocs();

  return (
    <main className="container mx-auto p-4 bg-white">
      <SwaggerDocsClient spec={spec} />
    </main>
  );
}
