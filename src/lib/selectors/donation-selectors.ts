import { PRIORITY_META, PriorityLevel } from "@/lib/constants/domain";

export interface RescueTimeRemaining {
  milliseconds: number;
  hours: number;
  minutes: number;
  isExpired: boolean;
  label: string;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function getRescueTimeRemaining(deadline: string, now = Date.now()): RescueTimeRemaining {
  const deadlineTime = Date.parse(deadline);
  const remaining = Number.isFinite(deadlineTime) ? Math.max(0, deadlineTime - now) : 0;
  const totalMinutes = Math.floor(remaining / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const isExpired = !Number.isFinite(deadlineTime) || deadlineTime <= now;

  return {
    milliseconds: remaining,
    hours,
    minutes,
    isExpired,
    label: isExpired ? "Deadline passed" : hours > 0 ? `${hours}h ${minutes}m remaining` : `${minutes}m remaining`,
  };
}

export function calculateUrgencyScore({
  safePickupDeadline,
  priority,
  now = Date.now(),
}: {
  safePickupDeadline: string;
  priority: PriorityLevel;
  now?: number;
}) {
  const deadline = Date.parse(safePickupDeadline);
  if (!Number.isFinite(deadline) || deadline <= now) return 100;

  const hoursRemaining = (deadline - now) / 3_600_000;
  const timeScore = hoursRemaining <= 1 ? 70 : hoursRemaining <= 2 ? 55 : hoursRemaining <= 4 ? 40 : hoursRemaining <= 8 ? 25 : 10;
  return clamp(timeScore + PRIORITY_META[priority].weight, 0, 100);
}

export function getUrgencyLabel(score: number) {
  const normalized = clamp(Math.round(score), 0, 100);
  if (normalized >= 85) return "Critical rescue window";
  if (normalized >= 65) return "Very urgent";
  if (normalized >= 45) return "Urgent";
  if (normalized >= 25) return "Plan soon";
  return "Normal priority";
}

export function getMatchScoreDisplay(score: number) {
  const normalized = clamp(Math.round(score), 0, 100);
  const label = normalized >= 85 ? "Excellent match" : normalized >= 70 ? "Strong match" : normalized >= 50 ? "Good match" : "Limited match";
  return { score: normalized, label, text: `${normalized}% match` };
}
