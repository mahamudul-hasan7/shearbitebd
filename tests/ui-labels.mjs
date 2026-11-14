import fs from "node:fs";
const catalogue = JSON.parse(fs.readFileSync(new URL("../src/lib/i18n/ui-copy.json", import.meta.url), "utf8"));
const normalize = (text) => text.replace(/\s+/g, " ").trim();
for (const file of fs.readdirSync(new URL("../src/lib/i18n/copy/", import.meta.url)).filter((file) => file.endsWith(".json")).sort()) {
  for (const [en, bn, ...aliases] of JSON.parse(fs.readFileSync(new URL("../src/lib/i18n/copy/" + file, import.meta.url), "utf8"))) {
    for (const alias of [en, bn, ...aliases]) catalogue[normalize(alias)] = { en, bn };
  }
}
for (const [key, pair] of Object.entries(catalogue)) catalogue[key] = catalogue[normalize(pair.en)] ?? pair;
export function uiName(source) { return source === "বাংলা" ? source : catalogue[normalize(source)]?.en ?? source; }
export function uiLabel(source, language) { return catalogue[normalize(source)]?.[language] ?? source; }
export async function englishBrowserContext(browser, options) {
  const context = await browser.newContext(options);
  await context.addInitScript(() => { if (!localStorage.getItem("sharebite_preferred_lang")) localStorage.setItem("sharebite_preferred_lang", "en"); });
  return context;
}
