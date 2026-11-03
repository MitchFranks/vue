import { Landing } from '@/components/Landing'
import { OnboardingOverlay } from '@/components/onboarding/OnboardingProvider'

export default function WelcomePage() {
  return (
    <>
      <Landing />
      <OnboardingOverlay />
    </>
  )
}
