// A file in public/, with the site's base path in front. On GitHub Pages the
// site lives under /vue, and a plain <img src="/photos/x.jpg"> would miss it.
// next.config.mjs reads the same NEXT_PUBLIC_BASE_PATH.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ''

export const asset = (path) => `${BASE}${path.startsWith('/') ? path : `/${path}`}`

/**
 * The photos and product screenshots the welcome, sign-in and portal pages
 * use. Photos are from Unsplash (free under the Unsplash License, credited
 * in public/photos/CREDITS.md); screenshots are of Vue itself.
 */
export const PHOTOS = {
  hero: { src: asset('/photos/hero-event-space.jpg'), alt: 'An event space set for dinner, warm light on round tables' },
  banquet: { src: asset('/photos/venue-banquet.jpg'), alt: 'A banquet hall with chandeliers and round tables' },
  conference: { src: asset('/photos/venue-conference.jpg'), alt: 'A conference hall with round tables facing three screens' },
  concertHall: { src: asset('/photos/venue-concert-hall.jpg'), alt: 'A concert hall stage under spotlights' },
  manager: { src: asset('/photos/people-manager.jpg'), alt: 'A venue manager setting tables in a bright dining room' },
  staff: { src: asset('/photos/people-staff.jpg'), alt: 'A server lining up glasses before guests arrive' },
  closing: { src: asset('/photos/closing-reception.jpg'), alt: 'A reception room glowing in warm evening light' },
  // The venue's own photography (supplied by the team; see CREDITS.md).
  exteriorDusk: { src: asset('/photos/venue-exterior-dusk.jpg'), alt: 'The venue at dusk, lit from inside' },
  exterior: { src: asset('/photos/venue-exterior.jpg'), alt: 'The venue: a timber barn with a stone wing' },
  candles: { src: asset('/photos/detail-candles.jpg'), alt: 'A table set with candles, white flowers and gold chargers' },
  receptionHall: { src: asset('/photos/venue-reception-hall.jpg'), alt: 'A timber reception hall set with round tables and flowers' }
}

/**
 * A small cover photo for each event card, so events are told apart at a
 * glance. Sample events have their own; any other event gets the pavilion.
 */
const EVENT_THUMBS = {
  'evt-1001': '/photos/thumbs/event-reception-greenery.jpg',
  'evt-1002': '/photos/thumbs/event-table-florals.jpg',
  'evt-1003': '/photos/thumbs/event-chandelier.jpg'
}
export const eventThumb = (event) => asset(EVENT_THUMBS[event.id] || '/photos/thumbs/event-open-pavilion.jpg')

export const SCREENS = {
  dashboard: asset('/screens/dashboard.jpg'),
  staffing: asset('/screens/staffing.jpg'),
  phone: asset('/screens/phone-tasks.jpg')
}
