# Auto Kosova Import

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
Motion · TypeScript. Encar is called straight from server components in
`lib/encar.ts` — no API routes, no separate backend, no CORS.

## Where the data comes from

There is **no official Encar API**. This uses the internal JSON endpoints that
encar.com's own frontend calls. They need no token, cookie or special headers.

| | |
|---|---|
| search | `api.encar.com/search/car/list/premium?count=true&q=<dsl>&sr=\|<sort>\|<offset>\|<limit>` |
| makes / models | same host + `&inav=\|Metadata\|Sort` — filter facets with live counts |
| detail | `api.encar.com/v1/readside/vehicle/{id}` |
| images | `https://ci.encar.com` + the photo path |
| FX | `open.er-api.com/v6/latest/KRW`, cached 1h, hardcoded fallback |

### The `q` filter DSL

Clauses join with `._.`; the expression closes with `.)`. **That trailing dot is
required** or the response body comes back empty.

    (And.Hidden.N._.CarType.N._.SellType.일반._.Year.range(202601..)._.Manufacturer.BMW._.ModelGroup.X5.)

- `CarType.N` = imported · `Year` is `YYYYMM` · `Price` is 만원 (10k KRW)
- Sort keys: `ModifiedDate`, `PriceAsc`, `PriceDesc`, `MileageAsc`,
  `MileageDesc`, `Year`. Plain `Price` is rejected. Page size caps at 200.
- An `Or` branch only works when the whole expression is nested — flattening it
  into the base `And` silently returns nothing:

      (And.(And.<base>.)_.(Or.Manufacturer.BMW._.Manufacturer.벤츠.))

- Mercedes is **`벤츠`**, not `메르세데스-벤츠` (which returns 0).

## Data quirks this app works around

- **Lease and rent listings quote the wrong price.** For `SellType` 리스/렌트,
  `Price` is a takeover or deposit figure, not the car's price — a 2026 BMW i5
  shows up at about €700. The base query pins `SellType.일반`, cutting the 2026
  imported pool from 2,799 to 1,746 but making every price mean the same thing.
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
- **Text search is client-side over a window.** Encar has no free-text
  parameter, so the search box scans the first 200 results of the current filter
  and substring-matches. The UI says so.
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
