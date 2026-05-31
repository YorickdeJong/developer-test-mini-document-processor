import { NextResponse } from "next/server";
import { updateStoredOrder } from "@/server/orderStore";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const order = (await request.json()) as Order;
  const updated = await updateStoredOrder(id, order);

  if (!updated) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json(updated);
}

