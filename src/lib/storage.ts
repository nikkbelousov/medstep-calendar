import {
  createDefaultConfig,
  type AppState,
  type DayRecord,
  type Records,
} from "./plan";
import type { ISODate } from "./date";

export const STORAGE_KEY_V2 = "taper-calendar-v2";
export const STORAGE_KEY_V1 = "omez-taper-calendar-v1";

type LegacyRecord = {
  done?: boolean;
  gaviscon?: boolean;
  rennie?: boolean;
  heartburn?: boolean;
  pain?: boolean;
  note?: string;
};

type LegacyRecords = Record<ISODate, LegacyRecord>;

export function createDefaultState(): AppState {
  return {
    config: createDefaultConfig(),
    records: {},
  };
}

export function loadState(): AppState {
  try {
    if (typeof window === "undefined") return createDefaultState();

    const savedV2 = window.localStorage.getItem(STORAGE_KEY_V2);
    if (savedV2) {
      const parsed = safeParse(savedV2);
      if (isAppState(parsed)) return parsed;
    }

    const savedV1 = window.localStorage.getItem(STORAGE_KEY_V1);
    if (savedV1) {
      const parsed = safeParse(savedV1);
      if (isRecordMap(parsed)) {
        return {
          config: createDefaultConfig(),
          records: migrateLegacyRecords(parsed as LegacyRecords),
        };
      }
    }

    return createDefaultState();
  } catch {
    return createDefaultState();
  }
}

export function saveState(state: AppState): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(state));
  } catch {
    // localStorage can be unavailable in private or restricted browser contexts.
  }
}

export function migrateLegacyRecords(records: LegacyRecords): Records {
  return Object.fromEntries(
    Object.entries(records).map(([iso, record]) => [
      iso,
      {
        done: record.done,
        supportMedication: record.gaviscon,
        rescueMedication: record.rennie,
        heartburn: record.heartburn,
        painOrBloating: record.pain,
        note: record.note,
      } satisfies DayRecord,
    ]),
  );
}

function safeParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const maybeState = value as Partial<AppState>;
  return Boolean(maybeState.config && typeof maybeState.config === "object" && maybeState.records);
}

function isRecordMap(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
