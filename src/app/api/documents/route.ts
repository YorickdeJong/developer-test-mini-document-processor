import { NextResponse } from "next/server";
import { listDocumentRecords } from "@/server/documents";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(await listDocumentRecords());
}

