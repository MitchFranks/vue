import { Staffing2Provider } from '@/lib/staffing/store'
import { UndoToast } from '@/components/staffing/UndoToast'
import { PhoneDrawer } from '@/components/staffing/StaffPhone'

// Staffing Planner has its own state (key vue-lowfi-staffing2-v1), its own
// toast with Undo, and the phone drawer that any screen can open.
export default function Staffing2Layout({ children }) {
  return (
    <Staffing2Provider>
      {children}
      <PhoneDrawer />
      <UndoToast />
    </Staffing2Provider>
  )
}
