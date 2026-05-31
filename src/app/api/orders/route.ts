import { NextResponse } from "next/server";
import { listStoredOrders } from "@/server/orderStore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(await listStoredOrders());
}

