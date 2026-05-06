# Product

## What this is

Vinyl Traffic is a small record-dispatch operation working out of an industrial unit in Budapest. We hold a curated stockroom of around three hundred records — limited pressings, white labels, test pressings, original first pressings, and a handful of in-house reissues — and ship them across Europe and beyond.

We are not a shop. We don't have a sales floor, a counter, or a sign on the gate. The unit is open by appointment, weeknights between 22:00 and 05:00, and most of our orders are placed by people who have never been to the unit and never will.

This document defines what Vinyl Traffic is online — the website, the catalogue, and the public artefacts that surround them. It is the source of truth for product decisions. Anything not specified here defaults to the unit's voice and judgement as established in `sdd/context/voice.md` and `sdd/context/design-system.md`.

## Who we are

Vinyl Traffic Kft. is a Hungarian limited company registered at Soroksári út 158, 1095 Budapest, in the post-industrial stretch of District IX. The operation is run by a small team — never more than eight people on site at once — that works overnight shifts. We came together through Budapest's underground music scene and still think of ourselves as adjacent to it rather than separate from it.

We are nocturnal because most of us have day jobs or other projects. The unit opens at 22:00 and the last person leaves before 05:00. Outgoing parcels are handed to the first courier of the morning at 09:00, by which time the unit is closed. This rhythm shapes everything about how we operate, and it should shape how the website behaves: the running totals on the homepage are tonight's totals, the dispatch sheet is the night shift's work, the Friday note is sent at sunrise.

## Audience

Our customers are people who care about specific records more than they care about convenience. They are spread across Europe, with concentrations in Berlin, London, Vienna, Brussels, Lisbon, Warsaw, and Tokyo, and they typically come to us through word of mouth, the Friday note, or a referral from another dealer.

Three audience traits the site is built around:

They know what a test pressing is. They know what "VG+" means. They don't need explanations of formats, conditions, or pressing-plant lineage. The site should not condescend by explaining things they already understand.

They are comfortable paying in cryptocurrency. This is a constraint they have either accepted or sought out. We don't argue for crypto on the site, justify it, or apologise for it.

They are not in a hurry. Records ship in the morning after they're ordered, sometimes the morning after that. People who need next-day delivery are not our audience.

## What we sell

The stockroom holds around three hundred records at any given time, grouped on six racks (A through F) by a system known to staff and not particularly visible to visitors. The mix shifts week to week but always includes:

Limited and small-press releases — recent records pressed in runs of fifty to a few thousand, mostly from European labels. New arrivals each week.

White labels and hand-stamped pressings — unmarked, unattributed, or partially-attributed records, usually one-offs or short runs from labels that don't always announce themselves.

Test pressings — one-of-a-kind or near-one-of-a-kind early proofs, sometimes signed.

Original first pressings of older records, held in a separate part of the stockroom referred to internally as Under the Counter. These are not advertised publicly and are available on request to people who know to ask.

In-house reissues. A small number of records we have brought back ourselves, mastered at Dubplates & Mastering Berlin and pressed at Pallas in Diepholz. Numbered editions of two hundred to five hundred. Released under the imprint VT Editions.

We do not stock new mainstream releases, anything available everywhere else, or anything we don't personally vouch for. The stockroom is small on purpose.

## What the website is for

The website is the unit's public surface. It exists to do five things:

Show what's currently in the stockroom, so people can see what we have without emailing us first.

Show what's going out, so customers expecting a parcel can see their order in tonight's dispatch sheet, and so the operation feels visibly active.

Show what's coming in, so the Friday note has somewhere to point and the rhythm of the operation is legible.

Provide a way for customers to express interest in a record. We reply by email with a wallet address and shipping confirmation. The site itself does not handle payment.

Maintain the Friday note signup, which is how most of our customers found us and how we keep them.

The site is not a self-service checkout. There is no cart, no account system, no shipping calculator, no automated invoice. Every order is placed by email and settled out-of-band. This is a deliberate operational choice, not a missing feature.

## How we operate

A few operational facts that shape the website's behaviour and should be visible to anyone reading the site.

