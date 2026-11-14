import type { Language } from "./translations";
import { catalogue, normalizeUiText } from "./catalogue";
export { normalizeUiText } from "./catalogue";

export type CopyPair = { bn: string; en: string };
const escapePattern = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const foldedCatalogue = new Map(Object.entries(catalogue).map(([key, pair]) => [key.toLocaleLowerCase("en"), pair]));
// Match only authored UI templates; interpolated names and other values stay intact.
const patterns = Object.entries(catalogue).filter(([key]) => /\{\d+\}/.test(key)).map(([key, pair]) => {
  const slots: number[] = [];
  const pieces = key.split(/(\{\d+\})/g).map((piece) => {
    if (/^\{\d+\}$/.test(piece)) { slots.push(Number(piece.slice(1, -1))); return "([\\s\\S]*?)"; }
    return escapePattern(piece);
  });
  return { pattern: new RegExp("^" + pieces.join("") + "$"), slots, pair, length: key.length };
}).sort((a, b) => b.length - a.length);

/** Only call this for application-owned copy, never arbitrary names or user content. */
export function translateUiText(language: Language, source: string, ...values: unknown[]) {
  const normalized = normalizeUiText(source);
  let pair = catalogue[normalized] ?? foldedCatalogue.get(normalized.toLocaleLowerCase("en"));
  let parameters = values;
  if (!pair && values.length === 0) {
    for (const entry of patterns) {
      const match = entry.pattern.exec(normalized);
      if (!match) continue;
      pair = entry.pair;
      parameters = [];
      entry.slots.forEach((slot, index) => { parameters[slot] = match[index + 1]; });
      break;
    }
  }
  if (!pair) return source;
  return pair[language].replace(/\{(\d+)\}/g, (match, index: string) => Number(index) < parameters.length ? String(parameters[Number(index)] ?? "") : match);
}

export function hasUiTranslation(source: string) { return Boolean(catalogue[normalizeUiText(source)]); }

/** Use only with static UI copy objects, never domain records or form values. */
export function localizeUiCopy<T>(value: T, language: Language): T {
  if (typeof value === "string") return translateUiText(language, value) as T;
  if (Array.isArray(value)) return value.map((item) => localizeUiCopy(item, language)) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localizeUiCopy(item, language)])) as T;
  return value;
}
