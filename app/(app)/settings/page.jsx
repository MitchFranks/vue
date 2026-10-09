'use client'

// Settings: only things that really work in the prototype.
//   Theme          the same colour choices as step 2 of the welcome guide
//   Welcome guide  replay the guide

import { DEFAULT_ACCENT } from '@/lib/onboarding'
import { useOnboarding } from '@/components/onboarding/OnboardingProvider'
import { ThemePicker } from '@/components/onboarding/ThemePicker'
import { Breadcrumbs, Button, Card, Icon, PageHeader } from '@/components/ui/primitives'

export default function SettingsPage() {
  const { accent, setAccent, resetAccent, replay } = useOnboarding()

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

        <Card title="Welcome guide" subtitle="The three quick steps shown on first visit." icon="list">
          <p className="text-[14px] leading-relaxed text-ink-2">
            Want the tour again? The guide starts from the welcome step. Your colour and couples stay as they are.
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
      </div>
    </div>
  )
}
