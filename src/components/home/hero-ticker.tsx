export function HeroTicker({ lang }: { lang: "bn" | "en" }) {
  const steps = lang === "bn" ? ["খাবার দান", "NGO claim", "OTP handover", "Distribution record"] : ["Donate food", "NGO claim", "OTP handover", "Distribution record"];
  return <div className="grid grid-cols-2 gap-3 border-t border-emerald-500/20 pt-6 sm:grid-cols-4">{steps.map((step) => <div key={step} className="rounded-2xl border border-emerald-500/25 bg-emerald-950/60 p-3 text-xs font-bold text-emerald-100">{step}</div>)}</div>;
}
