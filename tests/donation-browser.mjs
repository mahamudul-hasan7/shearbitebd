export async function goDonationStep(page, target) {
  await page.locator("form[data-wizard-step]").waitFor();
  let current = Number(await page.locator("form[data-wizard-step]").getAttribute("data-wizard-step"));
  while (current !== target) {
    const next = current + (current < target ? 1 : -1);
    await page.getByTestId(current < target ? "donation-next" : "donation-previous").click();
    await page.locator(`form[data-wizard-step="${next}"]`).waitFor({ timeout: 10_000 });
    current = next;
  }
}

export async function prepareDonationPhotos(page) {
  await goDonationStep(page, 1);
  for (const [name, value] of Object.entries({ title: "Fresh meal boxes", quantity: "20", allergenInfo: "None known", description: "Fresh food safely covered for pickup" })) {
    const field = page.locator(`form [name="${name}"]`);
    if (!(await field.inputValue())) await field.fill(value);
  }
  await goDonationStep(page, 3);
}
