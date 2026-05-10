import { dayDiff, fromISO, type ISODate } from "./date";

export type PlanDayType = "take" | "skip" | "asNeeded" | "past";

export interface PlanDay {
  type: PlanDayType;
  label: string;
  details: string;
  phaseTitle: string;
}

export interface SymptomLabels {
  heartburn: string;
  painOrBloating: string;
}

export interface DayRecord {
  done?: boolean;
  supportMedication?: boolean;
  rescueMedication?: boolean;
  heartburn?: boolean;
  painOrBloating?: boolean;
  note?: string;
}

export type Records = Record<ISODate, DayRecord>;

export type CustomSequenceStep = "take" | "skip" | "asNeeded";

export type PhasePattern =
  | { type: "skip-weekdays"; weekdays: number[] }
  | { type: "every-n-days"; interval: number; takeOnRemainder: number }
  | { type: "take-every-day" }
  | { type: "as-needed" }
  | { type: "custom-sequence"; sequence: CustomSequenceStep[] };

export interface TaperPhase {
  id: string;
  title: string;
  durationDays: number;
  pattern: PhasePattern;
  takeDetails: string;
  skipDetails: string;
  asNeededDetails?: string;
}

export interface AppConfig {
  startDate: ISODate;
  medicationName: string;
  doseLabel: string;
  defaultTime: string;
  supportMedicationName: string;
  rescueMedicationName: string;
  symptomLabels: SymptomLabels;
  phases: TaperPhase[];
}

export interface AppState {
  config: AppConfig;
  records: Records;
}

export const medicationOptions = [
  "Омез",
  "Омепразол",
  "Пантопразол",
  "Эзомепразол",
  "Рабепразол",
  "Фамотидин",
  "Другое",
];

export const phasePresetOptions = [
  { value: "omez", label: "Базовый 8-недельный план" },
  { value: "six-one", label: "6/1" },
  { value: "five-two", label: "5/2" },
  { value: "every-other-day", label: "Через день" },
  { value: "every-third-day", label: "1 раз в 3 дня" },
  { value: "as-needed", label: "По требованию" },
  { value: "custom", label: "Своя последовательность" },
] as const;

export type PhasePresetId = (typeof phasePresetOptions)[number]["value"];

const defaultTakeDetails =
  "{medication} {dose} утром за 30 минут до еды.";

export function createDefaultConfig(): AppConfig {
  return {
    startDate: "2026-05-10",
    medicationName: "Омез",
    doseLabel: "20 мг",
    defaultTime: "10:00",
    supportMedicationName: "Гевискон",
    rescueMedicationName: "Ренни",
    symptomLabels: {
      heartburn: "изжога",
      painOrBloating: "боль/вздутие",
    },
    phases: createPresetPhases("omez"),
  };
}

export function createPresetPhases(preset: PhasePresetId, customSequence = "take,skip"): TaperPhase[] {
  if (preset === "six-one") {
    return [
      {
        id: "six-one",
        title: "6/1",
        durationDays: 56,
        pattern: { type: "skip-weekdays", weekdays: [0] },
        takeDetails: defaultTakeDetails,
        skipDetails: "Без {medication}. {support} по согласованному плану при симптомах.",
      },
    ];
  }

  if (preset === "five-two") {
    return [
      {
        id: "five-two",
        title: "5/2",
        durationDays: 56,
        pattern: { type: "skip-weekdays", weekdays: [0, 3] },
        takeDetails: defaultTakeDetails,
        skipDetails: "Без {medication}. {support}/{rescue} по согласованному плану при симптомах.",
      },
    ];
  }

  if (preset === "every-other-day") {
    return [
      {
        id: "every-other-day",
        title: "Через день",
        durationDays: 56,
        pattern: { type: "every-n-days", interval: 2, takeOnRemainder: 1 },
        takeDetails: defaultTakeDetails,
        skipDetails: "День без {medication}. Поддержка: {support} по согласованному плану.",
      },
    ];
  }

  if (preset === "every-third-day") {
    return [
      {
        id: "every-third-day",
        title: "1 раз в 3 дня",
        durationDays: 56,
        pattern: { type: "every-n-days", interval: 3, takeOnRemainder: 1 },
        takeDetails: "{medication} {dose}, если этот день отмечен как день приёма в заданном плане.",
        skipDetails: "Без {medication}. {support}/{rescue} по согласованному плану при симптомах.",
      },
    ];
  }

  if (preset === "as-needed") {
    return [
      {
        id: "as-needed",
        title: "По требованию",
        durationDays: 56,
        pattern: { type: "as-needed" },
        takeDetails: "{medication} только по заранее согласованному плану.",
        skipDetails: "Без планового приёма.",
        asNeededDetails: "{medication} только по заранее согласованному плану.",
      },
    ];
  }

  if (preset === "custom") {
    return [
      {
        id: "custom",
        title: "Своя последовательность",
        durationDays: 56,
        pattern: { type: "custom-sequence", sequence: parseCustomSequence(customSequence) },
        takeDetails: defaultTakeDetails,
        skipDetails: "Без {medication}. {support}/{rescue} по согласованному плану.",
        asNeededDetails: "{medication} только по заранее согласованному плану.",
      },
    ];
  }

  return [
    {
      id: "weeks-1-2",
      title: "Недели 1-2: 6/1",
      durationDays: 14,
      pattern: { type: "skip-weekdays", weekdays: [0] },
      takeDetails: defaultTakeDetails,
      skipDetails: "Без {medication}. {support} после ужина и на ночь при симптомах.",
    },
    {
      id: "weeks-3-4",
      title: "Недели 3-4: 5/2",
      durationDays: 14,
      pattern: { type: "skip-weekdays", weekdays: [0, 3] },
      takeDetails: defaultTakeDetails,
      skipDetails: "Без {medication}. {support}/{rescue} по необходимости.",
    },
    {
      id: "weeks-5-6",
      title: "Недели 5-6: через день",
      durationDays: 14,
      pattern: { type: "every-n-days", interval: 2, takeOnRemainder: 1 },
      takeDetails: defaultTakeDetails,
      skipDetails: "День без {medication}. Поддержка {support} при изжоге.",
    },
    {
      id: "weeks-7-8",
      title: "Недели 7-8: 1 раз в 3 дня",
      durationDays: 14,
      pattern: { type: "every-n-days", interval: 3, takeOnRemainder: 1 },
      takeDetails: "{medication} {dose}, если идёшь по плану 1 раз в 3 дня.",
      skipDetails: "Без {medication}. {support}/{rescue} по необходимости.",
    },
  ];
}

