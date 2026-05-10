# AGENTS.md

## Изначальный промт для агента

Ты — мой личный помощник для ведения календаря мягкого снижения Омеза.

Главная задача:

- Помогать мне вести простой React-календарь как локальное Vite + React + TypeScript приложение в этом репозитории.
- Календарь отслеживает дни приёма Омеза, дни пропуска, симптомы, Гевискон, Ренни и заметки.
- Старый Canvas-контекст относится только к веб-версии ChatGPT; в repo-версии изменения делаются в локальном приложении.
- Если я прошу открыть календарь, запусти или открой локальное приложение с React-компонентом, восстановленным из `src/reference/omez_taper_calendar_app.jsx`.
- Если я прошу изменить схему, меняй только логику календаря и подписи, не давай медицинских назначений от себя.
- Если вопрос касается дозировок, отмены лекарств, тревожных симптомов или ухудшения состояния, напоминай, что это нужно согласовать с врачом.

Исходная схема:

- Старт: воскресенье, 10 мая 2026.
- Недели 1–2: Омез 20 мг 6 дней в неделю, пропуск только в воскресенье.
- Недели 3–4: Омез 20 мг 5 дней в неделю, пропуск среда + воскресенье.
- Недели 5–6: через день.
- Недели 7–8: 1 раз в 3 дня / по требованию.
- В дни пропуска: Гевискон после еды и на ночь при симптомах; Ренни как быстрый резерв.
- Золофт/сертралин 75 мг разносить с Гевисконом/Ренни минимум на 2 часа.

Правила поведения:

- Отвечай кратко, структурно и по делу.
- Сначала давай практический вывод, потом детали.
- Не изображай врача и не ставь диагнозы.
- При изменениях календаря редактируй локальное Vite + React + TypeScript приложение; Canvas не используется для repo-версии.
- Сохраняй приложение максимально простым, наглядным и без внешних CDN-зависимостей.
- Не добавляй сторонние npm-пакеты без необходимости.
- Все иконки должны быть локальными SVG-компонентами внутри файла.
- Данные календаря должны сохраняться через localStorage.

## Идея MVP

Что я бы сделал для GitHub-версии

1. Универсальное название: TaperTrack / Taper Calendar / StepDown Calendar
2. Настраиваемый препарат: название, доза, время приёма
3. Настраиваемая схема:
   - 6/1
   - 5/2
   - через день
   - 1 раз в 3 дня
   - custom pattern
4. Календарь с отметками:
   - принято
   - пропущено по плану
   - rescue medication / поддержка
   - симптомы
   - заметка
5. localStorage + export/import JSON
6. GitHub Pages / Netlify demo
7. Явный дисклеймер: не медицинское назначение, только трекер согласованного с врачом плана

## Purpose

This repository contains a small local-first web app for tracking gradual medication tapering schedules.

The first task is NOT to build a full product.
The first task is to recreate the existing prototype as a working local app, verify that it runs, and verify that data persists in `localStorage`.

After the prototype works, we will gradually turn it into a universal MVP.

---

## Product Vision

Build a free, open-source, local-first taper calendar.

The app helps a user follow a pre-agreed tapering plan by showing:

- which days are medication days;
- which days are planned skip/reduction days;
- rescue/support medication markers;
- symptoms;
- notes;
- progress over time.

The app must NOT provide medical advice, diagnosis, or medication instructions.
It is only a tracking tool for a plan that the user defines or has agreed with a clinician.

---

## Current Prototype Context

The initial prototype is a React single-page calendar called:

`OmezTaperCalendar`

Current fixed plan:

- Start date: `2026-05-10`
- Weeks 1–2: take Omez 20 mg 6 days/week, skip Sunday
- Weeks 3–4: take 5 days/week, skip Wednesday and Sunday
- Weeks 5–6: every other day
- Weeks 7–8: once every 3 days / as needed
- Track:
  - day completed
  - Gaviscon used
  - Rennie used
  - heartburn
  - pain/bloating
  - note

Important:

- The current prototype code exists in the reference file supplied by the user.
- First recreate it as closely as possible before changing the product model.
- Do not redesign or generalize it until the prototype is verified.

---

## Phase 1 Status

Phase 1 is complete. The fixed Omez prototype has been recreated as a working local Vite + React + TypeScript + Tailwind app.

Keep this baseline stable before starting universal Phase 2 work.

Verified baseline behavior:

- Monthly calendar grid.
- Monday-first week layout.
- Previous/next month navigation.
- Selected day details panel.
- Status badges for planned medication days and planned skip days.
- Toggle checkboxes/buttons for daily records.
- Free-text note per day.
- `localStorage` persistence.
- Data remains after page refresh.
- No backend.
- No login.
- No cloud sync.
- No database.
- No analytics.

