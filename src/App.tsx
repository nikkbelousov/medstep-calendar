import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  type SVGProps,
} from "react";
import { fromISO, getMonthMatrix, monthNames, toISO, weekdays } from "./lib/date";
import {
  createDefaultConfig,
  createPresetPhases,
  getPlanForDate,
  getPlannedDates,
  inferPhasePreset,
  medicationOptions,
  phasePresetOptions,
  sequenceToInputValue,
  type AppConfig,
  type AppState,
  type DayRecord,
  type PhasePresetId,
} from "./lib/plan";
import { loadState, saveState } from "./lib/storage";

type RecordPatch = Partial<DayRecord>;
type IconProps = SVGProps<SVGSVGElement>;

export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const { config, records } = state;
  const start = useMemo(() => fromISO(config.startDate), [config.startDate]);
  const [viewDate, setViewDate] = useState<Date>(start);
  const [selectedISO, setSelectedISO] = useState(config.startDate);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    setViewDate(fromISO(config.startDate));
    setSelectedISO(config.startDate);
  }, [config.startDate]);

  const days = useMemo(
    () => getMonthMatrix(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate],
  );

  const selectedPlan = getPlanForDate(selectedISO, config);
  const selectedRecord = records[selectedISO] ?? {};

  const stats = useMemo(() => {
    const plannedDates = getPlannedDates(config);
    const take = plannedDates.filter((iso) => getPlanForDate(iso, config).type === "take").length;
    const skip = plannedDates.filter((iso) => getPlanForDate(iso, config).type === "skip").length;
    const done = plannedDates.filter((iso) => records[iso]?.done).length;
    return { total: plannedDates.length, take, skip, done };
  }, [config, records]);

  function updateRecord(patch: RecordPatch): void {
    setState((previous) => ({
      ...previous,
      records: {
        ...previous.records,
        [selectedISO]: { ...previous.records[selectedISO], ...patch },
      },
    }));
  }

  function resetDay(): void {
    setState((previous) => {
      const nextRecords = { ...previous.records };
      delete nextRecords[selectedISO];
      return { ...previous, records: nextRecords };
    });
  }

  function saveConfig(nextConfig: AppConfig): void {
    setState((previous) => ({ ...previous, config: nextConfig }));
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                <CalendarDays className="h-4 w-4" />
                Старт: {fromISO(config.startDate).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">
                Taper Calendar
              </h1>
              <p className="mt-2 max-w-2xl text-slate-600">
                {config.medicationName} {config.doseLabel}
                {config.defaultTime ? `, ${config.defaultTime}` : ""}. Отмечай дни приёма,
                пропуска, симптомы и поддержку. Данные сохраняются только в этом браузере.
              </p>
            </div>

            <div className="grid min-w-full grid-cols-2 gap-2 sm:grid-cols-4 md:min-w-[460px]">
              <Stat label="Дней плана" value={stats.total} />
              <Stat label="Приём" value={stats.take} />
              <Stat label="Пропуск" value={stats.skip} />
              <Stat label="Отмечено" value={stats.done} />
            </div>
          </div>

          <div className="mt-5 flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
            <p>
              Это личный трекер заданного плана. Он не даёт медицинских советов,
              диагнозов или рекомендаций по лечению.
            </p>
          </div>
        </header>

        <main className="grid gap-5 lg:grid-cols-[1fr_380px]">
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
                const plan = getPlanForDate(iso, config);
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
                        "inline-flex max-w-full items-center gap-1 rounded-xl px-2 py-1 text-[11px] font-medium md:text-xs",
                        plan.type === "take" ? "bg-blue-50 text-blue-700" : "",
                        plan.type === "skip" ? "bg-amber-50 text-amber-700" : "",
                        plan.type === "asNeeded" ? "bg-violet-50 text-violet-700" : "",
                        plan.type === "past" ? "bg-slate-100 text-slate-500" : "",
                      ].join(" ")}
                    >
                      {plan.type === "take" ? (
                        <Pill className="h-3 w-3 shrink-0" />
                      ) : (
                        <Shield className="h-3 w-3 shrink-0" />
                      )}
                      <span className="truncate">{plan.label}</span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {record?.supportMedication ? <MiniTag>{config.supportMedicationName}</MiniTag> : null}
                      {record?.rescueMedication ? <MiniTag>{config.rescueMedicationName}</MiniTag> : null}
                      {record?.heartburn ? <MiniTag>{config.symptomLabels.heartburn}</MiniTag> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="space-y-5">
            <DayDetails
              selectedISO={selectedISO}
              selectedPlan={selectedPlan}
              selectedRecord={selectedRecord}
              config={config}
              onReset={resetDay}
              onUpdate={updateRecord}
            />

            <SettingsPanel config={config} onSave={saveConfig} />

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 font-semibold">
                <Moon className="h-5 w-5" /> Памятка
              </h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>• Памятка отображает только заданный пользователем план.</p>
                <p>• Изменения препаратов, доз и схем нужно согласовывать с врачом.</p>
                <p>• Данные сохраняются локально в этом браузере.</p>
              </div>
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
}

