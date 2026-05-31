import { describe, expect, it } from "vitest";
import { validateExtraction } from "../validation";

describe("validateExtraction", () => {
  it("blocks export when required operational fields are missing", () => {
    const result = validateExtraction({});

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.field)).toContain("customer");
    expect(result.issues.map((issue) => issue.field)).toContain("pickupDate");
    expect(result.issues.map((issue) => issue.field)).toContain("weightKg");
  });
});

