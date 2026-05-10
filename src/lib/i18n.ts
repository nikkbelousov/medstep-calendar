export type Locale = "ru" | "en" | "hy";

export const DEFAULT_LOCALE: Locale = "ru";

export const localeOptions: Array<{ value: Locale; label: string }> = [
  { value: "ru", label: "RU" },
  { value: "en", label: "EN" },
  { value: "hy", label: "HY" },
];

export const localeDateCodes: Record<Locale, string> = {
  ru: "ru-RU",
  en: "en-US",
  hy: "hy-AM",
};

export const localizedMonthNames: Record<Locale, string[]> = {
  ru: [
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
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  hy: [
    "Հունվար",
    "Փետրվար",
    "Մարտ",
    "Ապրիլ",
    "Մայիս",
    "Հունիս",
    "Հուլիս",
    "Օգոստոս",
    "Սեպտեմբեր",
    "Հոկտեմբեր",
    "Նոյեմբեր",
    "Դեկտեմբեր",
  ],
};

export const localizedWeekdays: Record<Locale, string[]> = {
  ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  hy: ["Երկ", "Երք", "Չրք", "Հնգ", "Ուրբ", "Շբթ", "Կիր"],
};

export const translations = {
  appStart: {
    ru: "Старт",
    en: "Start",
    hy: "Սկիզբ",
  },
  appSummaryPrefix: {
    ru: "Отмечай дни приёма, пропуска, симптомы и поддержку. Данные сохраняются только в этом браузере.",
    en: "Track planned intake days, skips, symptoms, and support. Data is stored only in this browser.",
    hy: "Նշիր ընդունման օրերը, բացթողումները, ախտանշանները և աջակցությունը։ Տվյալները պահվում են միայն այս դիտարկիչում։",
  },
  configure: {
    ru: "Настроить",
    en: "Configure",
    hy: "Կարգավորել",
  },
  statTotal: {
    ru: "Дней плана",
    en: "Plan days",
    hy: "Պլանի օրեր",
  },
  statTake: {
    ru: "Приём",
    en: "Take",
    hy: "Ընդունում",
  },
  statSkip: {
    ru: "Пропуск",
    en: "Skip",
    hy: "Բացթողում",
  },
  statDone: {
    ru: "Отмечено",
    en: "Done",
    hy: "Նշված",
  },
  disclaimer: {
    ru: "Это личный трекер заданного плана. Он не даёт медицинских советов, диагнозов или рекомендаций по лечению.",
    en: "This is a personal tracker for a defined plan. It does not provide medical advice, diagnosis, or treatment recommendations.",
    hy: "Սա սահմանված պլանի անձնական հետևիչ է։ Այն չի տրամադրում բժշկական խորհուրդներ, ախտորոշում կամ բուժման առաջարկություններ։",
  },
  previousMonth: {
    ru: "Предыдущий месяц",
    en: "Previous month",
    hy: "Նախորդ ամիս",
  },
  nextMonth: {
    ru: "Следующий месяц",
    en: "Next month",
    hy: "Հաջորդ ամիս",
  },
  selectedDay: {
    ru: "Выбранный день",
    en: "Selected day",
    hy: "Ընտրված օր",
  },
  clearDay: {
    ru: "Очистить отметки дня",
    en: "Clear day records",
    hy: "Մաքրել օրվա նշումները",
  },
  notMedicalRecommendation: {
    ru: "Это отображение заданного плана, не медицинская рекомендация.",
    en: "This displays the defined plan; it is not a medical recommendation.",
    hy: "Սա ցուցադրում է սահմանված պլանը և բժշկական առաջարկություն չէ։",
  },
  dayDone: {
    ru: "День выполнен",
    en: "Day completed",
    hy: "Օրը կատարված է",
  },
  usedSupport: {
    ru: "Пил {name}",
    en: "Used {name}",
    hy: "Օգտագործել է {name}",
  },
  usedRescue: {
    ru: "Пил {name}",
    en: "Used {name}",
    hy: "Օգտագործել է {name}",
  },
  hadSymptom: {
    ru: "Была {name}",
    en: "Had {name}",
    hy: "Եղել է {name}",
  },
  note: {
    ru: "Заметка",
    en: "Note",
    hy: "Նշում",
  },
  notePlaceholder: {
    ru: "Например: симптомы после ужина, что помогло, что обсудить с врачом",
    en: "For example: symptoms after dinner, what helped, what to discuss with a clinician",
    hy: "Օրինակ՝ ախտանշաններ ընթրիքից հետո, ինչն օգնեց, ինչ քննարկել բժշկի հետ",
  },
  reminder: {
    ru: "Памятка",
    en: "Reminder",
    hy: "Հուշում",
  },
  reminderPlan: {
    ru: "Памятка отображает только заданный пользователем план.",
    en: "The reminder shows only the user-defined plan.",
    hy: "Հուշումը ցույց է տալիս միայն օգտատիրոջ սահմանած պլանը։",
  },
  reminderDoctor: {
    ru: "Изменения препаратов, доз и схем нужно согласовывать с врачом.",
    en: "Medication, dose, and schedule changes should be discussed with a clinician.",
    hy: "Դեղերի, դեղաչափերի և սխեմաների փոփոխությունները պետք է քննարկել բժշկի հետ։",
  },
  reminderLocal: {
    ru: "Данные сохраняются локально в этом браузере.",
    en: "Data is stored locally in this browser.",
    hy: "Տվյալները պահվում են տեղային՝ այս դիտարկիչում։",
  },
  settingsTitle: {
    ru: "Настройки плана",
    en: "Plan settings",
    hy: "Պլանի կարգավորումներ",
  },
  settingsDescription: {
    ru: "Настройки меняют плановые статусы, но не удаляют отметки по датам.",
    en: "Settings change planned statuses but do not delete records tied to dates.",
    hy: "Կարգավորումները փոխում են պլանային կարգավիճակները, բայց չեն ջնջում ամսաթվերին կապված նշումները։",
  },
  closeSettings: {
    ru: "Закрыть настройки",
    en: "Close settings",
    hy: "Փակել կարգավորումները",
  },
  language: {
    ru: "Язык",
    en: "Language",
    hy: "Լեզու",
  },
  startDate: {
    ru: "Дата старта",
    en: "Start date",
    hy: "Սկսման ամսաթիվ",
  },
  medication: {
    ru: "Препарат",
    en: "Medication",
    hy: "Դեղամիջոց",
  },
  other: {
    ru: "Другое",
    en: "Other",
    hy: "Այլ",
  },
  customName: {
    ru: "Своё название",
    en: "Custom name",
    hy: "Սեփական անուն",
  },
  customNamePlaceholder: {
    ru: "Например: мой препарат",
    en: "For example: my medication",
    hy: "Օրինակ՝ իմ դեղամիջոցը",
  },
  dose: {
    ru: "Доза",
    en: "Dose",
    hy: "Դեղաչափ",
  },
  time: {
    ru: "Время",
    en: "Time",
    hy: "Ժամ",
  },
  support: {
    ru: "Поддержка",
    en: "Support",
    hy: "Աջակցություն",
  },
  rescue: {
    ru: "Резерв",
    en: "Rescue",
    hy: "Պահուստ",
  },
  symptomOne: {
    ru: "Симптом 1",
    en: "Symptom 1",
    hy: "Ախտանշան 1",
  },
  symptomTwo: {
    ru: "Симптом 2",
    en: "Symptom 2",
    hy: "Ախտանշան 2",
  },
  schedule: {
    ru: "Схема",
    en: "Schedule",
    hy: "Սխեմա",
  },
  fullResetTitle: {
    ru: "Полный сброс данных",
    en: "Full data reset",
    hy: "Տվյալների ամբողջական զրոյացում",
  },
  fullResetDescription: {
    ru: "Удалит настройки и все отметки из этого браузера. Действие нельзя отменить.",
    en: "Deletes settings and all records from this browser. This cannot be undone.",
    hy: "Ջնջում է կարգավորումները և բոլոր նշումները այս դիտարկիչից։ Գործողությունը հնարավոր չէ հետարկել։",
  },
  clearAll: {
    ru: "Очистить всё",
    en: "Clear all",
    hy: "Մաքրել բոլորը",
  },
  confirm: {
    ru: "Подтвердить",
    en: "Confirm",
    hy: "Հաստատել",
  },
  cancel: {
    ru: "Отмена",
    en: "Cancel",
    hy: "Չեղարկել",
  },
  save: {
    ru: "Сохранить",
    en: "Save",
    hy: "Պահպանել",
  },
  resetPlanSettings: {
    ru: "Сбросить настройки плана",
    en: "Reset plan settings",
    hy: "Զրոյացնել պլանի կարգավորումները",
  },
  customSequenceTitle: {
    ru: "Своя последовательность",
    en: "Custom sequence",
    hy: "Սեփական հաջորդականություն",
  },
  customSequenceDescription: {
    ru: "Дни повторяются по кругу. Например: приём, пропуск, пропуск.",
    en: "Days repeat in a loop. For example: take, skip, skip.",
    hy: "Օրերը կրկնվում են շրջանաձև։ Օրինակ՝ ընդունում, բացթողում, բացթողում։",
  },
  addDay: {
    ru: "День",
    en: "Day",
    hy: "Օր",
  },
  dayNumber: {
    ru: "День {number}",
    en: "Day {number}",
    hy: "Օր {number}",
  },
  removeDay: {
    ru: "Удалить день {number}",
    en: "Remove day {number}",
    hy: "Ջնջել օր {number}",
  },
  repeat: {
    ru: "Повтор",
    en: "Repeat",
    hy: "Կրկնություն",
  },
  cycle: {
    ru: "Цикл",
    en: "Cycle",
    hy: "Ցիկլ",
  },
  daysUnit: {
    ru: "{count} дней",
    en: "{count} days",
    hy: "{count} օր",
  },
  actionTake: {
    ru: "Приём",
    en: "Take",
    hy: "Ընդունում",
  },
  actionSkip: {
    ru: "Пропуск",
    en: "Skip",
    hy: "Բացթողում",
  },
  actionAsNeeded: {
    ru: "По требованию",
    en: "As needed",
    hy: "Ըստ պահանջի",
  },
  presetBase: {
    ru: "Базовый 8-недельный план",
    en: "Base 8-week plan",
    hy: "Հիմնական 8-շաբաթյա պլան",
  },
  presetSixOne: {
    ru: "6/1",
    en: "6/1",
    hy: "6/1",
  },
  presetFiveTwo: {
    ru: "5/2",
    en: "5/2",
    hy: "5/2",
  },
  presetEveryOtherDay: {
    ru: "Через день",
    en: "Every other day",
    hy: "Օրումեջ",
  },
  presetEveryThirdDay: {
    ru: "1 раз в 3 дня",
    en: "Once every 3 days",
    hy: "3 օրը մեկ",
  },
  presetAsNeeded: {
    ru: "По требованию",
    en: "As needed",
    hy: "Ըստ պահանջի",
  },
  presetCustom: {
    ru: "Своя последовательность",
    en: "Custom sequence",
    hy: "Սեփական հաջորդականություն",
  },
  planBeforeStart: {
    ru: "До старта",
    en: "Before start",
    hy: "Մինչ սկիզբը",
  },
  planNotStarted: {
    ru: "План ещё не начат",
    en: "The plan has not started yet",
    hy: "Պլանը դեռ չի սկսվել",
  },
  planAfter: {
    ru: "После плана",
    en: "After plan",
    hy: "Պլանից հետո",
  },
  defaultMedication: {
    ru: "Препарат",
    en: "Medication",
    hy: "Դեղամիջոց",
  },
  defaultSupport: {
    ru: "Поддержка",
    en: "Support",
    hy: "Աջակցություն",
  },
  defaultRescue: {
    ru: "Резерв",
    en: "Rescue",
    hy: "Պահուստ",
  },
  defaultSymptom: {
    ru: "симптом",
    en: "symptom",
    hy: "ախտանշան",
  },
} as const;

export type TranslationKey = keyof typeof translations;

export function isLocale(value: unknown): value is Locale {
  return value === "ru" || value === "en" || value === "hy";
}

export function t(locale: Locale, key: TranslationKey, replacements: Record<string, string | number> = {}): string {
  let value: string = translations[key][locale] ?? translations[key][DEFAULT_LOCALE];

  for (const [name, replacement] of Object.entries(replacements)) {
    value = value.replaceAll(`{${name}}`, String(replacement));
  }

  return value;
}
