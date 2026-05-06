# Glossary

This document locks the project's vocabulary. When agents and humans use the same words to mean the same things, less drifts in translation.

Terms are grouped by category, alphabetical within each category. Where a term has a forbidden synonym — a word that means something similar but that we deliberately do not use — the entry ends with **Not:** and the alternatives. Where this glossary differs from common industry usage, the glossary takes precedence inside this project.

When in doubt, search this file before introducing a new term. When introducing a new term that is not in this file, add it.

## The operation

**Bay 2** — A specific area inside the unit, used for receiving and unboxing new arrivals. Referenced occasionally in copy ("boxes from Pallas got here Tuesday and we're still working through Bay 2"). Not a separate building.

**Bay 3** — The dispatch area inside the unit. Where the unit's address resolves to.

**Kft.** — A Hungarian limited liability company. Vinyl Traffic Kft. is the legal entity. Used in the footer and on legal pages; not used in body copy.

**The night lot** — Informal collective for the people on shift overnight. Used in newsletter signoffs ("J + the night lot"). Roughly equivalent to "the team" but specific to whoever is in tonight. Not: the team, the staff, the crew.

**Soroksári út** — The road the unit sits off, in District IX of Budapest. Real road. Number 158 is fictional.

**The stockroom** — The interior space of the unit where records are held before dispatch. Used both in the literal sense (the physical room) and as the name of the homepage's main browsing surface. The collective noun for what we have: "around three hundred records in the stockroom." Not: shop, store, showroom, sales floor.

**The unit** — The building. A single industrial unit at Bay 3, Soroksári út 158, Budapest IX. Always "the unit" in the singular and always with the article.

**Under the Counter** — The confidential part of the stockroom, holding records that are not advertised on the public catalogue. Originally a literal location inside the unit; on the site, also the name of the homepage section that surfaces the existence (but not the details) of these records. Always capitalised. Not: the vault, the back room.

**Vinyl Traffic** — The full informal name. Vinyl Traffic Kft. is the legal entity. Used everywhere — masthead, copy, conversation. Not abbreviated to "VT" except in catalogue codes (VT-26-NAT-0847) and the imprint name (VT Editions).

**VT Editions** — The unit's in-house imprint. Records we have brought back ourselves, mastered at Dubplates & Mastering and pressed at Pallas. Always two words, capitalised. Not: VT Records, VTR.

## Records and stock

**Acetate** — A one-of-a-kind cut, usually as part of mastering proofs. Sometimes the only surviving copy of a record. Listed in stock as `format: acetate`.

**Catalogue ID** — The unique identifier for a stock entry, of the form `VTR-STK-NNNN` (general stock) or `VTR-CTR-NNNN` (Under the Counter). Sometimes called "VT code" in body copy. Always in monospace on the site. Not: SKU, product ID, item number.

**First pressing** — The original initial run of a record, as opposed to a reissue or repress. Significant in collector terms; affects price and condition assessment. Recorded explicitly when known.

**Format** — The physical configuration of a record: LP, 12", 10", 7", EP, TP, W/L, acetate. Industry-standard codes; we use them as written. See *Format codes* below.

**Pressing** — A specific manufacturing run of a record. A record may exist in multiple pressings; first pressing, second pressing, repress, etc. Pressing plant references (Pallas, Optimal, Record Industry) are recorded where known.

**Provenance (record sense)** — A specific record's history of ownership and condition. Distinct from `provenance.md` (the SDD methodology artefact). Both are valid uses; context disambiguates.

**Rack** — A physical shelving unit inside the stockroom. Six racks, A through F, each holding a different category of stock. Each rack has its own YAML file under `sdd/content/racks/`. Stock entries reference their rack by letter (`rack: A`).

**Record** — The product unit. A physical disc (or sometimes a multi-disc set) we sell. Always "record" in the singular. The plural is "records" except when referring to the medium collectively, where "vinyl" is acceptable. Not: item, product, listing, piece.

**Reissue** — A reprint of an older record, usually pressed by a label other than the original. Distinguished from a repress (same label, later run). Recorded in stock entries as `pressing: reissue` with the year.

