type Translate = (source: string, ...values: unknown[]) => string;
/** Only authored notification templates are translated. Plain messages are user content. */
export function notificationMessage(tx: Translate, notification: { title: string; message: string }) {
  if (["Distribution recorded", "Donation claimed"].includes(notification.title)) return tx(notification.message);
  return notification.message;
}
