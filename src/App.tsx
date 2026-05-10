import { useEffect, useMemo, useState, type ReactNode, type SVGProps } from "react";

const START_DATE = "2026-05-10";
const STORAGE_KEY = "omez-taper-calendar-v1";

type ISODate = string;
type PlanDayType = "take" | "skip" | "asNeeded" | "past";

interface PlanDay {
  type: PlanDayType;
  label: string;
  details: string;
}

interface DayRecord {
  done?: boolean;
  gaviscon?: boolean;
  rennie?: boolean;
  heartburn?: boolean;
  pain?: boolean;
  note?: string;
}

type Records = Record<ISODate, DayRecord>;
type RecordPatch = Partial<DayRecord>;
type IconProps = SVGProps<SVGSVGElement>;

const monthNames = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function toISO(date: Date): ISODate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromISO(iso: ISODate): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function dayDiff(a: ISODate, b: ISODate): number {
  const ms = 24 * 60 * 60 * 1000;
  return Math.round((fromISO(a).getTime() - fromISO(b).getTime()) / ms);
}

function getPlanForDate(iso: ISODate): PlanDay {
  const diff = dayDiff(iso, START_DATE);
  if (diff < 0) {
    return { type: "past", label: "До старта", details: "План ещё не начат" };
  }

  const week = Math.floor(diff / 7) + 1;
  const date = fromISO(iso);
  const day = date.getDay();

  if (week <= 2) {
    if (day === 0) {
      return {
        type: "skip",
        label: "Пропуск",
        details: "Без Омеза. Гевискон после ужина и на ночь при симптомах.",
      };
    }

    return {
      type: "take",
      label: "Омез 10:00",
      details: "Омез 20 мг утром за 30 минут до еды.",
    };
  }

  if (week <= 4) {
    if (day === 0 || day === 3) {
      return {
        type: "skip",
        label: "Пропуск",
        details: "Без Омеза. Гевискон/Ренни по необходимости.",
      };
    }

    return {
      type: "take",
      label: "Омез 10:00",
      details: "Омез 20 мг утром за 30 минут до еды.",
    };
  }

  if (week <= 6) {
    if (diff % 2 === 0) {
      return {
        type: "skip",
        label: "Пропуск",
        details: "День без Омеза. Поддержка Гевисконом при изжоге.",
      };
    }

    return {
      type: "take",
      label: "Омез 10:00",
      details: "Омез 20 мг утром за 30 минут до еды.",
    };
  }

  if (week <= 8) {
    if (diff % 3 === 1) {
      return {
        type: "take",
        label: "Омез 10:00",
        details: "Омез 20 мг, если идёшь по плану 1 раз в 3 дня.",
      };
    }

    return {
      type: "skip",
      label: "Пропуск",
      details: "Без Омеза. Гевискон/Ренни по необходимости.",
    };
  }

  return {
    type: "asNeeded",
    label: "По требованию",
    details: "Омез только если симптомы возвращаются устойчиво. Лучше обсудить с врачом.",
  };
}

function getMonthMatrix(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = addDays(first, -startOffset);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function loadRecords(): Records {
  try {
    if (typeof window === "undefined") return {};

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};

    const parsed: unknown = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    return parsed as Records;
  } catch {
    return {};
  }
}

function saveRecords(records: Records): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // localStorage can be unavailable in private or restricted browser contexts.
  }
}

