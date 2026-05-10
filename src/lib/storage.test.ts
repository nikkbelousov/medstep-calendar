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
