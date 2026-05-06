# Vision

An early mockup of the site, drawn up before we'd settled the details. Kept here as a reference for what we're going for.

## What this is

`vision.html` is the first version of the site that felt right — not the homepage as it stands now, but the homepage as we sketched it before we'd worked out the rules. We kept it. The current site doesn't match this exactly, and shouldn't, but it should *feel* like this.

The mockup is a single static HTML file with its CSS inline. It does not connect to the rest of the site — it's not in the build, it's not on the live site, and it's not produced by any of our usual tooling. It exists as a fixed reference. Open it in a browser, look at it, then go back to whatever you were working on.

## Why we keep it around

The design system in `sdd/context/design-system.md` describes the rules — colours, type, spacing, the stamps and the tape and the Sharpie annotations, what we use and what we don't. Rules are useful. They don't quite tell you the *feeling*, though. The mockup tells you the feeling.

When someone new joins, or when we're arguing about whether a new section feels right, this is the file we open. If a proposed change makes the site look more like this mockup, that's usually a sign. If it makes it look less like this mockup, that's worth a conversation.

## How to read it

Treat the visual language as canonical: paper, ink, packing-tape orange, typewriter type, rubber-stamped accents, the specific way the masthead sits, the docket strip across the top, the manifest table, the Under-the-Counter band, the typed-letter-on-yellowed-paper Friday note. Where the mockup and the design system disagree on a detail, the design system is right — but tell us, because the difference is sometimes the design system catching up to the mockup, and sometimes the design system improving on it.

Treat the *content* as illustrative only. The records shown — Marit Vanderwall, Konstantin Kreyser, Komatsu Trio, the rest — were placeholder names while we worked out the visual language. The current stock is in `sdd/content/stock/`. The current couriers are in `sdd/content/couriers/` (forthcoming). The current Friday note voice is in `sdd/content/notes/`. None of the specific records, prices, or staff names in the mockup should be reproduced as fact on the live site.

## What to do with it

Don't update it. The mockup is a fixed point. When the live site evolves past it — and it will — that's correct. We don't keep redrawing the original; we let it stand as it was.

Don't link to it. It's not part of the public site. It lives under `sdd/reference/` because that's where we keep the working references that aren't for anyone outside the unit.

Don't reproduce it verbatim. The live homepage shouldn't be a copy of the mockup. It should be the mockup's grown-up version — same feeling, current content, refined details where we've learned better, expanded where the site needs more than the mockup showed.

## File

- [`vision.html`](./vision.html) — the mockup itself.
