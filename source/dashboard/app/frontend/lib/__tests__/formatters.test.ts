import { formatCompact, formatCost, formatLatency, formatTrend } from "../formatters";

describe("formatCompact", () => {
  it("formats millions", () => {
    expect(formatCompact(42800000)).toBe("42.8M");
  });

  it("formats thousands", () => {
    expect(formatCompact(1500)).toBe("1.5K");
  });

  it("formats small numbers as-is", () => {
    expect(formatCompact(42)).toBe("42");
  });
});

describe("formatCost", () => {
  it("converts cents to dollar string", () => {
    expect(formatCost(84250)).toBe("$842.50");
  });

  it("handles zero", () => {
    expect(formatCost(0)).toBe("$0.00");
  });
});

describe("formatLatency", () => {
  it("formats seconds for values >= 1000ms", () => {
    expect(formatLatency(1800)).toBe("1.8s");
  });

  it("formats milliseconds for values < 1000ms", () => {
    expect(formatLatency(245)).toBe("245ms");
  });
});

describe("formatTrend", () => {
  it("formats percentage with absolute value", () => {
    expect(formatTrend(12.5)).toBe("12.5%");
  });

  it("formats negative values as positive", () => {
    expect(formatTrend(-8.3)).toBe("8.3%");
  });

  it("returns null for null input", () => {
    expect(formatTrend(null)).toBeNull();
  });
});
