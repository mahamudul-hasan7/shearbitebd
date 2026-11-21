"use client";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import styles from "./rescue-coordination.module.css";
export function RescueContactCard({
  title,
  name,
  address,
  contact,
  phone,
  note,
}: {
  title: string;
  name: string;
  address?: string;
  contact?: string;
  phone?: string;
  note?: string;
}) {
  const tx = useUiText();
  return (
    <section className={styles.panel}>
      <div className={styles.panelBody}>
        <p className={styles.contactTitle}>
          <MapPin size={16} />
          {tx(title)}
        </p>
        <h3>{name}</h3>
        <address>
          {address || tx("Address not available. Coordinate by phone.")}
        </address>
        {contact && <p>{contact}</p>}
        {note && <p className={styles.status}>{note}</p>}
        {phone ? (
          <div className={styles.contactActions}>
            <a href={`tel:${phone}`}>
              <Phone size={16} />
              {tx("Call")}
            </a>
            <a href={`sms:${phone}`}>
              <MessageCircle size={16} />
              {tx("Message")}
            </a>
          </div>
        ) : (
          <p className={styles.status}>
            {tx("Phone contact is not available for this account.")}
          </p>
        )}
      </div>
    </section>
  );
}
