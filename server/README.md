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
| GET | `/api/health` | – | Kalagayan, bilang ng talaan, uptime |
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
{ "error": "Hindi natagpuan ang artikulong ihinahanap." }
```

## Auth

- Ang mga protected na ruta ay nangangailangan ng `Authorization: Bearer <token>`.
- Ang token ay HMAC-SHA256 signed na `<base64url payload>.<signature>`; walang estado
  sa server, at may expiry mula sa `PORTAL_TOKEN_TRL` (default 12 oras).
- Ang default na passcode ay `himaya2026` — palitan ang `PORTAL_PASSCODE` at
  ang `PORTAL_SECRET` sa production.

## Lokal na datos

- `data/store.json` ang source of truth (`articles`, `ticker_alerts`, `editions`).
- Ang bawat write ay isinusulat nang atomic (`.tmp` → rename) upang maiwasan ang
  sirang `store.json`.
- Ang mga na-upload na larawan ay napupunta sa `uploads/` at inihahain sa `/uploads`.

> Kapag nagbago ang `store.json`, kopyahin din ito sa
> `../client/src/data/seed.json` para magkatugma ang offline fallback ng site.

## Static hosting

Kapag mayroon nang `client/dist`, awtomatikong ito ang ihahain ng server (kasama ang
SPA fallback para sa mga deep link). Kaya sapat na ang isang server para sa buong site.