function DayDetails({
  selectedISO,
  selectedPlan,
  selectedRecord,
  config,
  onReset,
  onUpdate,
}: {
  selectedISO: string;
  selectedPlan: ReturnType<typeof getPlanForDate>;
  selectedRecord: DayRecord;
  config: AppConfig;
  onReset: () => void;
  onUpdate: (patch: RecordPatch) => void;
}) {
  return (
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
          onClick={onReset}
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
        <p className="mt-1 text-xs font-medium text-slate-500">{selectedPlan.phaseTitle}</p>
        <p className="mt-2 text-sm text-slate-600">{selectedPlan.details}</p>
        <p className="mt-3 text-xs text-slate-500">
          Это отображение заданного плана, не медицинская рекомендация.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        <Toggle
          checked={!!selectedRecord.done}
          onChange={(value) => onUpdate({ done: value })}
          label="День выполнен"
        />
        <Toggle
          checked={!!selectedRecord.supportMedication}
          onChange={(value) => onUpdate({ supportMedication: value })}
          label={`Пил ${config.supportMedicationName}`}
        />
        <Toggle
          checked={!!selectedRecord.rescueMedication}
          onChange={(value) => onUpdate({ rescueMedication: value })}
          label={`Пил ${config.rescueMedicationName}`}
        />
        <Toggle
          checked={!!selectedRecord.heartburn}
          onChange={(value) => onUpdate({ heartburn: value })}
          label={`Была ${config.symptomLabels.heartburn}`}
        />
        <Toggle
          checked={!!selectedRecord.painOrBloating}
          onChange={(value) => onUpdate({ painOrBloating: value })}
          label={`Была ${config.symptomLabels.painOrBloating}`}
        />
      </div>

      <label className="mt-5 block">
        <span className="text-sm font-medium text-slate-700">Заметка</span>
        <textarea
          value={selectedRecord.note ?? ""}
          onChange={(event) => onUpdate({ note: event.target.value })}
          placeholder="Например: симптомы после ужина, что помогло, что обсудить с врачом"
          className="mt-2 min-h-[100px] w-full resize-none rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:ring-2 focus:ring-slate-900"
        />
      </label>
    </section>
  );
}

