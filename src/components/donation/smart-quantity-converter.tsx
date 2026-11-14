"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { QuantityUnit } from "@/lib/constants/domain";
import styles from "./donation-form.module.css";
interface SmartQuantityConverterProps {
  quantity: string; quantityUnit: QuantityUnit;
  onSelectPreset?: (qty: string, unit: QuantityUnit) => void; className?: string;
}
const amounts = { [QuantityUnit.MEALS]: [25,50,100,200], [QuantityUnit.KILOGRAMS]: [20,40,80] };
export function SmartQuantityConverter({ quantity, quantityUnit, onSelectPreset, className }: SmartQuantityConverterProps) {
  const tx = useUiText();
  const count = Number(quantity);
  const factor = quantityUnit === QuantityUnit.KILOGRAMS ? [2,2.5] : quantityUnit === QuantityUnit.TRAYS ? [12,15] : quantityUnit === QuantityUnit.LITRES ? [3,4] : [1,1];
  const min = Math.round(count * factor[0]), max = Math.round(count * factor[1]);
  const estimate = min === max ? String(min) : min + "–" + max;
  const presets = amounts[quantityUnit as keyof typeof amounts] ?? [];
  return <div className={className ? styles.amounts + " " + className : styles.amounts}>
    {onSelectPreset && presets.length > 0 && <div>
      <p className="mb-2">{tx("Quick amounts")}</p>
      <div className={styles.presets}>{presets.map((value) => <button type="button" key={value}
        aria-label={tx("Use {0} {1}", value, tx(quantityUnit))} aria-pressed={count === value}
        onClick={() => onSelectPreset(String(value), quantityUnit)}>{value} {tx(quantityUnit)}</button>)}</div>
    </div>}
    {Number.isFinite(count) && count > 0 && <div><p>{tx("Estimated servings: {0}", estimate)}</p><small>{tx("An estimate only. Actual meals are recorded after distribution.")}</small></div>}
  </div>;
}
