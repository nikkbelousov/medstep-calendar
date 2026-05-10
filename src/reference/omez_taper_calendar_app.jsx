import React, { useMemo, useState, useEffect } from "react";

function IconBase({ className = "", children, viewBox = "0 0 24 24" }) {
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
    >
      {children}
    </svg>
  );
}

function CalendarDays(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </IconBase>
  );
}

function CheckCircle2(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-5" />
    </IconBase>
  );
}

function Circle(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="10" />
    </IconBase>
  );
}

function Moon(props) {
  return (
    <IconBase {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
    </IconBase>
  );
}

function Pill(props) {
  return (
    <IconBase {...props}>
      <path d="m10.5 20.5 10-10a5 5 0 0 0-7-7l-10 10a5 5 0 0 0 7 7Z" />
      <path d="m8.5 8.5 7 7" />
    </IconBase>
  );
}

function Shield(props) {
  return (
    <IconBase {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </IconBase>
  );
}

function ChevronLeft(props) {
  return (
    <IconBase {...props}>
      <path d="m15 18-6-6 6-6" />
    </IconBase>
  );
}

function ChevronRight(props) {
  return (
    <IconBase {...props}>
      <path d="m9 18 6-6-6-6" />
    </IconBase>
  );
}

function RotateCcw(props) {
  return (
    <IconBase {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 3v6h6" />
    </IconBase>
  );
}

const START_DATE = "2026-05-10"; // Сегодня: воскресенье, первый день пропуска
const STORAGE_KEY = "omez-taper-calendar-v1";

function toISO(date) {
  return date.toISOString().slice(0, 10);
}

function fromISO(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function dayDiff(a, b) {
  const ms = 24 * 60 * 60 * 1000;
  return Math.round((fromISO(a) - fromISO(b)) / ms);
}

const monthNames = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function getPlanForDate(iso) {
  const diff = dayDiff(iso, START_DATE);
  if (diff < 0) return { type: "past", label: "До старта", details: "План ещё не начат" };

  const week = Math.floor(diff / 7) + 1;
  const date = fromISO(iso);
  const day = date.getDay(); // 0 Sun, 1 Mon, ...

  // Самая мягкая схема снижения:
  // Недели 1–2: пропуск только воскресенье.
  // Недели 3–4: пропуск среда + воскресенье.
  // Недели 5–6: через день.
  // Недели 7–8: 1 раз в 3 дня / по необходимости.

  if (week <= 2) {
    if (day === 0) return { type: "skip", label: "Пропуск", details: "Без Омеза. Гевискон после ужина и на ночь при симптомах." };
    return { type: "take", label: "Омез 10:00", details: "Омез 20 мг утром за 30 минут до еды." };
  }

  if (week <= 4) {
    if (day === 0 || day === 3) return { type: "skip", label: "Пропуск", details: "Без Омеза. Гевискон/Ренни по необходимости." };
    return { type: "take", label: "Омез 10:00", details: "Омез 20 мг утром за 30 минут до еды." };
  }

  if (week <= 6) {
    if (diff % 2 === 0) return { type: "skip", label: "Пропуск", details: "День без Омеза. Поддержка Гевисконом при изжоге." };
    return { type: "take", label: "Омез 10:00", details: "Омез 20 мг утром за 30 минут до еды." };
  }

  if (week <= 8) {
    if (diff % 3 === 1) return { type: "take", label: "Омез 10:00", details: "Омез 20 мг, если идёшь по плану 1 раз в 3 дня." };
    return { type: "skip", label: "Пропуск", details: "Без Омеза. Гевискон/Ренни по необходимости." };
  }

  return { type: "asNeeded", label: "По требованию", details: "Омез только если симптомы возвращаются устойчиво. Лучше обсудить с врачом." };
}

function getMonthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday first
  const start = addDays(first, -startOffset);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export default function OmezTaperCalendar() {
  const start = fromISO(START_DATE);
  const [viewDate, setViewDate] = useState(start);
  const [selectedISO, setSelectedISO] = useState(START_DATE);
  const [records, setRecords] = useState(() => {
    try {
      if (typeof window === "undefined") return {};
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const days = useMemo(() => getMonthMatrix(viewDate.getFullYear(), viewDate.getMonth()), [viewDate]);
  const selectedPlan = getPlanForDate(selectedISO);
  const selectedRecord = records[selectedISO] || {};

  const stats = useMemo(() => {
    const first56 = Array.from({ length: 56 }, (_, i) => toISO(addDays(start, i)));
    const takeDays = first56.filter((iso) => getPlanForDate(iso).type === "take");
    const skipDays = first56.filter((iso) => getPlanForDate(iso).type === "skip");
    const done = first56.filter((iso) => records[iso]?.done).length;
    return { total: first56.length, take: takeDays.length, skip: skipDays.length, done };
  }, [records]);

  function updateRecord(patch) {
    setRecords((prev) => ({
      ...prev,
      [selectedISO]: { ...prev[selectedISO], ...patch }
    }));
  }

  function resetDay() {
    setRecords((prev) => {
      const copy = { ...prev };
      delete copy[selectedISO];
      return copy;
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-5">
        <header className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 mb-3">
                <CalendarDays className="w-4 h-4" />
                Старт: воскресенье, 10 мая 2026
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Календарь мягкого снижения Омеза</h1>
              <p className="text-slate-600 mt-2 max-w-2xl">
                Отмечай дни приёма, дни пропуска, изжогу и использование Гевискона/Ренни. Данные сохраняются только в этом браузере.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 min-w-full md:min-w-[360px]">
              <Stat label="Дней плана" value={stats.total} />
              <Stat label="Приём" value={stats.take} />
              <Stat label="Пропуск" value={stats.skip} />
            </div>
          </div>
        </header>

        <main className="grid lg:grid-cols-[1fr_360px] gap-5">
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <button
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                className="p-2 rounded-xl hover:bg-slate-100 transition"
                aria-label="Предыдущий месяц"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold">
                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
              </h2>
              <button
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                className="p-2 rounded-xl hover:bg-slate-100 transition"
                aria-label="Следующий месяц"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
              {weekdays.map((d) => (
                <div key={d} className="p-3 text-center text-sm font-medium text-slate-500">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {days.map((date) => {
                const iso = toISO(date);
                const plan = getPlanForDate(iso);
                const record = records[iso];
                const isCurrentMonth = date.getMonth() === viewDate.getMonth();
                const isSelected = iso === selectedISO;
                const dayNum = date.getDate();

                return (
                  <button
                    key={iso}
                    onClick={() => setSelectedISO(iso)}
                    className={[
                      "min-h-[92px] md:min-h-[112px] p-2 border-r border-b border-slate-100 text-left transition relative",
                      isCurrentMonth ? "bg-white hover:bg-slate-50" : "bg-slate-50/60 text-slate-400",
                      isSelected ? "ring-2 ring-slate-900 ring-inset z-10" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{dayNum}</span>
                      {record?.done ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : null}
                    </div>
                    <div className={[
                      "rounded-xl px-2 py-1 text-[11px] md:text-xs font-medium inline-flex items-center gap-1",
                      plan.type === "take" ? "bg-blue-50 text-blue-700" : "",
                      plan.type === "skip" ? "bg-amber-50 text-amber-700" : "",
                      plan.type === "asNeeded" ? "bg-violet-50 text-violet-700" : "",
                      plan.type === "past" ? "bg-slate-100 text-slate-500" : "",
                    ].join(" ")}
                    >
                      {plan.type === "take" ? <Pill className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                      {plan.label}
                    </div>
                    <div className="mt-2 flex gap-1 flex-wrap">
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
            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">Выбранный день</p>
                  <h2 className="text-xl font-semibold mt-1">{fromISO(selectedISO).toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "long" })}</h2>
                </div>
                <button onClick={resetDay} className="p-2 rounded-xl hover:bg-slate-100 transition" title="Очистить отметки дня">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className={[
                "mt-4 rounded-2xl p-4 border",
                selectedPlan.type === "take" ? "bg-blue-50 border-blue-100" : "",
                selectedPlan.type === "skip" ? "bg-amber-50 border-amber-100" : "",
                selectedPlan.type === "asNeeded" ? "bg-violet-50 border-violet-100" : "",
                selectedPlan.type === "past" ? "bg-slate-50 border-slate-100" : "",
              ].join(" ")}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {selectedPlan.type === "take" ? <Pill className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                  {selectedPlan.label}
                </div>
                <p className="text-sm text-slate-600 mt-2">{selectedPlan.details}</p>
              </div>

              <div className="mt-5 space-y-3">
                <Toggle checked={!!selectedRecord.done} onChange={(v) => updateRecord({ done: v })} label="День выполнен" />
                <Toggle checked={!!selectedRecord.gaviscon} onChange={(v) => updateRecord({ gaviscon: v })} label="Пил Гевискон" />
                <Toggle checked={!!selectedRecord.rennie} onChange={(v) => updateRecord({ rennie: v })} label="Пил Ренни" />
                <Toggle checked={!!selectedRecord.heartburn} onChange={(v) => updateRecord({ heartburn: v })} label="Была изжога" />
                <Toggle checked={!!selectedRecord.pain} onChange={(v) => updateRecord({ pain: v })} label="Была боль/вздутие" />
              </div>

              <label className="block mt-5">
                <span className="text-sm font-medium text-slate-700">Заметка</span>
                <textarea
                  value={selectedRecord.note || ""}
                  onChange={(e) => updateRecord({ note: e.target.value })}
                  placeholder="Например: изжога после ужина, легче после ходьбы 20 минут"
                  className="mt-2 w-full min-h-[100px] rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                />
              </label>
            </section>

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold flex items-center gap-2"><Moon className="w-5 h-5" /> Памятка на дни пропуска</h3>
              <div className="mt-3 text-sm text-slate-600 space-y-2">
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

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function MiniTag({ children }) {
  return <span className="text-[10px] rounded-full bg-slate-100 text-slate-600 px-2 py-0.5">{children}</span>;
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3 hover:bg-slate-50 transition text-left"
    >
      <span className="text-sm font-medium">{label}</span>
      {checked ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5 text-slate-300" />}
    </button>
  );
}
