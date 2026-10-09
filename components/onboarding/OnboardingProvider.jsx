'use client'

// ---------------------------------------------------------------------------
// First-run guide: three steps, then one small win.
//
//   1/3  Welcome       what Vue is, that the guide is short, that it is skippable
//   2/3  Your colour   pick an accent; the whole app switches to it live
//   3/3  Coach-mark    a spotlight on the Up Next menu item, now in their colour
//   then Up Next       the first item is "Add your couple's names": one field,
//                      one button, a small celebration, and the couple is real
//
// Shown once per browser (GUIDE_KEY in localStorage). "Reset prototype data"
// in the sidebar calls reset() here, which brings the guide back and restores
// the default colour. Every step can be left with Skip, the close button or Esc,
// and the app is fully usable afterwards. Replaces the old IntroModal, so a new
// user only ever sees one pop-up.
// ---------------------------------------------------------------------------

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  ACCENT_VARS,
  DEFAULT_ACCENT,
  GUIDE_KEY,
  THEME_KEY,
  deriveAccent,
  isHex,
  makeCouple
} from '@/lib/onboarding'
import { GuideDialog } from './GuideDialog'
import { CoachMark } from './CoachMark'

const OnboardingContext = createContext(null)

function readJson(key) {
  try {
    return JSON.parse(window.localStorage.getItem(key) || 'null')
  } catch {
    return null
  }
}

function writeJson(key, value) {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode or blocked storage: the guide still works in memory */
  }
}

function paint(vars) {
  const style = document.documentElement.style
  for (const name of ACCENT_VARS) {
    if (vars) style.setProperty(name, vars[name])
    else style.removeProperty(name)
  }
}

export function OnboardingProvider({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [hydrated, setHydrated] = useState(false)
  // welcome | theme | coach | done | skipped
  const [step, setStep] = useState(null)
  const [couple, setCouple] = useState(null)
  const [accent, setAccentState] = useState(DEFAULT_ACCENT)
  // One-shot: the user arrived on Up Next from the coach-mark, so focus the field.
  const [arrivedFromGuide, setArrivedFromGuide] = useState(false)

  // Read before paint. The inline script in app/layout.jsx already painted the
  // colour on a hard load; this re-applies it after React's dev remount.
  useLayoutEffect(() => {
    const theme = readJson(THEME_KEY)
    if (theme && isHex(theme.hex)) {
      const vars = deriveAccent(theme.hex)
      paint(vars)
      setAccentState(theme.hex)
    }
    const guide = readJson(GUIDE_KEY)
    setStep(guide?.step || 'welcome')
    setCouple(guide?.couple || null)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) writeJson(GUIDE_KEY, { step, couple })
  }, [hydrated, step, couple])

  // The guide ENDS the moment the user takes the final step: clicking the
  // spotlighted Up Next item or the popover's button calls finish(). As a
  // safety net, arriving at Up Next while on step 3 (a path change, so a
  // trailing slash "/up-next/" counts) ends it too. Done is saved at once, so
  // it can never come back on reload.
  const finish = useCallback(() => {
    setArrivedFromGuide(true)
    setStep((s) => (s === 'coach' ? 'done' : s))
  }, [])

  const lastPath = useRef(pathname)
  useEffect(() => {
    const was = lastPath.current
    lastPath.current = pathname
    const isUpNext = (p) => p?.replace(/\/+$/, '') === '/up-next'
    if (step === 'coach' && isUpNext(pathname) && !isUpNext(was)) finish()
  }, [step, pathname, finish])

  const setAccent = useCallback((hex) => {
    if (!isHex(hex)) return
    const vars = deriveAccent(hex)
    paint(vars)
    setAccentState(hex.toLowerCase())
    writeJson(THEME_KEY, { hex: hex.toLowerCase(), vars })
  }, [])

  const resetAccent = useCallback(() => {
    writeJson(THEME_KEY, null)
    paint(null)
    setAccentState(DEFAULT_ACCENT)
  }, [])

  /** Settings: show the welcome guide again. Keeps their colour and couple. */
  const replay = useCallback(() => {
    setArrivedFromGuide(false)
    setStep('welcome')
  }, [])

  const skip = useCallback(() => setStep('skipped'), [])
  const start = useCallback(() => setStep('theme'), [])

  const finishTheme = useCallback(() => {
    setStep('coach')
    // The Up Next menu item lives in the product sidebar. The welcome screen
    // has no sidebar, so step 3 takes the user into the product first.
    if (!document.querySelector('[data-onboarding="up-next"]')) router.push('/dashboard')
  }, [router])

  const addCouple = useCallback((names) => {
    const record = makeCouple(names)
    setCouple(record)
    setStep((s) => (s === 'done' || s === 'skipped' ? s : 'done'))
    return record
  }, [])

  const consumeArrival = useCallback(() => setArrivedFromGuide(false), [])

  const reset = useCallback(() => {
    writeJson(GUIDE_KEY, null)
    writeJson(THEME_KEY, null)
    paint(null)
    setAccentState(DEFAULT_ACCENT)
    setCouple(null)
    setArrivedFromGuide(false)
    setStep('welcome')
  }, [])

  const value = useMemo(
    () => ({
      hydrated,
      step,
      accent,
      couple,
      arrivedFromGuide,
      setAccent,
      resetAccent,
      replay,
      finish,
      addCouple,
      consumeArrival,
      skip,
      reset
    }),
    [hydrated, step, accent, couple, arrivedFromGuide, setAccent, resetAccent, replay, finish, addCouple, consumeArrival, skip, reset]
  )

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      {hydrated && (step === 'welcome' || step === 'theme') && (
        <GuideDialog
          step={step}
          accent={accent}
          onAccent={setAccent}
          onNext={step === 'welcome' ? start : finishTheme}
          onSkip={skip}
        />
      )}
      {hydrated && step === 'coach' && <CoachMark onSkip={skip} onFinish={finish} />}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used inside <OnboardingProvider>')
  return ctx
}
