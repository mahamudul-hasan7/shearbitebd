import fs from "node:fs";
const catalogue = JSON.parse(fs.readFileSync(new URL("../src/lib/i18n/ui-copy.json", import.meta.url), "utf8"));
const normalize = (text) => text.replace(/\s+/g, " ").trim();
// Follow the application's catalogue precedence, including later overrides.
const source = fs.readFileSync(new URL("../src/lib/i18n/catalogue.ts", import.meta.url), "utf8");
const imports = new Map([...source.matchAll(/import (\w+) from "\.\/copy\/([^"\n]+)"/g)].map(([, name, file]) => [name, file]));
const order = source.match(/for \(const entries of \[([^\]]+)\]/)?.[1].split(",").map(name => name.trim());
if (!order?.length || order.some(name => !imports.has(name))) throw new Error("Browser copy catalogue order could not be resolved");
for (const file of order.map(name => imports.get(name))) {
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
