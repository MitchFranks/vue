'use client'

// SCREEN 10 — Event Payments.

import { use } from 'react'
import { money, payments } from '@/lib/mock/records'
import { Card, EmptyState, Field, StatusBadge } from '@/components/ui/primitives'

export default function PaymentsPage({ params }) {
  const { id } = use(params)
  const pay = payments[id]

  if (!pay) {
    return <EmptyState title="No payment schedule" body="This event has no invoicing set up yet." />
  }

  const outstanding = pay.total - pay.paid

  return (
    <div className="space-y-4">
      <Card title="Balance" icon="dollar" subtitle={`${Math.round((pay.paid / pay.total) * 100)}% collected`}>
        <dl className="grid grid-cols-3 gap-3">
          <Field label="Contract total" value={money(pay.total)} />
          <Field label="Paid to date" value={money(pay.paid)} />
          <Field label="Outstanding">
            <span className={outstanding > 0 ? 'font-medium text-status-soon' : 'text-status-clear'}>{money(outstanding)}</span>
          </Field>
        </dl>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-pill border border-line bg-surface-sunken">
          <div className="h-full bg-status-clear" style={{ width: `${(pay.paid / pay.total) * 100}%` }} />
        </div>
      </Card>

      <Card title="Payment schedule" icon="list" bodyClassName="px-0 py-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-body">
            <caption className="sr-only">Payment schedule</caption>
            <thead>
              <tr className="border-b border-line bg-surface-sunken text-left text-label tracking-wide text-ink-muted">
                <th scope="col" className="px-4 py-2 font-medium">
                  Instalment
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  When
                </th>
                <th scope="col" className="px-4 py-2 text-right font-medium">
                  Amount
                </th>
                <th scope="col" className="px-4 py-2 text-right font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {pay.schedule.map((row) => (
                <tr key={row.id} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-2.5 text-ink">{row.label}</td>
                  <td className="px-4 py-2.5 text-label text-ink-muted">{row.when}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-ink">{money(row.amount)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <StatusBadge
                      tone={row.state === 'paid' ? 'done' : row.state === 'due' ? 'warn' : 'info'}
                      size="sm"
                    >
                      {row.state === 'paid' ? 'Paid' : row.state === 'due' ? 'Due' : 'Scheduled'}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
