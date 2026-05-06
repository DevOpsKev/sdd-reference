# Tech Sovereignty Radar

## Vision

An opinionated, periodically published radar that helps European technology leaders make sovereignty-aware decisions about their stack — what to adopt, trial, assess, or divest from — under the combined pressures of geopolitical exposure and vendor lock-in.

## Problem

European CTOs and architects increasingly need to factor sovereignty into stack decisions, but the signal is poor:

- Sovereignty pressures (CLOUD Act, Schrems II, GDPR, NIS2, DORA, the EU Data Act, the AI Act, evolving export controls) keep shifting the ground under technology choices that were straightforward five years ago.
- Lock-in risk has compounded as US hyperscalers moved up the stack into managed databases, identity, AI, and observability — making exit more expensive each year.
- Existing guidance is scattered across vendor PR, EU policy whitepapers, isolated blog posts, and procurement frameworks. None of it tells a CTO what to actually do on Monday.
- Generic technology radars ask "is this mature?" — a different question from "is this safe to depend on for a European business or institution over a five-year horizon?"

The result: sovereignty either becomes a checkbox exercise during procurement, or it is ignored until a regulatory or geopolitical event forces a costly migration.

## Audience

The primary reader is a CTO, head of architecture, or principal engineer at a European organisation — public sector, regulated industry, or a private company with EU-resident customers — making real decisions about platforms, data infrastructure, identity, and developer tooling.

Secondary readers include procurement leads, security architects, and policy advisors who need a defensible reference when challenging or endorsing a stack choice.

## Value proposition

A single, opinionated, versioned artefact that:

- Gives a fast visual read of where each significant technology sits on the sovereignty spectrum.
- Backs every placement with a short, dated rationale grounded in concrete factors: jurisdiction, ownership, exit cost, standards posture, supply-chain exposure.
- Updates on a predictable cadence so decisions can be timed against it.
- Treats open standards and protocols as first-class citizens, not afterthoughts.

## Structure

The radar uses two axes.

**Rings — what to do about it:**

- *Adopt* — sovereignty-safe; recommended for new and existing systems.
- *Trial* — credible; worth piloting in a non-critical context.
- *Assess* — watch and learn; not yet ready, or signal is mixed.
- *Divest* — if you depend on this, plan and budget an exit.

**Quadrants — where it lives in the stack:**

- *Infrastructure & Compute* — cloud, hosting, CDN, edge.
- *Data & Identity* — databases, auth, analytics, AI/ML services.
- *Developer Toolchain* — source hosting, CI/CD, observability, package registries.
- *Standards & Protocols* — open standards and interop layers that reduce future lock-in.

Each entry is a single technology, vendor, or standard, placed in one ring and one quadrant, with a one-paragraph rationale and a last-reviewed date.

## Core capabilities

- Interactive HTML radar, rendered as a static site, navigable by ring and quadrant.
- Per-entry detail view with rationale, the sovereignty factors considered, and the history of position changes across releases.
- Filter and search across all entries.
- Versioned releases on a predictable cadence, with each release archived and permanently linkable.
- Diff view between releases so readers can see what moved and why.

## Non-goals

- Not a maturity or hype assessment. An entry can be technically excellent and still sit in Divest.
- Not a comprehensive vendor catalogue. Inclusion is editorial; the radar shows what matters, not everything that exists.
- Not legal or compliance advice. The radar informs technical strategy; lawyers handle obligations.
- Not anti-American or pro-EU as a posture. Placements are pragmatic; a US-headquartered tool can sit in Adopt where exit is cheap and standards posture is strong.
- Not a procurement marketplace or RFP tool.

## Success criteria

The radar succeeds if a European CTO can, in under fifteen minutes, identify which parts of their current stack carry meaningful sovereignty risk and which credible alternatives are worth piloting — and can cite the radar in an internal memo without needing to caveat it.
