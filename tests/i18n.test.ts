import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { catalogue } from "../src/lib/i18n/catalogue";
import { hasUiTranslation, translateUiText } from "../src/lib/i18n/ui-text";
import { getDonationTitleBn, getDonorOrganizationBn } from "../src/features/donations/donation-presentation";
import { isNoKnownAllergens } from "../src/lib/i18n/food-input";
import { FOOD_CATEGORY_LABELS, DIETARY_TYPE_LABELS, STORAGE_CONDITION_LABELS } from "../src/lib/constants/domain";

test("authored UI text has both languages and preserves placeholder values", () => {
  const missing: string[] = [];
  function walk(dir: string) { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(file); continue; }
    if (!/\.tsx?$/.test(file) || file.includes(path.join("lib", "i18n"))) continue;
    const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    function check(node: ts.Node) {
      let text: string | undefined;
      if (ts.isCallExpression(node) && node.expression.getText(source) === "tx" && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) text = node.arguments[0].text;
      if (/^(src[\\/](components|features|app)[\\/])/.test(file) && ts.isPropertyAssignment(node) && ["label", "shortLabel", "eyebrow", "step2Title", "step2Description"].includes(node.name.getText(source)) && ts.isStringLiteral(node.initializer)) text = node.initializer.text;
      if (ts.isJsxAttribute(node) && node.name.getText(source) === "source" && node.initializer) {
        if (ts.isStringLiteral(node.initializer)) text = node.initializer.text;
        else if (ts.isJsxExpression(node.initializer) && node.initializer.expression && ts.isStringLiteral(node.initializer.expression)) text = node.initializer.expression.text;
      }
      if (text && /[A-Za-z\u0980-\u09ff]/.test(text) && !hasUiTranslation(text)) missing.push(file + ": " + text);
      ts.forEachChild(node, check);
    } check(source);
  } } walk("src");
  assert.deepEqual(missing, [], "Every authored UI phrase needs a catalogue entry");
  for (const label of [...Object.values(FOOD_CATEGORY_LABELS), ...Object.values(DIETARY_TYPE_LABELS), ...Object.values(STORAGE_CONDITION_LABELS)]) assert.ok(hasUiTranslation(label), label);
  for (const pair of Object.values(catalogue)) {
    const placeholders = (value: string) => [...value.matchAll(/\{\d+\}/g)].map((match) => match[0]).sort();
    // English plural suffixes are sometimes separate slots; Bangla does not use them.
    for (const slot of placeholders(pair.bn)) assert.ok(placeholders(pair.en).includes(slot), pair.en + " has an unknown placeholder " + slot);
  }
  assert.equal(translateUiText("bn", "Welcome, {0}", "Settings"), "স্বাগতম, Settings");
  assert.equal(translateUiText("en", "স্বাগতম, {0}", "খাবার"), "Welcome, খাবার");
  assert.equal(translateUiText("en", "স্বাগতম, Settings"), "Welcome, Settings");
  assert.equal(getDonationTitleBn("Settings"), "Settings");
  assert.equal(getDonorOrganizationBn("Hope Foundation"), "Hope Foundation");
  for (const input of ["None known", "none.", "নেই", "জানা নেই", "কোনোটি নেই।"]) assert.equal(isNoKnownAllergens(input), true, input);
  assert.equal(isNoKnownAllergens("দুধ, ডিম"), false);
});
