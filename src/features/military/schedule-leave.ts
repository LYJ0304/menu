import type { ScheduleEvent } from "@/features/schedule/events";
import type { LeaveBalances } from "./workdays";

export const annualLeaveLimit = 24;
export type LeaveAllowances = { reward: number; consolation: number };

export function parseLeaveAllowances(raw: string | null): LeaveAllowances {
  const result: LeaveAllowances = { reward: 0, consolation: 0 };
  try {
    const value = JSON.parse(raw ?? "null");
    if (!value || typeof value !== "object") return result;
    for (const key of ["reward", "consolation"] as const) {
      if (Number.isInteger(value[key]) && value[key] >= 0 && value[key] <= 999)
        result[key] = value[key];
    }
  } catch {
    /* Unavailable or malformed browser data starts at zero. */
  }
  return result;
}

/** A leave category on one calendar date represents one day, even if duplicated. */
export function getScheduledLeaveDays(events: ScheduleEvent[]): LeaveBalances {
  const dates = {
    annual: new Set<string>(),
    reward: new Set<string>(),
    consolation: new Set<string>(),
    combatRest: new Set<string>(),
  };
  for (const event of events) {
    switch (event.category) {
      case "연가":
        dates.annual.add(event.date);
        break;
      case "포상휴가":
        dates.reward.add(event.date);
        break;
      case "위로휴가":
        dates.consolation.add(event.date);
        break;
      case "전투휴무":
        dates.combatRest.add(event.date);
        break;
    }
  }
  return {
    annual: dates.annual.size,
    reward: dates.reward.size,
    consolation: dates.consolation.size,
    combatRest: dates.combatRest.size,
  };
}

export function getScheduleLeaveBalances(
  events: ScheduleEvent[],
  allowances: LeaveAllowances = { reward: 0, consolation: 0 },
): LeaveBalances {
  const days = getScheduledLeaveDays(events);
  return {
    ...days,
    annual: Math.max(0, annualLeaveLimit - days.annual),
    reward: Math.max(0, allowances.reward - days.reward),
    consolation: Math.max(0, allowances.consolation - days.consolation),
  };
}