Phase 1 definition of done was met:

- `pnpm install` succeeds.
- `pnpm dev` starts the app.
- `pnpm build` succeeds.
- Calendar opens without console errors.
- Marking a day persists after page refresh.
- Notes persist after page refresh.
- Switching months works.
- Resetting a selected day clears only that day.
- App works in desktop browser at `localhost`.

---

## Phase 1 Technical Stack

Use:

- React
- TypeScript
- Vite
- Tailwind CSS

Avoid unless explicitly requested:

- Next.js
- backend frameworks
- databases
- Firebase
- Supabase
- authentication
- external UI kits
- chart libraries
- routing libraries
- state managers
- external icon CDN

Icons:

- Use inline local SVG components or a locally installed package.
- Do not import icons from CDN.
- Do not rely on runtime network fetches for icons.

Persistence:

- Use `localStorage`.
- Use a single versioned storage key at first.
- For Phase 1, use the current prototype key: `omez-taper-calendar-v1`.
- Reserve `taper-calendar-v1` for the future universal Phase 2 model if migration is needed.

---

## Current Project Structure

The working Phase 1 app intentionally keeps most logic in `src/App.tsx`.

Keep the structure simple until Phase 2 creates a real need to split modules.

## Implementation Rules

General
Keep the app small and understandable.
Prefer clear code over clever abstractions.
Do not introduce dependencies without explaining why.
Do not silently change product behavior.
If you find ambiguity, ask before changing core behavior.
If you can make a safe assumption, state it briefly and continue.
Do not rewrite the whole app unless necessary.
Keep commits or changes small and reviewable.
TypeScript
Use strict TypeScript where practical.
Define explicit types for:
daily record
plan day
taper plan
symptom flags
Avoid any.
If a temporary any is unavoidable, add a comment explaining why.

Suggested initial types:
export type PlanDayType = "take" | "skip" | "asNeeded" | "past";

export interface PlanDay {
type: PlanDayType;
label: string;
details: string;
}

export interface DayRecord {
done?: boolean;
supportMedication?: boolean;
rescueAntacid?: boolean;
heartburn?: boolean;
painOrBloating?: boolean;
note?: string;
}

## Date Handling

Do not use heavy date libraries in Phase 1.
Use small utility functions:
toISO(date)
fromISO(iso)
addDays(date, days)
dayDiff(a, b)
getMonthMatrix(year, month)
Store dates as ISO strings: YYYY-MM-DD.
Calendar should be Monday-first.

## Storage

Read localStorage in the initial state function, not only after first render.
Save to localStorage whenever records change.
Handle malformed storage data safely.
Never crash if localStorage is unavailable.
Later add export/import JSON, but not in Phase 1 unless requested.

Good pattern:
const [records, setRecords] = useState<Record<string, DayRecord>>(() => {
try {
if (typeof window === "undefined") return {};
const saved = window.localStorage.getItem(STORAGE_KEY);
return saved ? JSON.parse(saved) : {};
} catch {
return {};
}
});

## UX Rules

The UI should be:

simple;
clear;
calm;
readable;
desktop-first but usable on mobile;
not medical-looking in a scary way;
not overloaded.

Calendar cells should show:

day number;
planned action;
completion marker;
small tags for symptoms/support meds.

Selected day panel should show:

date;
planned action;
plan explanation;
toggles;
notes;
reset button.

Use plain language.
Avoid clinical overcomplication.

## Medical Safety Rules

This app must not act as a doctor.

Do not implement:

automatic dosage recommendations;
diagnosis logic;
“you should stop/take medication” messages;
drug interaction claims;
emergency triage beyond generic safety copy;
AI-generated medical advice.
new medication, dosage, timing, tapering, or rescue-medication recommendations generated by the app.

Allowed:

tracking a user-defined plan;
displaying user-entered medication names;
showing only predefined reminders from the user-defined or clinician-agreed plan;
recording symptoms;
exporting data for discussion with a clinician.

Required disclaimer in README and eventually in the app:
This app is a personal tracking tool. It does not provide medical advice, diagnosis, or treatment recommendations. Medication changes should be discussed with a qualified healthcare professional.

## Phase 2 MVP Direction

Do not start Phase 2 until Phase 1 is working.

After Phase 1, make the app universal.

MVP features:

configurable medication name;
configurable dose label;
configurable start date;
configurable schedule pattern;
support medication labels;
symptom labels;
localStorage persistence;
export/import JSON;
print-friendly view;
basic README;
GitHub Pages deployment.

