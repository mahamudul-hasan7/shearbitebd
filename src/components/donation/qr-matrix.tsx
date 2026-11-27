"use client";

export function QrMatrix({ value, size = 112, label = "Verification QR code" }: { value: string; size?: number; label?: string }) {
  const cells = 15;
  const cellSize = size / cells;
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const isFinder = (r: number, c: number) =>
    (r < 4 && c < 4) || (r < 4 && c >= cells - 4) || (r >= cells - 4 && c < 4);

  const rects: Array<{ x: number; y: number }> = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      let filled = false;
      if (isFinder(r, c)) {
        const lr = r >= cells - 4 ? r - (cells - 4) : r;
        const lc = c >= cells - 4 ? c - (cells - 4) : c;
        filled = lr === 0 || lr === 3 || lc === 0 || lc === 3 || (lr >= 1 && lr <= 2 && lc >= 1 && lc <= 2);
      } else {
        const bit = ((hash >>> ((r * 5 + c) % 24)) ^ (r * 7 + c * 13 + value.length)) & 1;
        filled = bit === 1;
      }
      if (filled) rects.push({ x: c * cellSize, y: r * cellSize });
    }
  }

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className="mx-auto rounded-2xl border border-emerald-200 bg-white p-2.5 text-slate-900 shadow-xs"
    >
      {rects.map((rect, idx) => (
        <rect
          key={idx}
          x={rect.x.toFixed(2)}
          y={rect.y.toFixed(2)}
          width={cellSize.toFixed(2)}
          height={cellSize.toFixed(2)}
          rx="1.2"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
