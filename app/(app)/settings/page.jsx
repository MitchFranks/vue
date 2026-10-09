'use client'

// Settings: only things that really work in the prototype.
//   Welcome guide  replay the guide
//   Staffing Planner guide  replay the planner guide

import { useRouter } from 'next/navigation'
import { clearPlannerGuide } from '@/components/onboarding/PlannerGuide'
import { clearEventsGuide } from '@/components/onboarding/EventsGuide'
import { useOnboarding } from '@/components/onboarding/OnboardingProvider'
import { Breadcrumbs, Button, Card, Icon, PageHeader } from '@/components/ui/primitives'

export default function SettingsPage() {
  const { replay } = useOnboarding()
  const router = useRouter()

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]} />
      <PageHeader title="Settings" lead="Replay any of the guides. Changes apply straight away and are kept on this device." />

      <div className="max-w-2xl space-y-4">
        <Card title="Welcome guide" subtitle="The two quick steps shown on first visit." icon="list">
          <p className="text-[14px] leading-relaxed text-ink-2">
            Want the tour again? It takes you back to the dashboard and starts from the welcome step. Your couples stay as they are.
          </p>
          <div className="mt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={replay}
            >
              Replay the welcome guide
              <Icon name="arrowRight" size={13} />
            </Button>
          </div>
        </Card>

        <Card title="Staffing Planner guide" subtitle="The two quick steps shown the first time you open the planner." icon="users">
          <p className="text-[14px] leading-relaxed text-ink-2">
            Want the planner tour again? It opens the Staffing Planner and points at the first button to click.
          </p>
          <div className="mt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                clearPlannerGuide()
                router.push('/staffing')
              }}
            >
              Replay the planner guide
              <Icon name="arrowRight" size={13} />
            </Button>
          </div>
        </Card>

        <Card title="Events guide" subtitle="The three quick steps shown the first time you open Events." icon="calendar">
          <p className="text-[14px] leading-relaxed text-ink-2">
            Want the events tour again? It opens Events and points at the first thing to click.
          </p>
          <div className="mt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                clearEventsGuide()
                router.push('/events')
              }}
            >
              Replay the events guide
              <Icon name="arrowRight" size={13} />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
