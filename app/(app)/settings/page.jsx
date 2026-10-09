'use client'

// Settings: only things that really work in the prototype.
//   Theme        the same colour choices as step 2 of the welcome guide
//   User guides  replay the welcome, Staffing Planner and Events guides

import { useRouter } from 'next/navigation'
import { clearPlannerGuide } from '@/components/onboarding/PlannerGuide'
import { clearEventsGuide } from '@/components/onboarding/EventsGuide'
import { DEFAULT_ACCENT } from '@/lib/onboarding'
import { useOnboarding } from '@/components/onboarding/OnboardingProvider'
import { ThemePicker } from '@/components/onboarding/ThemePicker'
import { Breadcrumbs, Button, Card, Icon, PageHeader } from '@/components/ui/primitives'

export default function SettingsPage() {
  const { accent, setAccent, resetAccent, replay } = useOnboarding()
  const router = useRouter()

  // One line per guide: what it covers, and a button to run it again.
  const guides = [
    {
      id: 'welcome',
      title: 'Welcome guide',
      text: 'Three quick steps: pick your colour, then choose what to do first. Takes you back to the dashboard. Your colour and couples stay as they are.',
      button: 'Replay welcome guide',
      run: replay
    },
    {
      id: 'planner',
      title: 'Staffing Planner guide',
      text: 'Two steps through the Staffing Planner, pointing at the first button to click.',
      button: 'Replay planner guide',
      run: () => {
        clearPlannerGuide()
        router.push('/staffing')
      }
    },
    {
      id: 'events',
      title: 'Events guide',
      text: 'Three steps through Events: open a wedding, find its run of show, and add a block.',
      button: 'Replay events guide',
      run: () => {
        clearEventsGuide()
        router.push('/events')
      }
    }
  ]

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]} />
      <PageHeader title="Settings" lead="Make Vue yours. Changes apply straight away and are kept on this device." />

      <div className="max-w-2xl space-y-4">
        <Card title="Theme" subtitle="Vue uses your colour for the things that need you." icon="check">
          <ThemePicker accent={accent} onChange={setAccent} />
          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={resetAccent} disabled={accent === DEFAULT_ACCENT}>
              Reset to default colour
            </Button>
          </div>
        </Card>

        <Card title="User guides" subtitle="Run any tour again." icon="list" bodyClassName="px-0 py-0">
          <ul>
            {guides.map((g) => (
              <li key={g.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line-soft px-5 py-3.5 last:border-b-0">
                <div className="min-w-[220px] flex-1">
                  <p className="text-[14px] font-semibold text-ink">{g.title}</p>
                  <p className="mt-0.5 text-[13px] leading-snug text-muted">{g.text}</p>
                </div>
                <Button variant="secondary" size="sm" onClick={g.run}>
                  {g.button}
                  <Icon name="arrowRight" size={13} />
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
