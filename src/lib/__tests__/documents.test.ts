import { describe, expect, it } from "vitest";
import documents from "../../data/documents.json";

describe("seed documents", () => {
  it("provides enough messy inputs for the exercise", () => {
    expect(documents.length).toBeGreaterThanOrEqual(6);
    expect(documents[0]).toHaveProperty("rawText");
  });
});

