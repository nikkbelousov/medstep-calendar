import { describe, expect, it } from "vitest";
import {
  createDefaultConfig,
  createPresetPhases,
  getPlanForDate,
  getPlannedDates,
  inferPhasePreset,
  parseCustomSequence,
  sequenceToInputValue,
  type AppConfig,
} from "./plan";

function configWithPhases(phases: AppConfig["phases"]): AppConfig {
  return {
    ...createDefaultConfig(),
    startDate: "2026-05-10",
    medicationName: "Пантопразол",
    doseLabel: "40 мг",
    defaultTime: "утром",
    phases,
  };
}

describe("plan presets", () => {
  it("keeps the default eight-week plan behavior", () => {
    const config = createDefaultConfig();

    expect(getPlanForDate("2026-05-09", config).type).toBe("past");
    expect(getPlanForDate("2026-05-10", config).type).toBe("skip");
    expect(getPlanForDate("2026-05-11", config).type).toBe("take");
    expect(getPlanForDate("2026-05-27", config).type).toBe("skip");
    expect(getPlanForDate("2026-06-08", config).type).toBe("take");
  });

  it("calculates 6/1 and 5/2 weekly skip presets", () => {
    const sixOne = configWithPhases(createPresetPhases("six-one"));
    const fiveTwo = configWithPhases(createPresetPhases("five-two"));

    expect(getPlanForDate("2026-05-10", sixOne).type).toBe("skip");
    expect(getPlanForDate("2026-05-13", sixOne).type).toBe("take");
    expect(getPlanForDate("2026-05-13", fiveTwo).type).toBe("skip");
    expect(getPlanForDate("2026-05-14", fiveTwo).type).toBe("take");
  });

  it("calculates interval presets", () => {
    const everyOtherDay = configWithPhases(createPresetPhases("every-other-day"));
    const everyThirdDay = configWithPhases(createPresetPhases("every-third-day"));

    expect(getPlanForDate("2026-05-10", everyOtherDay).type).toBe("skip");
    expect(getPlanForDate("2026-05-11", everyOtherDay).type).toBe("take");
    expect(getPlanForDate("2026-05-12", everyThirdDay).type).toBe("skip");
    expect(getPlanForDate("2026-05-14", everyThirdDay).type).toBe("take");
  });

  it("uses neutral labels with configured medication data", () => {
    const config = configWithPhases(createPresetPhases("six-one"));
    const plan = getPlanForDate("2026-05-11", config);

    expect(plan.label).toBe("Пантопразол утром");
    expect(plan.details).toContain("Пантопразол 40 мг");
  });

  it("returns planned dates for the configured duration", () => {
    const config = configWithPhases(createPresetPhases("custom", "take,skip"));

    expect(getPlannedDates(config)).toHaveLength(56);
    expect(getPlannedDates(config)[0]).toBe("2026-05-10");
    expect(getPlannedDates(config)[55]).toBe("2026-07-04");
  });
});

describe("custom sequence", () => {
  it("parses supported custom sequence tokens", () => {
    expect(parseCustomSequence("take, skip, as-needed, приём, пропуск, по требованию")).toEqual([
      "take",
      "skip",
      "asNeeded",
      "take",
      "skip",
      "asNeeded",
    ]);
  });

  it("falls back when custom sequence has no valid steps", () => {
    expect(parseCustomSequence("unknown")).toEqual(["take", "skip"]);
  });

  it("repeats custom sequence by phase day", () => {
    const config = configWithPhases(createPresetPhases("custom", "take,skip,as-needed"));

    expect(getPlanForDate("2026-05-10", config).type).toBe("take");
    expect(getPlanForDate("2026-05-11", config).type).toBe("skip");
    expect(getPlanForDate("2026-05-12", config).type).toBe("asNeeded");
    expect(getPlanForDate("2026-05-13", config).type).toBe("take");
  });

  it("serializes and infers custom preset", () => {
    const phases = createPresetPhases("custom", "take,skip,as-needed");
    const pattern = phases[0].pattern;

    expect(inferPhasePreset(phases)).toBe("custom");
    expect(pattern.type).toBe("custom-sequence");
    if (pattern.type === "custom-sequence") {
      expect(sequenceToInputValue(pattern.sequence)).toBe("take,skip,asNeeded");
    }
  });
});