export default function App() {
  const start = useMemo(() => fromISO(START_DATE), []);
  const [viewDate, setViewDate] = useState<Date>(start);
  const [selectedISO, setSelectedISO] = useState<ISODate>(START_DATE);
  const [records, setRecords] = useState<Records>(loadRecords);

  useEffect(() => {
    saveRecords(records);
  }, [records]);

  const days = useMemo(
    () => getMonthMatrix(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate],
  );

  const selectedPlan = getPlanForDate(selectedISO);
  const selectedRecord = records[selectedISO] ?? {};

  const stats = useMemo(() => {
    const first56 = Array.from({ length: 56 }, (_, index) => toISO(addDays(start, index)));
    const takeDays = first56.filter((iso) => getPlanForDate(iso).type === "take");
    const skipDays = first56.filter((iso) => getPlanForDate(iso).type === "skip");
    const done = first56.filter((iso) => records[iso]?.done).length;

    return { total: first56.length, take: takeDays.length, skip: skipDays.length, done };
  }, [records, start]);

  function updateRecord(patch: RecordPatch): void {
    setRecords((previous) => ({
      ...previous,
      [selectedISO]: { ...previous[selectedISO], ...patch },
    }));
  }

  function resetDay(): void {
    setRecords((previous) => {
      const copy = { ...previous };
      delete copy[selectedISO];
      return copy;
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                <CalendarDays className="h-4 w-4" />
                Старт: воскресенье, 10 мая 2026
              </div>
              <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">
                Календарь мягкого снижения Омеза
              </h1>
              <p className="mt-2 max-w-2xl text-slate-600">
                Отмечай дни приёма, дни пропуска, изжогу и использование Гевискона/Ренни.
                Данные сохраняются только в этом браузере.
              </p>
            </div>

            <div className="grid min-w-full grid-cols-3 gap-2 md:min-w-[360px]">
              <Stat label="Дней плана" value={stats.total} />
              <Stat label="Приём" value={stats.take} />
              <Stat label="Пропуск" value={stats.skip} />
            </div>
          </div>
        </header>

        <main className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <button
                type="button"
                onClick={() =>
                  setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
                }
                className="rounded-xl p-2 transition hover:bg-slate-100"
                aria-label="Предыдущий месяц"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <h2 className="text-lg font-semibold">
                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
              </h2>

              <button
                type="button"
                onClick={() =>
                  setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
                }
                className="rounded-xl p-2 transition hover:bg-slate-100"
                aria-label="Следующий месяц"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
              {weekdays.map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-slate-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {days.map((date) => {
                const iso = toISO(date);
                const plan = getPlanForDate(iso);
                const record = records[iso];
                const isCurrentMonth = date.getMonth() === viewDate.getMonth();
                const isSelected = iso === selectedISO;

                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => setSelectedISO(iso)}
                    className={[
                      "relative min-h-[92px] border-b border-r border-slate-100 p-2 text-left transition md:min-h-[112px]",
                      isCurrentMonth ? "bg-white hover:bg-slate-50" : "bg-slate-50/60 text-slate-400",
                      isSelected ? "z-10 ring-2 ring-inset ring-slate-900" : "",
                    ].join(" ")}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold">{date.getDate()}</span>
                      {record?.done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : null}
                    </div>

                    <div
                      className={[
                        "inline-flex items-center gap-1 rounded-xl px-2 py-1 text-[11px] font-medium md:text-xs",
                        plan.type === "take" ? "bg-blue-50 text-blue-700" : "",
                        plan.type === "skip" ? "bg-amber-50 text-amber-700" : "",
                        plan.type === "asNeeded" ? "bg-violet-50 text-violet-700" : "",
                        plan.type === "past" ? "bg-slate-100 text-slate-500" : "",
                      ].join(" ")}
                    >
                      {plan.type === "take" ? (
                        <Pill className="h-3 w-3" />
                      ) : (
                        <Shield className="h-3 w-3" />
                      )}
                      {plan.label}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {record?.gaviscon ? <MiniTag>Гевискон</MiniTag> : null}
                      {record?.rennie ? <MiniTag>Ренни</MiniTag> : null}
                      {record?.heartburn ? <MiniTag>изжога</MiniTag> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">Выбранный день</p>
                  <h2 className="mt-1 text-xl font-semibold">
                    {fromISO(selectedISO).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      weekday: "long",
                    })}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={resetDay}
                  className="rounded-xl p-2 transition hover:bg-slate-100"
                  title="Очистить отметки дня"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              <div
                className={[
                  "mt-4 rounded-2xl border p-4",
                  selectedPlan.type === "take" ? "border-blue-100 bg-blue-50" : "",
                  selectedPlan.type === "skip" ? "border-amber-100 bg-amber-50" : "",
                  selectedPlan.type === "asNeeded" ? "border-violet-100 bg-violet-50" : "",
                  selectedPlan.type === "past" ? "border-slate-100 bg-slate-50" : "",
                ].join(" ")}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {selectedPlan.type === "take" ? (
                    <Pill className="h-5 w-5" />
                  ) : (
                    <Shield className="h-5 w-5" />
                  )}
                  {selectedPlan.label}
                </div>
                <p className="mt-2 text-sm text-slate-600">{selectedPlan.details}</p>
              </div>

              <div className="mt-5 space-y-3">
                <Toggle
                  checked={!!selectedRecord.done}
                  onChange={(value) => updateRecord({ done: value })}
                  label="День выполнен"
                />
                <Toggle
                  checked={!!selectedRecord.gaviscon}
                  onChange={(value) => updateRecord({ gaviscon: value })}
                  label="Пил Гевискон"
                />
                <Toggle
                  checked={!!selectedRecord.rennie}
                  onChange={(value) => updateRecord({ rennie: value })}
                  label="Пил Ренни"
                />
                <Toggle
                  checked={!!selectedRecord.heartburn}
                  onChange={(value) => updateRecord({ heartburn: value })}
                  label="Была изжога"
                />
                <Toggle
                  checked={!!selectedRecord.pain}
                  onChange={(value) => updateRecord({ pain: value })}
                  label="Была боль/вздутие"
                />
              </div>

              <label className="mt-5 block">
                <span className="text-sm font-medium text-slate-700">Заметка</span>
                <textarea
                  value={selectedRecord.note ?? ""}
                  onChange={(event) => updateRecord({ note: event.target.value })}
                  placeholder="Например: изжога после ужина, легче после ходьбы 20 минут"
                  className="mt-2 min-h-[100px] w-full resize-none rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                />
              </label>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 font-semibold">
                <Moon className="h-5 w-5" /> Памятка на дни пропуска
              </h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>• Гевискон после еды и на ночь — как основная страховка.</p>
                <p>• Ренни — если нужно быстро погасить жжение.</p>
                <p>• Не ложиться сразу после еды, лучше 15–20 минут походить.</p>
                <p>• Золофт разносить с Гевисконом/Ренни минимум на 2 часа.</p>
              </div>
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{label}</div>
    </div>
  );
}

function MiniTag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
      {children}
    </span>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:bg-slate-50"
    >
      <span className="text-sm font-medium">{label}</span>
      {checked ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      ) : (
        <Circle className="h-5 w-5 text-slate-300" />
      )}
    </button>
  );
}

function IconBase({
  className = "",
  children,
  viewBox = "0 0 24 24",
  ...props
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

function CalendarDays(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </IconBase>
  );
}

function CheckCircle2(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-5" />
    </IconBase>
  );
}

function Circle(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="10" />
    </IconBase>
  );
}

function Moon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
    </IconBase>
  );
}

function Pill(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m10.5 20.5 10-10a5 5 0 0 0-7-7l-10 10a5 5 0 0 0 7 7Z" />
      <path d="m8.5 8.5 7 7" />
    </IconBase>
  );
}

function Shield(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </IconBase>
  );
}

function ChevronLeft(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m15 18-6-6 6-6" />
    </IconBase>
  );
}

function ChevronRight(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m9 18 6-6-6-6" />
    </IconBase>
  );
}

function RotateCcw(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 3v6h6" />
    </IconBase>
  );
}
