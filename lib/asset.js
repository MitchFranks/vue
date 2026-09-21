// Prefixes a /public path with the deploy base path. next/image and <Link>
// handle this on their own; plain <img> and CSS backgrounds do not.
export function asset(path) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${path}`
}