**Hours.** The unit is open 22:00 to 05:00 CET, Monday through Saturday, with Wednesday and Sunday off for the people who need them. We answer email between those hours and respond to next-day enquiries the next night.

**Payment.** We accept Bitcoin, Ethereum, USDC, and Monero. Wallet addresses are sent per order, not posted publicly. We do not accept card payments, bank transfers, PayPal, or cash on delivery. We will accept cash in person if you collect from the unit, but you must make an appointment.

**Shipping.** GLS for parcels within the EU, DHL for everything else, Magyar Posta for low-value packets where speed doesn't matter. All international shipments go out with proper customs declarations. We do not under-declare value, mislabel contents, or otherwise manipulate paperwork. Customers in countries with restrictive import regulations are responsible for their own clearance.

**No returns, no refunds.** Every record is described accurately before purchase. Condition reports are available on request. Once a record has shipped it is yours. The exception is a record that arrives damaged in transit — we will refund or replace once the courier's investigation is complete.

**Privacy.** We do not run analytics, set tracking cookies, or share customer email addresses. The Friday note list lives on a single spreadsheet on a single laptop. We log enough of each order to fulfil it and to satisfy the Hungarian tax authority. We delete what we don't need.

## Voice

The unit writes the way the unit talks: dry, terse, occasionally funny, never marketing-inflated. We do not say "passionate about vinyl." We do not say "curated experience." We do not say "we" when "we" is corporate-we; we say "we" when it's the people on shift tonight.

Detailed voice guidance lives in `sdd/context/voice.md`. Two principles worth restating here because they shape product decisions directly:

The expertise is in the content, not the chrome. We use real format codes (12", 33⅓, TP, W/L), real condition vocabulary (NM, VG+), real pressing-plant references (Pallas, Optimal, Record Industry), real label adjacencies (Ostgut Ton, L.I.E.S., The Trilogy Tapes). We do not gloss these terms for outsiders. People who don't know what TP means are not yet our audience.

Restraint reads as confidence. We do not oversell records. We tell people what a record is, what condition it's in, how many we have, and what it costs. The record does the rest.

## Visual identity

The unit's visual identity is photocopy-paper light, packing-tape orange, typewriter type, and rubber-stamped accents. It is shabby on the outside and serious on the inside — the page should look like documents on a working desk in an industrial unit, not like a designed website.

Detailed token definitions, type system, and stamp specifications live in `sdd/context/design-system.md`. Two principles worth restating here because they shape product decisions:

Every page is a form. The homepage is a dispatch sheet. The stock pages are inventory cards. The Friday-note archive is a folder of typed notes. The find-us page is a printed slip. Form-as-template is the unifying frame and most of the site falls out of it directly.

Sleeve art is typographic. We do not use photographs of records on the site. Each record's sleeve is rendered as a typographic composition derived from the record's metadata. This is a working constraint, not a placeholder, and it is consistent with how the unit catalogues stock internally.

## Non-goals

Things Vinyl Traffic explicitly does not do, and the website should not invite:

- We do not sell new releases available through normal retail channels.
- We do not run a self-service checkout, cart, or account system.
- We do not accept card payments, bank transfers, or third-party payment processors.
- We do not ship next-day, same-day, or by courier on demand.
- We do not authenticate records on behalf of third parties.
- We do not accept consignments without prior arrangement.
- We do not run paid advertising, affiliate programmes, or referral schemes.
- We do not publish our home addresses, our phone numbers in full, or photos of staff.
- We do not photograph the Under the Counter stock.
- We do not give estimates by chat, comments, or social media DM. Email only.

These are operational constraints, not future features waiting to be built.

## Success criteria

Vinyl Traffic is successful online when:

A returning customer can see at a glance what is new in the stockroom this week and place an order by email within five minutes.

A new visitor lands on the homepage and, without scrolling past the dispatch sheet, knows what we are, where we are, what we sell, and how to buy from us.

The Friday note continues to be the primary acquisition channel.

We never have to apologise for, explain away, or work around a feature we shouldn't have built.

The website continues to feel like a real working operation a year after launch — not like a demo that has aged.
