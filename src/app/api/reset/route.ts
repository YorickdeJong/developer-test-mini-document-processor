import { NextResponse } from "next/server";
import { resetDatabase } from "@/server/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  await resetDatabase();
  return NextResponse.json({ ok: true });
}

