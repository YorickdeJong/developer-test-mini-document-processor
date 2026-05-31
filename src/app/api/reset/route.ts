import { NextResponse } from "next/server";
import { resetStoredOrders } from "@/server/orderStore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(await resetStoredOrders());
}