**Repress** — A subsequent run of a record by the same label that originally released it. Distinguished from a reissue. Recorded in stock entries as `pressing: repress`.

**Sleeve** — The square visual representation of a record on the site. We do not photograph sleeves; we render them as typographic compositions derived from the record's metadata. See `sdd/context/design-system.md` and the forthcoming `sdd/context/sleeves.md`. Not: cover, jacket, artwork.

**Stock** — The collection of records currently in the unit. Both a count noun ("we have three hundred in stock") and a mass noun ("the stock turns over weekly"). Not: inventory, catalogue (the catalogue is the *site*; the stock is the *records*).

**Stock entry** — A YAML file under `sdd/content/stock/` describing one record. The data layer for that record on the site.

**Stock card** — The rendered page for a single record, derived from the stock entry. The presentational layer.

**Test pressing (TP)** — An early proof of a record, usually pressed in very small numbers (one to a few dozen) before the full run. Highly collectable. Listed in stock as `format: test-pressing` or `format: TP`.

**White label (W/L)** — A record with no printed label or with only minimal hand-stamped information on the centre label. Often unattributed or partially attributed. Listed in stock as `format: white-label` or `format: W/L`.

## Format codes

Industry-standard format codes, used unchanged. Listed for completeness so agents recognise them in stock entries.

| Code  | Expansion                          |
| ----- | ---------------------------------- |
| LP    | Long-playing record (full album)   |
| 12"   | Twelve-inch single or EP           |
| 10"   | Ten-inch (less common format)      |
| 7"    | Seven-inch single                  |
| EP    | Extended play (length, not size)   |
| TP    | Test pressing                      |
| W/L   | White label                        |
| 2×LP  | Double LP                          |
| 3×LP  | Triple LP                          |
| 33⅓   | Standard LP playback speed (rpm)   |
| 45    | Standard 7" / 12" single speed     |

## Condition grades

The Goldmine grading system, used unchanged. Two grades may be given (sleeve / vinyl) when they differ.

| Code  | Grade               | Meaning                                                        |
| ----- | ------------------- | -------------------------------------------------------------- |
| M     | Mint                | Sealed, never played, perfect.                                 |
| NM    | Near Mint           | Effectively unplayed, no visible wear.                         |
| VG+   | Very Good Plus      | Light wear, plays cleanly, minor cosmetic flaws.               |
| VG    | Very Good           | Visible wear, plays through with surface noise.                |
| G+    | Good Plus           | Significantly worn, plays but noisy.                           |
| G     | Good                | Heavily worn, only for very rare records.                      |
| P     | Poor                | Damaged, listed for completeness only.                         |

## Operations and dispatch

**Cleared** — A record that has been packed, paid for (on-chain confirmation received), and is ready for the morning courier. Status value in dispatch listings.

**Customs declaration** — The paperwork accompanying international shipments. We file proper declarations; we do not under-declare value. Customers in countries with restrictive import regulations are responsible for their own clearance.

