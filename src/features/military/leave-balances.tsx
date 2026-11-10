import { leaveLabels, type LeaveBalances } from "./workdays";

export function LeaveBalancesSummary({
  balances,
}: {
  balances: LeaveBalances;
}) {
  return (
    <section aria-label="남은 휴가" className="mt-8 border-t border-line pt-6">
      <h2 className="text-sm font-medium text-body">남은 휴가</h2>
      <dl className="mt-4 space-y-4">
        {(Object.entries(leaveLabels) as [keyof LeaveBalances, string][]).map(
          ([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="text-base font-medium tabular-nums text-ink">
                {balances[key]}
                <span className="ml-1 text-xs font-normal text-muted">일</span>
              </dd>
            </div>
          ),
        )}
      </dl>
      <p className="mt-4 text-xs leading-5 text-muted">
        달력 기준 · 연가 24일에서 차감 · 그 외 등록 일수 합산
      </p>
    </section>
  );
}
