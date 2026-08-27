# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Residents (moradores):** People living in Oslo Residencial condos who need to view notices, report incidents, check finances, browse service provider recommendations, and manage their profile.
- **Administrators (síndicos):** Building managers who publish notices, manage finances, oversee incidents, and communicate with residents.

Both audiences are equally important; the app serves a dual role as community hub and administrative tool.

## Product Purpose

A single-source-of-all portal for the Oslo Residencial condominium building. Replaces fragmented WhatsApp groups, spreadsheets, and paper notices with one shared platform where residents and management can communicate, track building operations, and share community resources (service provider recommendations).

## Positioning

All-in-one condominium management and community platform — transparent finances, incident tracking, resident recommendations, and building notices in one place, replacing the typical mix of WhatsApp threads, spreadsheets, and paper bulletins.

## Operating Context

- Residents log in to check notices, report incidents (with photos), browse and save service provider recommendations, and view financial summaries.
- Administrators publish notices, manage pending payments, track incident status, and manage the syndic profile.
- The portal is accessed via desktop and mobile browsers by residents of a single building (14 apartments).
- Supabase handles authentication, database, and file storage (avatars, incident images, recommendation images).
- Deployed on Netlify; environment variables injected at build time.

## Capabilities and Constraints

- Authentication via Supabase (email/password).
- Role-based access: Admin (síndico) and Resident (morador). Admin can manage notices, finances, and syndic profile; residents can view and report.
- All data is currently empty; demo data was intentionally removed before production deployment.
- RLS (Row Level Security) is documented but not yet active — anon key can read/write all tables.
- Storage buckets exist for avatars, recommendations, occurrences, and condominium files.
- Font stack: Plus Jakarta Sans (body), Space Grotesk (display), JetBrains Mono (mono).
- Current color palette uses warm neutrals: #FBF9F6 (background), #3E342F (text), #CBBFB7/#8C7364 (accents).

## Brand Commitments

- Name: **Oslo Residencial** — voice is warm, community-focused, approachable.
- Logo, specific brand colors, and other brand assets will be provided later.
- Visual identity currently uses a warm neutral palette; binding brand system to be defined.

## Evidence on Hand

- Complete React/Vite/Tailwind codebase with 7 screens (Login, Dashboard, Caixa, Avisos, Ocorrências, Indica Apt, Perfil).
- Supabase backend with tables for notices, recommendations, payments, financial summary, monthly flow, expense categories, syndic profile, occurrences, profiles, residents, and units.
- PRODUCAO.md with deployment guide (Supabase setup, RLS, environment variables).
- No real data in the database — production deployment pending content population.

## Product Principles

1. **Transparency first** — financial data, incident status, and building decisions are visible to all residents.
2. **Community over administration** — the platform should feel like a neighborhood, not a spreadsheet.
3. **One portal, not many** — replace WhatsApp, spreadsheets, and paper with a single shared system.
4. **Role clarity without gatekeeping** — admins manage, residents participate, but information flows openly.
5. **Mobile-first access** — most residents will use phones; the experience must work well on small screens.

## Accessibility & Inclusion

- Focus-visible styles are defined for interactive elements.
- `prefers-reduced-motion` is respected.
- No specific accessibility standard or audit has been conducted yet.
