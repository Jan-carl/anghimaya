# Ang Himaya — API Server

Node + Express backend para sa **Ang Himaya** (PUP Lopez Campus Student Publication).

## Mga utos

```bash
npm run dev     # node --watch src/index.js
npm start       # production
```

Kopyahin ang `.env.example` bilang `.env` bago mag-tune ng environment.

## Mga ruta

| Method | Ruta | Auth | Paglalarawan |
| --- | --- | --- | --- |
| GET | `/api/health` | – | Kalagayan, provider, bilang ng talaan, uptime |
| POST | `/api/health/sync` | ✔ | Pinipilit ang pag-sunod ng store papunta sa Supabase |
| GET | `/api/articles` | – | `?type=&category=&lead=&limit=&q=` |
| GET | `/api/articles/:idOrSlug` | – | Isang artikulo |
| POST | `/api/articles` | ✔ | Gumawa ng artikulo |
| PUT | `/api/articles/:id` | ✔ | Partial update |
| DELETE | `/api/articles/:id` | ✔ | Binubura |
| GET | `/api/ticker` | – | Mga aktibong kagyat na ulat |
| POST | `/api/ticker` | ✔ | Nag-broadcast (max 280 karakter) |
| DELETE | `/api/ticker/:id` | ✔ | Binubura |
| GET | `/api/editions` | – | Mga PDF edition |
| POST | `/api/editions` | ✔ | Gumagawa ng edisyon |
| DELETE | `/api/editions/:id` | ✔ | Binubura |
| POST | `/api/upload` | ✔ | `image` field; JPG/PNG/WEBP/GIF/AVIF, ≤ 5 MB |
| POST | `/api/auth/login` | – | `{ passcode }` → `{ success, token, user, role }` |
| GET | `/api/auth/session` | ✔ | Iva-validate ang kasalukuyang token |

Halimbawa ng tugon:

```json
{ "data": [ ... ], "meta": { "total": 12, "filters": {} } }
```

Kapag may problema:

```json
{ "error": "Hindi natagpuan ang artikulong ihinhanap." }
```

## Auth

- Ang mga protected na ruta ay nangangailangan ng `Authorization: Bearer <token>`.
- Ang token ay HMAC-SHA256 signed na `<base64url payload>.<signature>`; walang estado
  sa server, at may expiry mula sa `PORTAL_TOKEN_TRL` (default 12 oras).
- Ang default na passcode ay `himaya2026` — palitan ang `PORTAL_PASSCODE` at
  ang `PORTAL_SECRET` sa production.

## Lokal na datos

- `data/store.json` ang default na source of truth (`articles`, `ticker_alerts`, `editions`).
- Ang bawat write ay isinusulat nang atomic (`.tmp` → rename) upang maiwasan ang
  sirang `store.json`.
- Ang mga na-upload na larawan ay napupunta sa `uploads/` at inihahain sa `/uploads`.

> Kapag nagbago ang `store.json`, kopyahin din ito sa
> `../client/src/data/seed.json` para magkatugma ang offline fallback ng site.

## Supabase (opsyonal)

Ang server ay **gumagana nang walang Supabase**. Kapag walang naka-set na key, lokal na
JSON store pa rin ang ginagamit at walang network call na ginagawa.

Kapag nakalagay ang `SUPABASE_URL` at `SUPABASE_SERVICE_ROLE_KEY`:

- Sa boot, binabasa ng server ang tatlong talahanayan (`articles`, `ticker_alerts`,
  `editions`) mula sa Supabase at pinapalitan ang laman ng `store.json`.
- Kung **walang laman** ang isang talahanayan, ang laman ng `store.json` ang
  pinag-bootstrap papunta sa Supabase (awtomatikong binabago ang mga dating
  `art_…` id sa UUID dahil `UUID` ang column ng schema).
- Sa bawat write, sinusunod ang buong estado papunta sa Supabase (upsert + burahin
  ang mga nawala), na debounced sa 400 ms at may exponential backoff na 5 beses.
- Kung may network o credential error, **nananatiling gumagana ang lokal na store** —
  hindi nasisira ang API at nakikita ang error sa `GET /api/health`.

Patakarin ang `schema.sql` sa Supabase SQL Editor bago gamitin. Ginagamit ang
**service-role key** dahil lumalaktaw ito sa mga RLS policy; huwag ilagay ang key sa
`client/` o `portal/`.

Kung ayaw mong mag-auto-sync, huwag set ang `SUPABASE_URL` at magiging lokal na store lang.

## Cloudinary (opsyonal)

Kapag nakalagay ang `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, at
`CLOUDINARY_API_SECRET`, ang `POST /api/upload` ay magse-send sa Cloudinary sa ilalim
ng folder na `CLOUDINARY_FOLDER` (default `ang-himaya`) + ang `folder` na ipinapadala
ng portal (`ang-himaya`, `portal-media`, `editions`).

Kapag **nabigo** ang tawag sa Cloudinary, awtomatikong bumabalik sa lokal na disk para
hindi mawalan ng upload. Ang hugis ng tugon ay hindi nagbabago:

```json
{ "url": "…", "provider": "cloudinary", "filename": "…", "size": 102558 }
```

Kapag lokal: `provider` ay `"local"` at ang `url` ay `/uploads/<folder>/<file>`.

## Kalagayan

`GET /api/health` ay may kumpirmadong hugis para sa portal at Postman:

| Field | Halimbawa | Kahulugan |
| --- | --- | --- |
| `database` | `"supabase"` o `"local_store"` | Saan aktuwal na nababasa ang datos |
| `cloudinary` | `true` / `false` | Nakalagay ba ang CLOUDINARY key |
| `providers.supabase` | `{ configured, connected, lastSyncAt, lastError, … }` | Detalye ng sync |
| `providers.uploads` | `"cloudinary"` o `"local"` | Saan napupunta ang upload |

## Static hosting

Kapag mayroon nang `client/dist`, awtomatikong ito ang ihahain ng server (kasama ang
SPA fallback para sa mga deep link). Kaya sapat na ang isang server para sa buong site.