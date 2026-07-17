'use client';

import dynamic from "next/dynamic";

const ReactSwagger = dynamic(() => import("./react-swagger"), {
  ssr: false,
  loading: () => <div className="text-sm text-slate-500">Loading API documentation…</div>,
});

type Props = {
  spec: Record<string, unknown>;
};

export default function SwaggerDocsClient({ spec }: Props) {
  return <ReactSwagger spec={spec} />;
}
