/** Accept the interface's Bangla and English no-known-allergen phrases equally. */
export function isNoKnownAllergens(value: string) {
  return /^(?:none(?: known)?|নেই|জানা নেই|কোনোটি নেই|কোনোটিই নেই|কোনো অ্যালার্জেন নেই|অ্যালার্জি হওয়ার উপাদান নেই)[.!।]?$/i.test(value.trim());
}
