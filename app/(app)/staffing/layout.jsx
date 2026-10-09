import { StaffTabs } from '@/components/StaffTabs'

// Every Staff Planner screen sits under the same tab bar, so any screen is one
// click from any other.
export default function StaffingLayout({ children }) {
  return (
    <>
      <StaffTabs />
      {children}
    </>
  )
}