function SettingsPanel({ config, onSave }: { config: AppConfig; onSave: (config: AppConfig) => void }) {
  const [draft, setDraft] = useState<AppConfig>(config);
  const [selectedPreset, setSelectedPreset] = useState<PhasePresetId>("omez");
  const [customSequence, setCustomSequence] = useState("take,skip");

  useEffect(() => {
    setDraft(config);
    const firstPattern = config.phases[0]?.pattern;
    setSelectedPreset(inferPhasePreset(config.phases));
    if (firstPattern?.type === "custom-sequence") {
      setCustomSequence(sequenceToInputValue(firstPattern.sequence));
    }
  }, [config]);

  const medicationSelectValue = medicationOptions.includes(draft.medicationName)
    ? draft.medicationName
    : "Другое";

  function updateDraft(patch: Partial<AppConfig>): void {
    setDraft((previous) => ({ ...previous, ...patch }));
  }

  function updateSymptomLabel(key: keyof AppConfig["symptomLabels"], value: string): void {
    setDraft((previous) => ({
      ...previous,
      symptomLabels: { ...previous.symptomLabels, [key]: value },
    }));
  }

  function handlePresetChange(event: ChangeEvent<HTMLSelectElement>): void {
    const preset = event.target.value as PhasePresetId;
    setSelectedPreset(preset);
    setDraft((previous) => ({
      ...previous,
      phases: createPresetPhases(preset, customSequence),
    }));
  }

  function handleCustomSequenceChange(event: ChangeEvent<HTMLInputElement>): void {
    const value = event.target.value;
    setCustomSequence(value);
    if (selectedPreset === "custom") {
      setDraft((previous) => ({
        ...previous,
        phases: createPresetPhases("custom", value),
      }));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSave(normalizeConfig(draft));
  }

  function resetToDefault(): void {
    const nextConfig = createDefaultConfig();
    setSelectedPreset("omez");
    setCustomSequence("take,skip");
    setDraft(nextConfig);
    onSave(nextConfig);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold">Настройки плана</h3>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <Field label="Дата старта">
          <input
            type="date"
            value={draft.startDate}
            onChange={(event) => updateDraft({ startDate: event.target.value })}
            className="form-input"
          />
        </Field>

        <Field label="Препарат">
          <select
            value={medicationSelectValue}
            onChange={(event) => {
              const value = event.target.value;
              updateDraft({ medicationName: value === "Другое" ? "" : value });
            }}
            className="form-input"
          >
            {medicationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        {medicationSelectValue === "Другое" ? (
          <Field label="Своё название">
            <input
              type="text"
              value={draft.medicationName}
              onChange={(event) => updateDraft({ medicationName: event.target.value })}
              className="form-input"
              placeholder="Например: мой препарат"
            />
          </Field>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Доза">
            <input
              type="text"
              value={draft.doseLabel}
              onChange={(event) => updateDraft({ doseLabel: event.target.value })}
              className="form-input"
              placeholder="20 мг"
            />
          </Field>
          <Field label="Время">
            <input
              type="text"
              value={draft.defaultTime}
              onChange={(event) => updateDraft({ defaultTime: event.target.value })}
              className="form-input"
              placeholder="10:00"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Поддержка">
            <input
              type="text"
              value={draft.supportMedicationName}
              onChange={(event) => updateDraft({ supportMedicationName: event.target.value })}
              className="form-input"
            />
          </Field>
          <Field label="Резерв">
            <input
              type="text"
              value={draft.rescueMedicationName}
              onChange={(event) => updateDraft({ rescueMedicationName: event.target.value })}
              className="form-input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Симптом 1">
            <input
              type="text"
              value={draft.symptomLabels.heartburn}
              onChange={(event) => updateSymptomLabel("heartburn", event.target.value)}
              className="form-input"
            />
          </Field>
          <Field label="Симптом 2">
            <input
              type="text"
              value={draft.symptomLabels.painOrBloating}
              onChange={(event) => updateSymptomLabel("painOrBloating", event.target.value)}
              className="form-input"
            />
          </Field>
        </div>

        <Field label="Схема">
          <select value={selectedPreset} onChange={handlePresetChange} className="form-input">
            {phasePresetOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        {selectedPreset === "custom" ? (
          <Field label="Custom pattern">
            <input
              type="text"
              value={customSequence}
              onChange={handleCustomSequenceChange}
              className="form-input"
              placeholder="take,skip,take,skip"
            />
          </Field>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Сохранить
          </button>
          <button
            type="button"
            onClick={resetToDefault}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Сбросить к Омез-прототипу
          </button>
        </div>
      </form>
    </section>
  );
}

function normalizeConfig(config: AppConfig): AppConfig {
  return {
    ...config,
    medicationName: config.medicationName.trim() || "Препарат",
    doseLabel: config.doseLabel.trim(),
    defaultTime: config.defaultTime.trim(),
    supportMedicationName: config.supportMedicationName.trim() || "Поддержка",
    rescueMedicationName: config.rescueMedicationName.trim() || "Резерв",
    symptomLabels: {
      heartburn: config.symptomLabels.heartburn.trim() || "симптом",
      painOrBloating: config.symptomLabels.painOrBloating.trim() || "симптом",
    },
  };
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
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
