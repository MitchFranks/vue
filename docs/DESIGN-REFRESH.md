# Design refresh: premium hospitality × operations software

Nov 2026. The goal: look custom-designed, calm and classy, with less text, and fit venues of every kind, not just weddings. Every feature, page, link and button works as before. The content is the same except where wording said "wedding" or "couple" about venues in general.

## What changed

| Area | Change | Where |
|---|---|---|
| **Welcome page** | Rebuilt as an editorial page. A full-screen hero cross-fades between four kinds of venue (event space, banquet hall, conference hall, concert hall). Headlines are large serif. The **real** dashboard and a staff member's phone rise over the hero's edge. How it works is three numbered steps without cards. What's inside is a list of links beside the real Staffing Planner. Three tall venue photos read Celebrations, Conferences, Performances. Who it's for is two editorial photos. The closing photo has a light parallax. | `components/Landing.jsx` |
| **Motion** | Blocks fade up as they scroll into view, the hero photos cross-fade slowly, background photos move a little slower than the page, and the header turns solid once you scroll. It is all switched off for people who ask their device for reduced motion. | `components/marketing/Motion.jsx` |
| **Sign-in** | Split screen: a venue photo with the wordmark on the left, the same three cards on the right. "Try the demo" and "Open the demo" are unchanged, because the survey names them. | `components/account/AuthLayout.jsx` |
| **Client portal and inquiry form** | A photo band at the top of the client's home screen (candles and flowers) and the inquiry form's first screen (the venue). | `components/inquiry/InquiryFrame.jsx` (`cover`) |
| **Event cards** | Each event card (Dashboard, Events) has a cover photo on the left, so events are told apart at a glance. | `components/events/EventCard.jsx`, `lib/asset.js` (`eventThumb`) |
| **Type** | Instrument Serif for display headings only: page titles, modal and portal titles, the wordmark and the welcome page. Geist stays for everything else. | `app/layout.jsx`, `app/fonts/`, `app/globals.css` (`--font-display`, `text-hero`, `text-headline`) |
| **Toasts** | They moved to the bottom-right on wider screens, so the 10-second Undo messages never sit over the page's own buttons. | `components/ui/ToastHost.jsx` |
| **Wording** | Welcome page: "before the wedding" became "before the event", "couple" became "client", and the event types now say "weddings, galas, conferences and shows". The page title is "Vue — Venue Operations", and the Events page reads "Every event at your venue." The sample data (the Johnson Wedding and others) is unchanged, because the user tests depend on it. | `components/Landing.jsx`, `app/layout.jsx`, `app/login/page.jsx` |

## Photos and screenshots

- **Photos** come from two places, both in `public/photos/` with credits in `public/photos/CREDITS.md`:
  - **Unsplash:** seven photos, free under the Unsplash License (the hero, the venue types, the people, the closing).
  - **The team:** eight of the venue's own photos. They're used on the sign-in page, the inquiry form, the client portal, the "Celebrations" photo and the hero slideshow. Smaller cover photos for the event cards are in `public/photos/thumbs/`. Confirm we have permission before the site is used beyond the class.

  Everything is used through `PHOTOS` and `eventThumb` in `lib/asset.js`, which adds the GitHub Pages base path.
- **Screenshots** are real captures of Vue in `public/screens/`. Retake them after a big design change, following `public/screens/README.md`.

## Rules the redesign follows

- One idea per section, and fewer words: any line that didn't make the page clearer was cut.
- Real product and real places instead of icons and illustrations.
- No gradients for decoration (only dark washes so white type reads on photos), no glass, no badges, and no grids of cards on the welcome page.
- One way in ("Open Tasks") everywhere, as before.
