# MedStep Calendar

MedStep Calendar is a local-first web app for tracking a user-defined medication step-down plan.

It helps users see planned intake days, planned skip days, support/rescue markers, symptoms, notes, and progress without sending data to a server.

> Medical disclaimer: MedStep Calendar is a personal tracking tool. It does not provide medical advice, diagnosis, or treatment recommendations. Medication changes should be discussed with a qualified healthcare professional.

## Features

- Configurable start date.
- Configurable medication name, dose label, and default time.
- User-defined support medication, rescue medication, and symptom labels.
- Schedule presets: base 8-week plan, `6/1`, `5/2`, every other day, once every 3 days, as needed.
- Custom repeating day sequence.
- Daily records: completed, support, rescue, symptoms, note.
- UI languages: English, Russian, Armenian.
- Local browser storage with `localStorage`.
- Automatic migration from earlier local storage keys.
- Basic PWA support: manifest, app icon, service worker, standalone mode.

## Privacy

MedStep Calendar has no backend, login, database, analytics, or cloud sync. Data is stored locally in the user's browser.

Clearing browser data can remove app records. JSON export/import is not implemented yet.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Vitest
- localStorage
- PWA without extra libraries

## Getting Started

```powershell
pnpm install
pnpm dev
```

Default local URL:

```text
http://127.0.0.1:5173/
```

## Checks

Run tests:

```powershell
pnpm test
```

Build:

```powershell
pnpm build
```

Build for GitHub Pages:

```powershell
pnpm build:pages
```

Preview the production build:

```powershell
pnpm preview
```

PWA behavior should be checked with `pnpm build` + `pnpm preview`, because the service worker is registered only in production mode.

## GitHub Pages

The repository includes a GitHub Actions workflow:

```text
.github/workflows/pages.yml
```

It runs on pushes to `main`:

- `pnpm install --frozen-lockfile`
- `pnpm test`
- `pnpm build:pages`
- deploys `dist` through GitHub Pages artifacts

Initial repository publishing:

```powershell
git add .
git commit -m "Prepare MedStep Calendar for GitHub Pages"
gh repo create medstep-calendar --public --source=. --remote=origin --push
```

In GitHub, open `Settings -> Pages` and set the source to `GitHub Actions` if it is not selected automatically.

The published URL will look like:

```text
https://<github-user>.github.io/medstep-calendar/
```

## Roadmap

- JSON export/import.
- Print-friendly monthly view.
- Better production PWA installability checks.

---

## Русский

MedStep Calendar — локальное веб-приложение для отслеживания пользовательского плана постепенного снижения препарата.

Приложение помогает видеть плановые дни приёма, плановые пропуски, отметки поддержки/резерва, симптомы, заметки и прогресс без отправки данных на сервер.

> Медицинское ограничение: MedStep Calendar — личный трекер. Он не предоставляет медицинские советы, диагнозы или рекомендации по лечению. Изменения лекарств, дозировок и схем нужно обсуждать с квалифицированным медицинским специалистом.

### Возможности

- Настраиваемая дата старта.
- Настраиваемые название препарата, доза и время.
- Пользовательские названия поддержки, резерва и симптомов.
- Пресеты схем: базовый 8-недельный план, `6/1`, `5/2`, через день, 1 раз в 3 дня, по требованию.
- Собственная повторяющаяся последовательность дней.
- Отметки по дням: выполнено, поддержка, резерв, симптомы, заметка.
- Языки интерфейса: английский, русский, армянский.
- Локальное хранение через `localStorage`.
- Автоматическая миграция из старых локальных ключей хранения.
- Базовая PWA-поддержка: manifest, app icon, service worker, standalone mode.

### Конфиденциальность

В приложении нет backend, логина, базы данных, аналитики или облачной синхронизации. Данные хранятся локально в браузере пользователя.

При очистке данных браузера записи приложения могут быть удалены. Export/import JSON пока не реализован.

### Запуск

```powershell
pnpm install
pnpm dev
```

Локальный адрес по умолчанию:

```text
http://127.0.0.1:5173/
```

### Проверка

```powershell
pnpm test
pnpm build
```

Для проверки production-сборки:

```powershell
pnpm preview
```
