# Auto Kosova Import

Live: **https://autokos-cars.vercel.app**

Next.js storefront for a Korea → Kosovo car import business. Live 2026 stock
from Encar, priced in euro.

    npm install
    npm run dev        # http://localhost:3100

| Route | What it is |
|---|---|
| `/` | Marketing homepage — hero from live stock, 10 random cars, sections, contact band |
| `/cars` | Full listing: left sidebar, filter bar, sorting, pagination |
| `/car/[id]` | One car: specs, euro price, photo gallery with modal |
| `/contact` | Enquiry form and how importing works |

**Stack**: Next 16 (App Router) · React 19 · Tailwind v4 · shadcn/ui (Base UI) ·
Motion · TypeScript. No API routes and no separate backend.

## How the stock is fetched

**Everything comes from the browser.** Nothing in this app fetches stock on the
server.

Encar drops `/search/car/list/*` and `/v1/readside/vehicle/*` at the network
layer for datacenter egress — no HTTP response at all, the connection dies in
~50ms. Measured from Vercel, roughly 2 requests in 15 get through. No request
header changes this, because the connection closes before anything is parsed.

It serves browsers normally, reflecting the request Origin and allowing
credentials. So a server attempt was only ever a slow round-trip that usually
failed before the browser retried anyway — the page shell now ships
immediately and the client fetches:

| | Where it runs |
|---|---|
| Listings, facets, car details, counts | browser (`components/Client*.tsx`) |
| Currency rate | server — `open.er-api.com` is not blocked, cached 1h |

`lib/encar-shared.ts` holds the query building and normalising. Photos skip
`next/image` and come straight from Encar's CDN at the size requested, since
the optimiser would put a server hop in front of every image for a catalogue
far too large to cache usefully.

The cost is SEO: crawlers see an empty listing grid. Licensed access or a
vendor feed would allow server rendering to return.

## Data quirks this app works around

- **Lease and rent listings quote the wrong price.** For `SellType` 리스/렌트,
  `Price` is a takeover or deposit figure, not the car's price — a 2026 BMW i5
  shows up at about €700. The base query pins `SellType.일반`, cutting the
  imported pool roughly in half but making every price mean the same thing.
- **Photos repeat within a listing.** One car returned 24 photos of which 18
  were distinct, so `/car/[id]` dedupes by URL.
- **Encar returns duplicate listings** — the same car under different ids, some
  flagged `ServiceCopyCar: "DUPLICATION"`. Not deduped, since the ids differ and
  collapsing them is not obviously safe.
- **Some listings use a dealer placeholder image** ("상품화 준비중" — being
  prepared for sale) instead of a real photo. There is no metadata flag for this,
  so it cannot be filtered reliably.

## Known limits

- **Model and trim names are transliterated, not translated.** English names
  exist only on the per-car detail endpoint, so showing them on listings would
  mean one extra request per card. Instead `lib/i18n.ts` maps the Korean terms
  that actually occur in the data (sampled from live stock — only ~60 distinct
  terms) to English. Unmapped terms pass through unchanged rather than mangled.
- **Text search scans a window.** Encar has no free-text parameter, so the
  search box pulls the first 200 results of the current filter and
  substring-matches. The UI says so.
- **Options are not shown.** The detail endpoint returns bare numeric codes
  (`001`…`097`). The only named catalogue found — 62 options in the filter
  metadata — is a *different* list the codes do not index into, so rather than
  guess at labels, v1 omits them.
- **The contact form does not send anything.** It validates and shows a success
  state; wire `components/ContactForm.tsx` to an email service or route handler.

## Before going live

- These endpoints are undocumented and can change or start requiring auth
  without notice. Nothing here is a stable contract.
- Encar's [robots.txt](https://www.encar.com/robots.txt) disallows `/cars/` and
  `/dc/dc_cardetailview.do`. The API being open is an implementation detail, not
  permission for bulk access.
- **The detail response carries personal data** — `vin`, `vehicleNo` (plate),
  and dealer names, phone numbers and addresses. This app renders none of it,
  but it is in the fetched payload. Korea's PIPA applies: do not log, cache or
  persist those fields.
- Contact details in `lib/site.ts` are placeholders. Replace before launch.
- Keep request volume low. A commercial operation needs licensed access through
  Encar's 제휴 (partnership) programme.
