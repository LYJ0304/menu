import type { ScheduleEvent } from "@/features/schedule/events";
import type { LeaveBalances } from "./workdays";

export const annualLeaveLimit = 24;

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
): LeaveBalances {
  const days = getScheduledLeaveDays(events);
  return { ...days, annual: Math.max(0, annualLeaveLimit - days.annual) };
}
