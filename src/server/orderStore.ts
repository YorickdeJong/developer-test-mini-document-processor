import fs from "node:fs/promises";
import path from "node:path";
import seedOrders from "@/data/orders.json";
import type { Order } from "@/lib/types";

const RUNTIME_DIR = path.join(process.cwd(), "data", "runtime");
const ORDERS_PATH = path.join(RUNTIME_DIR, "orders.json");

export async function listStoredOrders(): Promise<Order[]> {
  await ensureRuntimeOrders();
  return JSON.parse(await fs.readFile(ORDERS_PATH, "utf8")) as Order[];
}

export async function updateStoredOrder(id: string, nextOrder: Order) {
  const orders = await listStoredOrders();
  const index = orders.findIndex((order) => order.id === id);

  if (index === -1) {
    return null;
  }

  orders[index] = { ...nextOrder, id };
  await writeOrders(orders);
  return orders[index];
}

export async function resetStoredOrders() {
  const orders = seedOrders as Order[];
  await writeOrders(orders);
  return orders;
}

async function ensureRuntimeOrders() {
  try {
    await fs.access(ORDERS_PATH);
  } catch {
    await resetStoredOrders();
  }
}

async function writeOrders(orders: Order[]) {
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
  await fs.writeFile(ORDERS_PATH, `${JSON.stringify(orders, null, 2)}\n`);
}

