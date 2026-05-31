import { NextResponse } from "next/server";
import { approveDocument } from "@/server/documents";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await approveDocument(id);

  if (!result.record) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  if (result.error) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result.record);
}

