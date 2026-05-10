import { describe, expect, it } from "vitest";
import { addDays, dayDiff, fromISO, getMonthMatrix, toISO } from "./date";

describe("date helpers", () => {
  it("round-trips local ISO dates", () => {
    const date = fromISO("2026-05-10");

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(4);
    expect(date.getDate()).toBe(10);
    expect(toISO(date)).toBe("2026-05-10");
  });

  it("adds days across month boundaries", () => {
    expect(toISO(addDays(fromISO("2026-05-30"), 3))).toBe("2026-06-02");
    expect(toISO(addDays(fromISO("2026-06-02"), -3))).toBe("2026-05-30");
  });

  it("calculates signed day differences", () => {
    expect(dayDiff("2026-05-12", "2026-05-10")).toBe(2);
    expect(dayDiff("2026-05-09", "2026-05-10")).toBe(-1);
  });

  it("creates a monday-first 42-day month matrix", () => {
    const matrix = getMonthMatrix(2026, 4);

    expect(matrix).toHaveLength(42);
    expect(toISO(matrix[0])).toBe("2026-04-27");
    expect(toISO(matrix[13])).toBe("2026-05-10");
    expect(toISO(matrix[41])).toBe("2026-06-07");
  });
});
