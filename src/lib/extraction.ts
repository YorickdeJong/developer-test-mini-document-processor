import type { ExtractedFields, SourceDocument } from "./types";

export function extractDocumentFields(document: SourceDocument): ExtractedFields {
  const text = document.rawText;

  return {
    customer:
      pickFirst(text, [
        /customer\s*[:=]\s*(.+)/i,
        /client\s*[:=]\s*(.+)/i,
        /klant\s*[:=]\s*(.+)/i,
        /order for\s+(.+)/i,
      ]) ?? undefined,
    referenceNumber:
      pickFirst(text, [
        /reference\s*[:=]\s*([A-Z0-9-]+)/i,
        /ref(?:erentie| no)?\s*[:=]\s*([A-Z0-9-]+)/i,
        /booking code\s+([A-Z0-9-]+)/i,
      ]) ?? undefined,
    pickupDate:
      pickFirst(text, [
        /pickup(?: date)?\s*[:=]?\s*([0-9]{4}[-/][0-9]{2}[-/][0-9]{2})/i,
        /ophaaldatum\s*[:=]\s*([0-9]{4}[-/][0-9]{2}[-/][0-9]{2})/i,
      ]) ?? undefined,
    deliveryAddress:
      pickFirst(text, [
        /delivery(?: address)?\s*[:=]\s*(.+)/i,
        /delivery should go to\s*[:=]\s*(.+)/i,
        /deliver to\s*[:=]\s*(.+)/i,
        /ship to\s*[:=]\s*(.+)/i,
        /afleveradres\s*[:=]\s*(.+)/i,
      ]) ?? undefined,
    weightKg:
      pickFirst(text, [
        /(?:total weight|weight|gewicht|gross weight)\s*[:=-]?\s*([0-9]+)\s*kg/i,
      ]) ?? undefined,
  };
}

function pickFirst(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].trim().replace(/[.,;]$/, "");
    }
  }

  return null;
}
