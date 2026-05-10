import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, isLocale, localeOptions, t } from "./i18n";

describe("i18n", () => {
  it("uses Russian as the default locale", () => {
    expect(DEFAULT_LOCALE).toBe("ru");
  });

  it("detects supported locales", () => {
    expect(isLocale("ru")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("hy")).toBe(true);
    expect(isLocale("de")).toBe(false);
  });

  it("contains all locale switcher options", () => {
    expect(localeOptions.map((option) => option.value)).toEqual(["ru", "en", "hy"]);
  });

  it("translates key UI strings", () => {
    expect(t("ru", "configure")).toBe("Настроить");
    expect(t("en", "configure")).toBe("Configure");
    expect(t("hy", "configure")).toBe("Կարգավորել");
  });

  it("interpolates replacement values", () => {
    expect(t("en", "usedSupport", { name: "Gaviscon" })).toBe("Used Gaviscon");
    expect(t("ru", "dayNumber", { number: 3 })).toBe("День 3");
  });
});