export function parseCustomSequence(value: string): CustomSequenceStep[] {
  const parsed = value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .map((item) => {
      if (item === "take" || item === "приём" || item === "прием") return "take";
      if (item === "skip" || item === "пропуск") return "skip";
      if (item === "asneeded" || item === "as-needed" || item === "по требованию") return "asNeeded";
      return undefined;
    })
    .filter((item): item is CustomSequenceStep => Boolean(item));

  return parsed.length > 0 ? parsed : ["take", "skip"];
}

export function sequenceToInputValue(sequence: CustomSequenceStep[]): string {
  return sequence.join(",");
}

export function inferPhasePreset(phases: TaperPhase[]): PhasePresetId {
  if (phases.length === 1) {
    const phase = phases[0];
    if (phase.id === "six-one") return "six-one";
    if (phase.id === "five-two") return "five-two";
    if (phase.id === "every-other-day") return "every-other-day";
    if (phase.id === "every-third-day") return "every-third-day";
    if (phase.id === "as-needed") return "as-needed";
    if (phase.id === "custom" || phase.pattern.type === "custom-sequence") return "custom";
  }

  return "omez";
}

export function getPlanForDate(iso: ISODate, config: AppConfig): PlanDay {
  const diff = dayDiff(iso, config.startDate);
  if (diff < 0) {
    return { type: "past", label: "До старта", details: "План ещё не начат", phaseTitle: "До старта" };
  }

  let phaseStartOffset = 0;
  for (const phase of config.phases) {
    const phaseEndOffset = phaseStartOffset + phase.durationDays;
    if (diff < phaseEndOffset) {
      const phaseDayOffset = diff - phaseStartOffset;
      const type = getTypeForPhaseDay(iso, phaseDayOffset, phase.pattern);
      return createPlanDay(type, phase, config);
    }
    phaseStartOffset = phaseEndOffset;
  }

  return {
    type: "asNeeded",
    label: "По требованию",
    details: renderTemplate("{medication} только по заранее согласованному плану.", config),
    phaseTitle: "После плана",
  };
}

export function getPlannedDates(config: AppConfig): ISODate[] {
  const totalDays = Math.max(1, config.phases.reduce((sum, phase) => sum + phase.durationDays, 0));
  const start = fromISO(config.startDate);
  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
}

function getTypeForPhaseDay(
  iso: ISODate,
  phaseDayOffset: number,
  pattern: PhasePattern,
): "take" | "skip" | "asNeeded" {
  if (pattern.type === "take-every-day") return "take";
  if (pattern.type === "as-needed") return "asNeeded";

  if (pattern.type === "skip-weekdays") {
    const day = fromISO(iso).getDay();
    return pattern.weekdays.includes(day) ? "skip" : "take";
  }

  if (pattern.type === "every-n-days") {
    return phaseDayOffset % pattern.interval === pattern.takeOnRemainder ? "take" : "skip";
  }

  const fallbackSequence: CustomSequenceStep[] = ["take", "skip"];
  const sequence = pattern.sequence.length > 0 ? pattern.sequence : fallbackSequence;
  return sequence[phaseDayOffset % sequence.length];
}

function createPlanDay(type: "take" | "skip" | "asNeeded", phase: TaperPhase, config: AppConfig): PlanDay {
  if (type === "take") {
    return {
      type,
      label: [config.medicationName, config.defaultTime].filter(Boolean).join(" "),
      details: renderTemplate(phase.takeDetails, config),
      phaseTitle: phase.title,
    };
  }

  if (type === "asNeeded") {
    return {
      type,
      label: "По требованию",
      details: renderTemplate(phase.asNeededDetails ?? "{medication} только по заранее согласованному плану.", config),
      phaseTitle: phase.title,
    };
  }

  return {
    type,
    label: "Пропуск",
    details: renderTemplate(phase.skipDetails, config),
    phaseTitle: phase.title,
  };
}

function renderTemplate(template: string, config: AppConfig): string {
  return template
    .replaceAll("{medication}", config.medicationName)
    .replaceAll("{dose}", config.doseLabel)
    .replaceAll("{time}", config.defaultTime)
    .replaceAll("{support}", config.supportMedicationName)
    .replaceAll("{rescue}", config.rescueMedicationName)
    .replace(/\s+/g, " ")
    .trim();
}