**Customs hold** — A record awaiting customs clearance. May refer to ours (DHL has flagged a parcel for inspection) or theirs (the destination country's customs is reviewing). Status value: `held`.

**Dispatch** — The process of sending records out. The dispatch happens once a day, in the morning, when the night shift hands over to the courier. Used as a noun ("tonight's dispatch") and a verb ("we dispatched seven on Tuesday").

**Dispatch sheet** — The list of records going out tomorrow morning, displayed on the homepage. Generated each shift from active orders.

**Held** — Status value for a record awaiting clearance, payment, or some other unresolved condition. See *Customs hold*.

**Incoming** — Records arriving this week. The opposite of outgoing. Sometimes the homepage shows an "Incoming" section.

**Manifest** — Loosely used for "what's currently in the system." On the homepage, sometimes the top section is labelled "Today's Manifest" — meaning today's running totals. Less formal than dispatch sheet.

**Outgoing** — Records leaving today (or tonight, in the unit's rhythm). Often paired with a dispatch sheet on the homepage.

**P.O.A. / POA** — Price On Application. Used for records where we don't post a public price — usually Under the Counter items. The entry shows "P.O.A." in italic where the price would be. Email for details.

**Queued** — Status value for a record that has been packed but not yet handed to the courier. Distinct from cleared.

## Shipping

**DHL** — Default carrier for non-EU shipments and anything that needs tracking and a customs declaration. Pickup at 09:30.

**GLS** — Default carrier for EU shipments. Pickup at 09:00. Most outgoing parcels go this way.

**Magyar Posta** — Hungarian national post. Used as a last resort for low-value packets where speed doesn't matter and tracking isn't critical.

**Pickup** — The morning courier collection. Always 09:00 (GLS) and 09:30 (DHL). The night shift hands the packed parcels over and goes home.

**Tracking** — A reference number assigned by the courier. Always issued; sometimes shared with the customer by reply email rather than displayed on the site.

## Payment

**BTC** — Bitcoin. One of four accepted currencies.

**ETH** — Ethereum. One of four accepted currencies.

**On-chain confirmation** — Verification that a payment has cleared on the relevant blockchain. We confirm on-chain before packing, not before pricing. Mentioned on the dispatch sheet typed note.

**USDC** — USD Coin, a USD-pegged stablecoin on Ethereum. One of four accepted currencies. Useful when customers prefer dollar-denominated stability.

**VAT** — Value Added Tax. Hungarian VAT is 27%, included in displayed prices for domestic and EU customers. Non-EU customers see prices excluding VAT.

**Wallet address** — A blockchain destination address for receiving payment. Generated per order and sent by reply email. Never posted publicly on the site.

**XMR** — Monero. The privacy-focused option among the four accepted currencies. We accept it without comment.

## People

**Customer** — The person we ship to. The closest thing the unit has to a "user" word, but we use it sparingly — most copy refers to "the people we send records to" or simply uses the second person ("you"). Not: client, user, buyer, member.

**Courier** — Two senses, both in use:
1. The companies that collect parcels each morning: GLS, DHL, Magyar Posta.
2. The unit's own staff personae — Marta Szabó on the North Atlantic route, Adrian Ptak on Continental, etc.
The two senses do not collide in practice — context disambiguates. Inside the unit, "courier" without qualification usually means our staff; on the dispatch sheet, it means the parcel carrier.

**J** — The unit's coordinator. Sometimes signs off on the Friday note. The full name is not published. Not all unit voice carries J's voice, but the Friday note generally does.

**Persona** — A staff identity with a declared taste profile (route, genre preferences, signature blurb cadence). Each persona is a YAML file under `sdd/content/couriers/`. Personas pick records and write blurbs; the site renders their picks.

## Site sections and UI

**Docket strip** — The very top of every page, before the masthead. A thin status bar showing the date, the unit's open status, the shipment reference, and other metadata. Always set in JetBrains Mono.

**Friday note** — The unit's weekly newsletter, sent at sunrise on Friday morning. Plain text, sent via Buttondown. The current note is sometimes featured on the homepage; previous notes are archived under `/notes/`. Not: bulletin, dispatch, briefing, weekly. The Friday note is the Friday note.

**Manifest section** — On the homepage, the running-totals block (outgoing today, in stockroom, new this week, held). Loosely a synonym for "today's numbers."

**Masthead** — The block at the top of every page containing the wordmark, the tagline, the unit's address, and the masthead stamps. Set apart visually from the docket strip by typographic weight.

**Sharpie annotation** — A handwritten-style mark on the page (a "3 LEFT" scrawl, a tick, a SOLD ribbon) rendered in Permanent Marker font. Used at most three times per page. See `sdd/context/design-system.md` for construction rules.

**Stamp** — An outlined-rectangle UI element with stencil caps inside, slightly rotated, in ink, orange, or red. Used to label, status, or warn. See `sdd/context/design-system.md` for construction rules.

**Tape** — Translucent yellow rectangles representing masking tape. Used to "fix" a piece of paper to the page (typically the Friday Note). Used very sparingly. See `sdd/context/design-system.md` for construction rules.

**Wordmark** — The "VINYL TRAFFIC" mark in the masthead, set in Anton inside an outlined rectangle, slightly rotated, with a double-edge ink-bleed effect. The single most identifiable element of the site. Defined fully in `sdd/context/design-system.md`.

## Time and rhythm

**Friday note** — See *Site sections*.

**Pickup** — See *Shipping*.

**Tonight** — The current night shift, 22:00 onwards. The homepage's running totals are tonight's totals; the dispatch sheet is tonight's work. Not: today (the unit's working day is a night).

## SDD methodology

**Acceptance criteria** — The checkbox list at the end of every feature spec, declaring what "done" means. Validated by Playwright tests, build-time checks, and QA review of `provenance.md`. See `sdd/context/architecture.md`.

**Bootstrap** — The initial toolchain stage of the project, delivered by `sdd/specs/vite-baseline/`. Subsequent specs evolve away from the bootstrap toward the architecture described in `sdd/context/architecture.md`.

**Content corpus** — The data under `sdd/content/` (stock, racks, notes, under-counter, pages). The closest thing this project has to a database. Edited as files in the repository.

**Context** — The ambient documents under `sdd/context/` (product.md, architecture.md, design-system.md, glossary.md, voice.md, sleeves.md). Loaded by agents on every run as background reading.

**Feature spec** — A specification under `sdd/specs/<feature>/spec.md` describing one piece of work an agent can implement. Always paired with a `provenance.md` (audit trail) and usually a `<feature>.spec.ts` (Playwright test).

**Provenance (SDD sense)** — The audit trail produced by an agent after implementing a spec. Lives at `sdd/specs/<feature>/provenance.md`. See `sdd/context/architecture.md` under *Provenance*. Distinct from a record's provenance (history of ownership).

**spec** — Short for *specification*. Refers to either:
1. A feature spec (`sdd/specs/<feature>/spec.md`), or
2. A Playwright test file (`*.spec.ts`).
Context disambiguates. The Markdown spec is the one usually meant in conversation; the test file is usually called "the test" rather than "the spec."

**spec.md** — The canonical specification file for a feature. The primary input to an agent run.

**static-build** — The forthcoming feature spec at `sdd/specs/static-build/` that introduces the corpus-driven build pipeline (the `build/build.ts` script, the content loader, the template-literal renderer). Replaces vite-baseline's "single root index.html" with multi-page output. Until it lands, the project is at the bootstrap stage.

**Validation triangle** — The three artefacts that together validate a feature spec: `spec.md` (intent), `<feature>.spec.ts` (machine-checked assertions), `provenance.md` (audit trail). Defined in `sdd/context/architecture.md`.

**vite-baseline** — The first feature spec, at `sdd/specs/vite-baseline/`. Establishes the toolchain (pnpm, Vite, TypeScript, plain CSS, multistage Dockerfile, nginx on port 8080). Superseded by static-build for application shape; persists for toolchain.

## Words we don't use

The following words and phrases do not appear in unit-facing copy. Each entry gives the preferred alternative.

**Add to cart, buy now, shop now, browse, checkout** — there is no checkout. "Email us" is the only call to action.

**Browse** — "see what's in the stockroom," or just no verb. The stockroom is shown, not browsed.

**Catalogue (as a verb)** — "we list," "we hold," "we have." We do not "catalogue" a record; we add a stock entry.

**Client** — "customer," or no word.

**Curated** — say what you mean. "We hold around three hundred records." "The stockroom is small on purpose." Not "our curated selection."

**Customer journey** — never used. The unit has no journey; the unit has records and an email address.

**Discover, find, explore** — too marketing-inflated. Use plain verbs: "see," "look at," "read."

**Exclusive, limited time, while stocks last** — never used. We say what we have ("twelve copies"), never urgency-frame.

**Inventory** — "stock."

**Item, listing, piece, product, SKU, unit (in the SKU sense)** — "record," "stock entry," or specific format ("LP," "12 inch").

**Luxury, premium, high-end** — never used. The records do the work.

**Member, account holder, registered user** — there are no accounts. The customer is just the customer.

**Passionate about vinyl, vinyl enthusiasts, music lovers** — never used. Aspirationally describing customers patronises them.

**Sale, discount, promotion, offer** — we do not run sales. Prices are prices.

**Shop, store, retailer, showroom, sales floor** — "the unit," "the stockroom." We are not a shop.

**User** — "customer," or no word. "Users" implies software; we sell records.

**Welcome to** — never used. The page does not greet; it shows.
