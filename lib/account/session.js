// ---------------------------------------------------------------------------
// Accounts and sign-in.
//
// Every workspace belongs to one account. The demo account opens the sample
// venue (Willow Stone) with its sample weddings, staff and vendors; an account
// someone creates opens an empty workspace for their own venue.
//
// WHERE ACCOUNTS LIVE: this prototype is a static site with no server, so
// accounts and their data are kept in this browser's localStorage, with
// passwords stored only as salted PBKDF2 hashes. Everything a backend would
// do (create, find, check a password, start and end a session) goes through
// the functions below, so moving to a hosted auth service later means
// replacing this file, not the screens.
//
// Plain module on purpose (no React): lib/mock/scope.js reads which
// workspace is active when the sample data loads. Switching account reloads
// the page so every module starts again for the new workspace.
// ---------------------------------------------------------------------------

const ACCOUNTS_KEY = 'vue-accounts-v1'
const SESSION_KEY = 'vue-session-v1'

export const DEMO_ACCOUNT = {
  id: 'demo',
  demo: true,
  username: 'demo',
  password: 'demo', // shown on the sign-in page on purpose: anyone may open the demo
  email: 'dana@willowstone.example',
  name: 'Dana Whitcomb',
  title: 'Venue Manager',
  venueName: 'Willow Stone'
}

export const ACCOUNT_TITLES = ['Owner', 'Venue Manager', 'Administrator']

const hasStorage = () => typeof window !== 'undefined' && !!window.localStorage

function readJson(key, fallback) {
  if (!hasStorage()) return fallback
  try {
    return JSON.parse(window.localStorage.getItem(key) || 'null') ?? fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  if (!hasStorage()) return
  if (value == null) window.localStorage.removeItem(key)
  else window.localStorage.setItem(key, JSON.stringify(value))
}

/* -------------------------------------------------------------- accounts --- */

/** Accounts created in this browser (never includes the demo). */
export const listAccounts = () => readJson(ACCOUNTS_KEY, [])

export function accountById(id) {
  if (id === DEMO_ACCOUNT.id) return DEMO_ACCOUNT
  return listAccounts().find((a) => a.id === id) || null
}

const norm = (s) => String(s || '').trim().toLowerCase()

/** By email, or by username for the demo. */
export function findAccount(login) {
  const l = norm(login)
  if (l === DEMO_ACCOUNT.username || l === DEMO_ACCOUNT.email) return DEMO_ACCOUNT
  return listAccounts().find((a) => a.email === l) || null
}

/** The account as screens may show it: never the password hash. */
export function publicAccount(a) {
  if (!a) return null
  const { passwordHash: _h, salt: _s, password: _p, ...rest } = a
  return rest
}

/* ------------------------------------------------------------- passwords --- */

const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
const fromHex = (hex) => new Uint8Array(hex.match(/.{2}/g).map((h) => parseInt(h, 16)))

async function hashPassword(password, saltHex) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(saltHex), iterations: 120000 }, key, 256)
  return toHex(bits)
}

/** Resolves to the account when the login and password match, else null. */
export async function checkPassword(login, password) {
  const a = findAccount(login)
  if (!a) return null
  if (a.demo) return password === a.password ? a : null
  return (await hashPassword(password, a.salt)) === a.passwordHash ? a : null
}

/**
 * Create an account. Throws an Error with a user-facing message if the email
 * is taken. `details` = { name, title, email, password, venueName, venueType, phone }.
 */
export async function createAccount({ password, ...details }) {
  const email = norm(details.email)
  if (findAccount(email)) throw new Error('An account with this email already exists. Sign in instead.')
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)))
  const account = {
    id: `acct-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    ...details,
    name: details.name.trim(),
    venueName: details.venueName.trim(),
    email,
    salt,
    passwordHash: await hashPassword(password, salt),
    createdAt: new Date().toISOString()
  }
  writeJson(ACCOUNTS_KEY, [...listAccounts(), account])
  return account
}

/** Remove an account and every piece of its workspace data from this browser. */
export function deleteAccount(id) {
  if (id === DEMO_ACCOUNT.id) return
  writeJson(ACCOUNTS_KEY, listAccounts().filter((a) => a.id !== id))
  const suffix = `::${id}`
  for (const key of Object.keys(window.localStorage)) if (key.endsWith(suffix)) window.localStorage.removeItem(key)
}

/* -------------------------------------------------------------- sessions --- */

const sessionAccountId = () => readJson(SESSION_KEY, null)?.accountId || null

/** The signed-in account, read fresh (null when signed out or the account is gone). */
export const currentAccount = () => {
  const id = sessionAccountId()
  return id ? accountById(id) : null
}

/** Sign in and reload into the account's workspace. */
export function startSession(accountId, to = '/dashboard') {
  writeJson(SESSION_KEY, { accountId, at: new Date().toISOString() })
  window.location.assign(withBase(to))
}

/** Sign out and reload to the sign-in page. */
export function endSession(to = '/login') {
  writeJson(SESSION_KEY, null)
  window.location.assign(withBase(to))
}

/** Signed out? Sign in to the demo without a reload (the sample data is already loaded). */
export function ensureDemoSession() {
  if (!sessionAccountId()) writeJson(SESSION_KEY, { accountId: DEMO_ACCOUNT.id, at: new Date().toISOString() })
}

// Full reloads go around the router, so they need the deploy's base path.
const withBase = (path) => `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${path}`

/* ------------------------------------------------------------- workspace --- */

// Fixed for this page load (switching account reloads the page).
const ACTIVE = currentAccount()

/** The account whose workspace is loaded. Null on the server and when signed out. */
export const ACTIVE_ACCOUNT = publicAccount(ACTIVE)

/** True for the demo, and when signed out (the welcome page previews the demo). */
export const IS_SAMPLE_WORKSPACE = !ACTIVE || !!ACTIVE.demo

/**
 * The localStorage key for a store in the active workspace. The demo keeps
 * the original keys, so progress saved before accounts existed still loads.
 */
export const scopedKey = (base) => (IS_SAMPLE_WORKSPACE ? base : `${base}::${ACTIVE.id}`)
