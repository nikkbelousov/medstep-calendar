import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  type SVGProps,
} from "react";
import { fromISO, getMonthMatrix, toISO } from "./lib/date";
import {
  localeDateCodes,
  localeOptions,
  localizedMonthNames,
  localizedWeekdays,
  t,
  type Locale,
  type TranslationKey,
} from "./lib/i18n";
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
  type CustomSequenceStep,
  type DayRecord,
  type PhasePresetId,
} from "./lib/plan";
import { createDefaultState, loadState, saveState } from "./lib/storage";

type RecordPatch = Partial<DayRecord>;
type IconProps = SVGProps<SVGSVGElement>;

export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const { config, records } = state;
  const start = useMemo(() => fromISO(config.startDate), [config.startDate]);
  const [viewDate, setViewDate] = useState<Date>(start);
  const [selectedISO, setSelectedISO] = useState(config.startDate);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const locale = config.locale;

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

  function updateLocale(nextLocale: Locale): void {
    setState((previous) => ({
      ...previous,
      config: { ...previous.config, locale: nextLocale },
    }));
  }

  function resetAllData(): void {
    const nextState = createDefaultState();
    setState(nextState);
    setViewDate(fromISO(nextState.config.startDate));
    setSelectedISO(nextState.config.startDate);
    setIsSettingsOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 text-slate-900 sm:p-5 md:p-8">
      <div className="mx-auto max-w-6xl space-y-4 md:space-y-5">
        <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 sm:text-sm">
                <CalendarDays className="h-4 w-4" />
                <span className="truncate">
                  {t(locale, "appStart")}: {fromISO(config.startDate).toLocaleDateString(localeDateCodes[locale], {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">
                Taper Calendar
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                {config.medicationName} {config.doseLabel}
                {config.defaultTime ? `, ${config.defaultTime}` : ""}. {t(locale, "appSummaryPrefix")}
              </p>
            </div>

            <div className="min-w-full space-y-3 lg:min-w-[460px]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:justify-end">
                <LocaleSwitcher locale={locale} onChange={updateLocale} />
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 sm:w-auto"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {t(locale, "configure")}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Stat label={t(locale, "statTotal")} value={stats.total} />
                <Stat label={t(locale, "statTake")} value={stats.take} />
                <Stat label={t(locale, "statSkip")} value={stats.skip} />
                <Stat label={t(locale, "statDone")} value={stats.done} />
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600 sm:p-4">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
            <p>{t(locale, "disclaimer")}</p>
          </div>
        </header>

        <main className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-5">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 p-2 sm:p-4">
              <button
                type="button"
                onClick={() =>
                  setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
                }
                className="rounded-xl p-2 transition hover:bg-slate-100"
                aria-label={t(locale, "previousMonth")}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <h2 className="text-base font-semibold sm:text-lg">
                {localizedMonthNames[locale][viewDate.getMonth()]} {viewDate.getFullYear()}
              </h2>

              <button
                type="button"
                onClick={() =>
                  setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
                }
                className="rounded-xl p-2 transition hover:bg-slate-100"
                aria-label={t(locale, "nextMonth")}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
              {localizedWeekdays[locale].map((day) => (
                <div key={day} className="min-w-0 p-1.5 text-center text-[11px] font-medium text-slate-500 sm:p-3 sm:text-sm">
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
                      "relative min-h-[62px] min-w-0 overflow-hidden border-b border-r border-slate-100 p-1 text-left transition sm:min-h-[92px] sm:p-2 md:min-h-[112px]",
                      isCurrentMonth ? "bg-white hover:bg-slate-50" : "bg-slate-50/60 text-slate-400",
                      isSelected ? "z-10 ring-2 ring-inset ring-slate-900" : "",
                    ].join(" ")}
                  >
                    <div className="mb-1 flex min-h-5 items-center justify-between sm:mb-2">
                      <span className="text-sm font-semibold">{date.getDate()}</span>
                      {record?.done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : null}
                    </div>

                    <div
                      className={[
                        "inline-flex max-w-full items-center gap-1 rounded-full px-1.5 py-1 text-[10px] font-medium sm:rounded-xl sm:px-2 sm:text-[11px] md:text-xs",
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
                      <span className="hidden truncate sm:inline">{plan.label}</span>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-1 sm:mt-2">
                      {record?.supportMedication ? <MiniTag>{config.supportMedicationName}</MiniTag> : null}
                      {record?.rescueMedication ? <MiniTag>{config.rescueMedicationName}</MiniTag> : null}
                      {record?.heartburn ? <MiniTag>{config.symptomLabels.heartburn}</MiniTag> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="space-y-4 lg:space-y-5">
            <DayDetails
              selectedISO={selectedISO}
              selectedPlan={selectedPlan}
              selectedRecord={selectedRecord}
              config={config}
              locale={locale}
              onReset={resetDay}
              onUpdate={updateRecord}
            />

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h3 className="flex items-center gap-2 font-semibold">
                <Moon className="h-5 w-5" /> {t(locale, "reminder")}
              </h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>• {t(locale, "reminderPlan")}</p>
                <p>• {t(locale, "reminderDoctor")}</p>
                <p>• {t(locale, "reminderLocal")}</p>
              </div>
            </section>
          </aside>
        </main>

        {isSettingsOpen ? (
          <SettingsModal
            config={config}
            onClose={() => setIsSettingsOpen(false)}
            onResetAll={resetAllData}
            onSave={saveConfig}
          />
        ) : null}
      </div>
    </div>
  );
}

function DayDetails({
  selectedISO,
  selectedPlan,
  selectedRecord,
  config,
  locale,
  onReset,
  onUpdate,
}: {
  selectedISO: string;
  selectedPlan: ReturnType<typeof getPlanForDate>;
  selectedRecord: DayRecord;
  config: AppConfig;
  locale: Locale;
  onReset: () => void;
  onUpdate: (patch: RecordPatch) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{t(locale, "selectedDay")}</p>
          <h2 className="mt-1 text-lg font-semibold sm:text-xl">
            {fromISO(selectedISO).toLocaleDateString(localeDateCodes[locale], {
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
          title={t(locale, "clearDay")}
          aria-label={t(locale, "clearDay")}
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div
        className={[
          "mt-4 rounded-2xl border p-3 sm:p-4",
          selectedPlan.type === "take" ? "border-blue-100 bg-blue-50" : "",
          selectedPlan.type === "skip" ? "border-amber-100 bg-amber-50" : "",
          selectedPlan.type === "asNeeded" ? "border-violet-100 bg-violet-50" : "",
          selectedPlan.type === "past" ? "border-slate-100 bg-slate-50" : "",
        ].join(" ")}
      >
        <div className="flex min-w-0 items-center gap-2 font-semibold">
          {selectedPlan.type === "take" ? (
            <Pill className="h-5 w-5 shrink-0" />
          ) : (
            <Shield className="h-5 w-5 shrink-0" />
          )}
          <span className="min-w-0 break-words">{selectedPlan.label}</span>
        </div>
        <p className="mt-1 text-xs font-medium text-slate-500">{selectedPlan.phaseTitle}</p>
        <p className="mt-2 text-sm text-slate-600">{selectedPlan.details}</p>
        <p className="mt-3 text-xs text-slate-500">
          {t(locale, "notMedicalRecommendation")}
        </p>
      </div>

      <div className="mt-5 space-y-3">
        <Toggle
          checked={!!selectedRecord.done}
          onChange={(value) => onUpdate({ done: value })}
          label={t(locale, "dayDone")}
        />
        <Toggle
          checked={!!selectedRecord.supportMedication}
          onChange={(value) => onUpdate({ supportMedication: value })}
          label={t(locale, "usedSupport", { name: config.supportMedicationName })}
        />
        <Toggle
          checked={!!selectedRecord.rescueMedication}
          onChange={(value) => onUpdate({ rescueMedication: value })}
          label={t(locale, "usedRescue", { name: config.rescueMedicationName })}
        />
        <Toggle
          checked={!!selectedRecord.heartburn}
          onChange={(value) => onUpdate({ heartburn: value })}
          label={t(locale, "hadSymptom", { name: config.symptomLabels.heartburn })}
        />
        <Toggle
          checked={!!selectedRecord.painOrBloating}
          onChange={(value) => onUpdate({ painOrBloating: value })}
          label={t(locale, "hadSymptom", { name: config.symptomLabels.painOrBloating })}
        />
      </div>

      <label className="mt-5 block">
        <span className="text-sm font-medium text-slate-700">{t(locale, "note")}</span>
        <textarea
          value={selectedRecord.note ?? ""}
          onChange={(event) => onUpdate({ note: event.target.value })}
          placeholder={t(locale, "notePlaceholder")}
          className="mt-2 min-h-[108px] w-full resize-none rounded-2xl border border-slate-200 p-3 text-base outline-none focus:ring-2 focus:ring-slate-900 sm:text-sm"
        />
      </label>
    </section>
  );
}

function SettingsModal({
  config,
  onClose,
  onResetAll,
  onSave,
}: {
  config: AppConfig;
  onClose: () => void;
  onResetAll: () => void;
  onSave: (config: AppConfig) => void;
}) {
  const [draft, setDraft] = useState<AppConfig>(config);
  const [selectedPreset, setSelectedPreset] = useState<PhasePresetId>("omez");
  const [customSequence, setCustomSequence] = useState<CustomSequenceStep[]>(["take", "skip"]);
  const [isConfirmingFullReset, setIsConfirmingFullReset] = useState(false);
  const locale = draft.locale;

  useEffect(() => {
    setDraft(config);
    const firstPattern = config.phases[0]?.pattern;
    setSelectedPreset(inferPhasePreset(config.phases));
    if (firstPattern?.type === "custom-sequence") {
      setCustomSequence(firstPattern.sequence.length > 0 ? firstPattern.sequence : ["take", "skip"]);
    }
  }, [config]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
      phases: createPresetPhases(preset, sequenceToInputValue(customSequence)),
    }));
  }

  function updateCustomSequence(nextSequence: CustomSequenceStep[]): void {
    const safeSequence: CustomSequenceStep[] = nextSequence.length > 0 ? nextSequence : ["take"];
    setCustomSequence(safeSequence);
    if (selectedPreset === "custom") {
      setDraft((previous) => ({
        ...previous,
        phases: createPresetPhases("custom", sequenceToInputValue(safeSequence)),
      }));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSave(normalizeConfig(draft));
    onClose();
  }

  function resetToDefault(): void {
    const nextConfig = { ...createDefaultConfig(), locale: draft.locale };
    setSelectedPreset("omez");
    setCustomSequence(["take", "skip"]);
    setDraft(nextConfig);
    onSave(nextConfig);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-slate-900/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="max-h-[96dvh] w-full overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-xl sm:mx-auto sm:max-h-[92vh] sm:max-w-3xl sm:rounded-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 id="settings-title" className="text-lg font-semibold">
              {t(locale, "settingsTitle")}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {t(locale, "settingsDescription")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 transition hover:bg-slate-100"
            aria-label={t(locale, "closeSettings")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <Field label={t(locale, "language")}>
            <LocaleSwitcher
              locale={draft.locale}
              onChange={(nextLocale) => updateDraft({ locale: nextLocale })}
            />
          </Field>

          <Field label={t(locale, "startDate")}>
            <input
              type="date"
              value={draft.startDate}
              onChange={(event) => updateDraft({ startDate: event.target.value })}
              className="form-input"
            />
          </Field>

          <Field label={t(locale, "medication")}>
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
                  {option === "Другое" ? t(locale, "other") : option}
                </option>
              ))}
            </select>
          </Field>

          {medicationSelectValue === "Другое" ? (
            <Field label={t(locale, "customName")}>
              <input
                type="text"
                value={draft.medicationName}
                onChange={(event) => updateDraft({ medicationName: event.target.value })}
                className="form-input"
                placeholder={t(locale, "customNamePlaceholder")}
              />
            </Field>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t(locale, "dose")}>
              <input
                type="text"
                value={draft.doseLabel}
                onChange={(event) => updateDraft({ doseLabel: event.target.value })}
                className="form-input"
                placeholder="20 мг"
              />
            </Field>
            <Field label={t(locale, "time")}>
              <input
                type="text"
                value={draft.defaultTime}
                onChange={(event) => updateDraft({ defaultTime: event.target.value })}
                className="form-input"
                placeholder="10:00"
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t(locale, "support")}>
              <input
                type="text"
                value={draft.supportMedicationName}
                onChange={(event) => updateDraft({ supportMedicationName: event.target.value })}
                className="form-input"
              />
            </Field>
            <Field label={t(locale, "rescue")}>
              <input
                type="text"
                value={draft.rescueMedicationName}
                onChange={(event) => updateDraft({ rescueMedicationName: event.target.value })}
                className="form-input"
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t(locale, "symptomOne")}>
              <input
                type="text"
                value={draft.symptomLabels.heartburn}
                onChange={(event) => updateSymptomLabel("heartburn", event.target.value)}
                className="form-input"
              />
            </Field>
            <Field label={t(locale, "symptomTwo")}>
              <input
                type="text"
                value={draft.symptomLabels.painOrBloating}
                onChange={(event) => updateSymptomLabel("painOrBloating", event.target.value)}
                className="form-input"
              />
            </Field>
          </div>

          <Field label={t(locale, "schedule")}>
            <select value={selectedPreset} onChange={handlePresetChange} className="form-input">
              {phasePresetOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {phasePresetLabel(option.value, locale)}
                </option>
              ))}
            </select>
          </Field>

          {selectedPreset === "custom" ? (
            <CustomSequenceEditor
              locale={locale}
              sequence={customSequence}
              onChange={updateCustomSequence}
            />
          ) : null}

          <div className="rounded-2xl border border-red-100 bg-red-50 p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h4 className="text-sm font-semibold text-red-900">{t(locale, "fullResetTitle")}</h4>
                <p className="mt-1 text-sm text-red-700">
                  {t(locale, "fullResetDescription")}
                </p>
              </div>
              {!isConfirmingFullReset ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmingFullReset(true)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  {t(locale, "clearAll")}
                </button>
              ) : (
                <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
                  <button
                    type="button"
                    onClick={onResetAll}
                    className="min-h-11 rounded-xl bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800"
                  >
                    {t(locale, "confirm")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingFullReset(false)}
                    className="min-h-11 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                  >
                    {t(locale, "cancel")}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-4">
            <button
              type="submit"
              className="min-h-11 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              {t(locale, "save")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {t(locale, "cancel")}
            </button>
            <button
              type="button"
              onClick={resetToDefault}
              className="min-h-11 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {t(locale, "resetPlanSettings")}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function CustomSequenceEditor({
  locale,
  sequence,
  onChange,
}: {
  locale: Locale;
  sequence: CustomSequenceStep[];
  onChange: (sequence: CustomSequenceStep[]) => void;
}) {
  function updateStep(index: number, value: CustomSequenceStep): void {
    onChange(sequence.map((step, stepIndex) => (stepIndex === index ? value : step)));
  }

  function removeStep(index: number): void {
    onChange(sequence.filter((_, stepIndex) => stepIndex !== index));
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-slate-800">{t(locale, "customSequenceTitle")}</h4>
          <p className="mt-1 text-sm text-slate-500">
            {t(locale, "customSequenceDescription")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...sequence, "skip"])}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          <Plus className="h-4 w-4" />
          {t(locale, "addDay")}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {sequence.map((step, index) => (
          <div key={`${step}-${index}`} className="flex flex-col gap-2 rounded-xl bg-white p-2.5 sm:flex-row sm:items-center sm:p-3">
            <span className="w-16 shrink-0 text-sm font-medium text-slate-500">
              {t(locale, "dayNumber", { number: index + 1 })}
            </span>
            <div className="grid flex-1 grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
              {(["take", "skip", "asNeeded"] satisfies CustomSequenceStep[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateStep(index, option)}
                  className={[
                    "min-h-10 rounded-lg px-2 py-1.5 text-xs font-medium transition",
                    step === option ? stepActiveClass(option) : "text-slate-600 hover:bg-white",
                  ].join(" ")}
                >
                  {stepLabel(option, locale)}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => removeStep(index)}
              disabled={sequence.length <= 1}
              className="min-h-10 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={t(locale, "removeDay", { number: index + 1 })}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl bg-white px-3 py-2 text-sm leading-6 text-slate-600">
        {t(locale, "repeat")}: {sequence.map((step) => stepLabel(step, locale)).join(" → ")}.{" "}
        {t(locale, "cycle")}: {t(locale, "daysUnit", { count: sequence.length })}.
      </div>
    </div>
  );
}

function normalizeConfig(config: AppConfig): AppConfig {
  const locale = config.locale;
  return {
    ...config,
    medicationName: config.medicationName.trim() || t(locale, "defaultMedication"),
    doseLabel: config.doseLabel.trim(),
    defaultTime: config.defaultTime.trim(),
    supportMedicationName: config.supportMedicationName.trim() || t(locale, "defaultSupport"),
    rescueMedicationName: config.rescueMedicationName.trim() || t(locale, "defaultRescue"),
    symptomLabels: {
      heartburn: config.symptomLabels.heartburn.trim() || t(locale, "defaultSymptom"),
      painOrBloating: config.symptomLabels.painOrBloating.trim() || t(locale, "defaultSymptom"),
    },
  };
}

function stepLabel(step: CustomSequenceStep, locale: Locale): string {
  if (step === "take") return t(locale, "actionTake");
  if (step === "skip") return t(locale, "actionSkip");
  return t(locale, "actionAsNeeded");
}

function stepActiveClass(step: CustomSequenceStep): string {
  if (step === "take") return "bg-blue-600 text-white";
  if (step === "skip") return "bg-amber-500 text-white";
  return "bg-violet-600 text-white";
}

function phasePresetLabel(preset: PhasePresetId, locale: Locale): string {
  const keys: Record<PhasePresetId, TranslationKey> = {
    omez: "presetBase",
    "six-one": "presetSixOne",
    "five-two": "presetFiveTwo",
    "every-other-day": "presetEveryOtherDay",
    "every-third-day": "presetEveryThirdDay",
    "as-needed": "presetAsNeeded",
    custom: "presetCustom",
  };

  return t(locale, keys[preset]);
}

function LocaleSwitcher({
  locale,
  onChange,
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1" aria-label={t(locale, "language")}>
      {localeOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={[
            "min-h-9 rounded-lg px-3 text-xs font-semibold transition",
            locale === option.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:bg-white/70",
          ].join(" ")}
          aria-pressed={locale === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
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
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-2.5 sm:p-3">
      <div className="text-xl font-semibold">{value}</div>
      <div className="mt-1 truncate text-xs text-slate-500">{label}</div>
    </div>
  );
}

function MiniTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-slate-400 text-[0px] text-transparent sm:h-auto sm:w-auto sm:bg-slate-100 sm:px-2 sm:py-0.5 sm:text-[10px] sm:text-slate-600">
      <span className="hidden sm:inline">{children}</span>
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
      className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:bg-slate-50"
    >
      <span className="min-w-0 break-words text-sm font-medium">{label}</span>
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

function SlidersHorizontal(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3" />
      <path d="M14 2v4M8 10v4M16 18v4" />
    </IconBase>
  );
}

function X(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </IconBase>
  );
}

function Trash2(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
    </IconBase>
  );
}

function Plus(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14M5 12h14" />
    </IconBase>
  );
}
