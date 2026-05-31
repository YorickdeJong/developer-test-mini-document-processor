import { NextResponse } from "next/server";
import { getDocumentRecord, updateDocumentReview } from "@/server/documents";
import type { ExtractedFields } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const record = await getDocumentRecord(id);

  if (!record) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  return NextResponse.json(record);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as {
    fields?: ExtractedFields;
    reviewNote?: string;
  };
  const record = await updateDocumentReview(id, body);

  if (!record) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  return NextResponse.json(record);
}

