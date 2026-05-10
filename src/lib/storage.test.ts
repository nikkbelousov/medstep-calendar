import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDefaultConfig, type AppState } from "./plan";
import {
  createDefaultState,
  loadState,
  migrateLegacyRecords,
  saveState,
  STORAGE_KEY_V1,
  STORAGE_KEY_V2,
} from "./storage";

function createLocalStorageMock() {
  const storage = new Map<string, string>();

  return {
    clear: vi.fn(() => storage.clear()),
    getItem: vi.fn((key: string) => storage.get(key) ?? null),
    key: vi.fn((index: number) => Array.from(storage.keys())[index] ?? null),
    removeItem: vi.fn((key: string) => storage.delete(key)),
    setItem: vi.fn((key: string, value: string) => {
      storage.set(key, value);
    }),
    get length() {
      return storage.size;
    },
  } satisfies Storage;
}

describe("storage", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      localStorage: createLocalStorageMock(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates a default state", () => {
    const state = createDefaultState();

    expect(state.config.startDate).toBe("2026-05-10");
    expect(state.records).toEqual({});
  });

  it("saves and loads v2 state", () => {
    const state: AppState = {
      config: {
        ...createDefaultConfig(),
        medicationName: "Пантопразол",
      },
      records: {
        "2026-05-10": {
          done: true,
          supportMedication: true,
          note: "ok",
        },
      },
    };

    saveState(state);

    expect(window.localStorage.getItem(STORAGE_KEY_V2)).toBe(JSON.stringify(state));
    expect(loadState()).toEqual(state);
  });

  it("normalizes old v2 state without locale", () => {
    const legacyV2State = {
      config: {
        ...createDefaultConfig(),
        locale: undefined,
      },
      records: {},
    };

    window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(legacyV2State));

    expect(loadState().config.locale).toBe("ru");
  });

  it("normalizes malformed config fields", () => {
    window.localStorage.setItem(
      STORAGE_KEY_V2,
      JSON.stringify({
        config: {
          ...createDefaultConfig(),
          locale: "de",
          startDate: "not-a-date",
          medicationName: "",
          doseLabel: 20,
          symptomLabels: {
            heartburn: "",
            painOrBloating: "nausea",
          },
        },
        records: {},
      }),
    );

    const state = loadState();

    expect(state.config.locale).toBe("ru");
    expect(state.config.startDate).toBe("2026-05-10");
    expect(state.config.medicationName).toBe("Омез");
    expect(state.config.doseLabel).toBe("20 мг");
    expect(state.config.symptomLabels.heartburn).toBe("изжога");
    expect(state.config.symptomLabels.painOrBloating).toBe("nausea");
  });

  it("normalizes records by ISO date and known fields", () => {
    window.localStorage.setItem(
      STORAGE_KEY_V2,
      JSON.stringify({
        config: createDefaultConfig(),
        records: {
          "2026-05-10": {
            done: true,
            supportMedication: "yes",
            rescueMedication: false,
            heartburn: true,
            note: 123,
            extra: true,
          },
          "not-a-date": {
            done: true,
          },
        },
      }),
    );

    expect(loadState().records).toEqual({
      "2026-05-10": {
        done: true,
        rescueMedication: false,
        heartburn: true,
      },
    });
  });

  it("falls back to default phases when saved phases are invalid", () => {
    window.localStorage.setItem(
      STORAGE_KEY_V2,
      JSON.stringify({
        config: {
          ...createDefaultConfig(),
          phases: [
            {
              id: "bad",
              title: "bad",
              durationDays: -1,
              pattern: { type: "unknown" },
              takeDetails: "",
              skipDetails: "",
            },
          ],
        },
        records: {},
      }),
    );

    expect(loadState().config.phases.map((phase) => phase.id)).toEqual([
      "weeks-1-2",
      "weeks-3-4",
      "weeks-5-6",
      "weeks-7-8",
    ]);
  });

  it("normalizes custom sequence phases", () => {
    window.localStorage.setItem(
      STORAGE_KEY_V2,
      JSON.stringify({
        config: {
          ...createDefaultConfig(),
          phases: [
            {
              id: "custom",
              title: "Custom",
              durationDays: 3,
              pattern: { type: "custom-sequence", sequence: ["take", "bad", "skip"] },
              takeDetails: "Take",
              skipDetails: "Skip",
            },
          ],
        },
        records: {},
      }),
    );

    expect(loadState().config.phases[0].pattern).toEqual({
      type: "custom-sequence",
      sequence: ["take", "skip"],
    });
  });

  it("falls back to default state on malformed v2 data", () => {
    window.localStorage.setItem(STORAGE_KEY_V2, "{bad-json");

    expect(loadState()).toEqual(createDefaultState());
  });

  it("migrates legacy records without deleting the legacy key", () => {
    window.localStorage.setItem(
      STORAGE_KEY_V1,
      JSON.stringify({
        "2026-05-10": {
          done: true,
          gaviscon: true,
          rennie: true,
          heartburn: true,
          pain: true,
          note: "legacy note",
        },
      }),
    );

    const state = loadState();

    expect(state.records["2026-05-10"]).toEqual({
      done: true,
      supportMedication: true,
      rescueMedication: true,
      heartburn: true,
      painOrBloating: true,
      note: "legacy note",
    });
    expect(window.localStorage.getItem(STORAGE_KEY_V1)).not.toBeNull();
  });

  it("maps legacy record fields", () => {
    expect(
      migrateLegacyRecords({
        "2026-05-10": {
          done: true,
          gaviscon: true,
          rennie: false,
          heartburn: true,
          pain: false,
          note: "note",
        },
      }),
    ).toEqual({
      "2026-05-10": {
        done: true,
        supportMedication: true,
        rescueMedication: false,
        heartburn: true,
        painOrBloating: false,
        note: "note",
      },
    });
  });
});