Suggested universal model:
interface MedicationConfig {
medicationName: string;
doseLabel: string;
defaultTime?: string;
}

interface TaperPhase {
id: string;
title: string;
startDayOffset: number;
durationDays: number;
pattern: TaperPattern;
}

type TaperPattern =
| { type: "take-every-day" }
| { type: "skip-weekdays"; weekdays: number[] }
| { type: "every-n-days"; interval: number; takeOnRemainder?: number }
| { type: "custom"; days: Record<string, "take" | "skip" | "asNeeded"> };

Possible presets:

6 days/week, 1 skip day
5 days/week, 2 skip days
every other day
once every 3 days
custom calendar

## Phase 3 Later Ideas

Do not implement now unless requested:

PWA installability
offline service worker
import/export encrypted backup
multi-medication support
charts
symptom severity scale
CSV export
calendar .ics export
GitHub Pages demo
internationalization
dark mode
mobile-first redesign
notifications
browser push notifications

## Commands

After creating the project, use:
pnpm install
pnpm dev
pnpm build

Before reporting completion:

run the build command;
fix TypeScript/build errors;
inspect the browser console if possible;
manually test localStorage persistence.

## Current Task Direction

Phase 1 is finished and committed by the user.

Next work should be small and reviewable:

- polish the fixed prototype without changing the plan logic;
- keep `omez-taper-calendar-v1` storage intact;
- only start universal Phase 2 when explicitly requested.

Do not add backend.
Do not add auth.
Do not add notifications.
Do not add PWA yet.
Do not add medical advice logic.

## Environment

Development environment:

- OS: Windows 11
- Editor: VS Code
- Shell: PowerShell or Git Bash
- Prefer commands that work on Windows.
- Do not assume Linux-only tools unless they are already used in the project.

Windows/local browser notes:

- Use `pnpm` for normal foreground commands: `pnpm install`, `pnpm dev`, `pnpm build`.
- When starting a long-running dev server from PowerShell with `Start-Process`, use `pnpm.cmd`, not bare `pnpm`; otherwise Windows can fail with `%1 не является приложением Win32`.
- Prefer `pnpm dev --host 127.0.0.1 --port 5173` for local browser verification.
- Prefer the Codex in-app browser for localhost UI checks. Open the app through the browser automation tool even if the user already has a visible in-app browser tab, because the tool-controlled tab may initially be `about:blank`.
- Use `http://127.0.0.1:5173/` as the default local URL. Try `localhost` only if `127.0.0.1` is unavailable.
- Do not use Playwright CLI for routine local UI checks if the in-app browser works. Keep Playwright CLI as a fallback for cases where the in-app browser cannot access the page or lacks a needed capability.
- If dependency install fails with registry/network `EACCES`, treat it as a sandbox/network restriction, not as a project issue. Re-run according to the current harness permission rules and report the workaround.

## Troubleshooting & Meta-Rules

- Always report recurring/setup-related issues: Windows shell incompatibility, dependency install failure, occupied ports, dev server/test/build failures, path/permission/encoding issues, or any workaround used.
- If local browser checks fail, first verify that the dev server is reachable at `http://127.0.0.1:5173/`, then open that exact URL from the in-app browser automation tool before falling back to heavier browser tooling.
- **Self-Correction:** Suggest to the user a permanent rule for `AGENTS.md` if an issue requires a repeated fix.
- Do not apologize or use overly polite filler phrases. Give direct, concise solutions.

## Rules

1. If the dev server port is occupied, treat it as an existing running dev server, not as a blocker. Do not invent alternative ports or restart strategies unless the existing server is unreachable.
2. Make small, focused changes. Do not refactor, reformat, rename, or clean up unrelated code unless explicitly asked.

## Clarifications

If a task is ambiguous and a wrong choice would cause significant rework, ask any clarifying questions using ask/ask_user/question tools if the current harness provides them. Otherwise, proceed with a reasonable assumption and mention it.

## Critical Review

Do not blindly accept user-proposed solutions.
If the proposed approach seems risky, overcomplicated, inconsistent with the project architecture, or there is a clearly simpler option, briefly point it out before implementation.

Do not argue for minor preferences. If the user's approach is reasonable, proceed.

## Secrets & .env

- Never output real API keys, passwords, or secrets in the chat.
- Never commit `.env`, `.env.local`, or any file containing real secrets.
- Use `.env.example` to define required variables without real values.

## User's Language

- Communicate with the user in Russian.
- Keep project documentation in Russian unless the project uses English docs.
- Code, variable names, function names, and commit messages must be in English.
