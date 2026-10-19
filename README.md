# 📰 Ang Himaya

> **Ang Himaya** — Opisyal na Estudyenteng Pampahayagan ng PUP Lopez Campus

Ang site ng pahayagan: isang React app para sa mga mambabasa, isang React portal para sa
Tanggapan ng Patnugutan, at isang Express API sa gitna.

---

## 📁 Istruktura

```
himaya/
├── client/          # Public reader (React + Vite) — :5173
├── portal/          # Tanggapan ng Patnugutan, CMS (React + Vite) — :5174
├── server/          # REST API (Node + Express) — :5000
└── vercel.json      # Static build ng client
```

---

## 🚀 Magsimula

```bash
npm run install:all   # i-install ang client, portal, at server
npm run dev           # client + api + portal (sabay-sabay)
```

Ayokong tumakbo nang magk Isa lamang:

```bash
npm run dev:api       # :5000
npm run dev:portal    # :5174
npm run build         # i-build ang client
```

Ang server ay **hindi kailangan ng Supabase o Cloudinary** para gumana. Kapag walang
naka-set na key, lokal na JSON store at disk-based uploads lang ang ginagamit.

---

## 📰 Mga seksyon (pinagsama na)

| Dating bahagi | Bagong seksyon |
| --- | --- |
| Pangunahing Balita (3-column grid) | **Balita** — lead + listahan ng balita |
| Kolum at Opinyon + Editoryal + Lathalain | **Kolum at Opinyon** (pinagsama) |
| Silakbo | **Silakbo** |
| Mga Edisyon / PDF Archive | **Mga Opisyal na Edisyon** |
| Lupon ng mga Patnugutan | **Patnugutan** |
| Subscribe + Footer | **Subscribe** + footer |

Ang nilalaman ay galing sa `GET /api/articles`. Kung hindi available ang server,
ginagamit ang `client/src/data/seed.json` — kaya laging may laman ang pahayagan.

> Kapag nagdagdag o nagbago ng artikulo sa `server/data/store.json`, kopyahin din
> ito sa `client/src/data/seed.json` para magkatugma ang offline fallback.

---

## 🔌 API

Babatayan: `http://localhost:5000/api`

| Method | Ruta | Auth | Paglalarawan |
| --- | --- | --- | --- |
| GET | `/health` | – | Kalagayan, provider, at bilang ng talaan |
| POST | `/health/sync` | ✔ | Pinipilit ang pag-sunod papunta sa Supabase |
| GET | `/articles` | – | `?type=&category=&lead=&limit=&q=` |
| GET | `/articles/:idOrSlug` | – | Isang artikulo |
| POST | `/articles` | ✔ | Gumawa ng artikulo |
| PUT | `/articles/:id` | ✔ | Nag-a-update ng artikulo |
| DELETE | `/articles/:id` | ✔ | Binubura ang artikulo |
| GET | `/ticker` | – | Mga aktibong kagyat na ulat |
| POST | `/ticker` | ✔ | Nag-broadcast |
| DELETE | `/ticker/:id` | ✔ | Binubura |
| GET | `/editions` | – | Mga PDF edition |
| POST | `/editions` | ✔ | Gumagawa ng edisyon |
| DELETE | `/editions/:id` | ✔ | Binubura |
| POST | `/upload` | ✔ | `multipart/form-data`, field `image` |
| POST | `/auth/login` | – | `{ passcode }` → `{ token }` |
| GET | `/auth/session` | ✔ | Iva-validate ang token |

**Auth**: ang mga protected na ruta ay nangangailangan ng
`Authorization: Bearer <token>` mula sa `POST /api/auth/login`
(passcode: `PORTAL_PASSCODE`, default `himaya2026`). Ang token ay HMAC-signed at
may 12 oras na bisa (`PORTAL_TOKEN_TTL`).

Ang portal ay gumagamit ng iisang `apiFetch()` helper na awtomatikong
naglalagay ng token, kaya gumagana pa rin ang Tanggapan ng Patnugutan.

---

## ⚙️ Environment (server)

Kopyahin ang `server/.env.example` bilang `server/.env`:

| Variable | Default | Layunin |
| --- | --- | --- |
| `PORT` | `5000` | Port ng server |
| `CLIENT_ORIGINS` | `http://localhost:5173,...` | Pinapayagang origins para sa CORS |
| `PUBLIC_URL` | `http://localhost:5000` | Base URL ng mga URL na ibinibigay ng API |
| `PORTAL_PASSCODE` | `himaya2026` | Passcode ng Tanggapan |
| `PORTAL_EMAILS` | `puplopezanghimaya@gmail.com` | Mga email na pinapayagan |
| `PORTAL_SECRET` | *(dev default)* | Susi sa pag-sign ng token — **palitan sa production** |
| `UPLOAD_DIR` | `server/uploads` | Folder ng mga na-upload na larawan |
| `MAX_UPLOAD_BYTES` | `5242880` | Limitasyon ng laki (5 MB) |
| `SUPABASE_URL` | *(walang laman)* | **Opsyonal.** URL ng Supabase project |
| `SUPABASE_ANON_KEY` | *(walang laman)* | Anon key (public-side lang) |
| `SUPABASE_SERVICE_ROLE_KEY` | *(walang laman)* | Service-role key — **server-side lamang** |
| `SUPABASE_SCHEMA` | `public` | Schema na ginagamit |
| `CLOUDINARY_CLOUD_NAME` | *(walang laman)* | **Opsyonal.** Cloud name |
| `CLOUDINARY_API_KEY` | *(walang laman)* | **Opsyonal.** API key |
| `CLOUDINARY_API_SECRET` | *(walang laman)* | **Opsyonal.** API secret |
| `CLOUDINARY_FOLDER` | `ang-himaya` | Root folder ng mga upload |

---

## ☁️ Supabase at Cloudinary (opsyonal)

Parehong **opsyonal** — lahat ay gumagana nang walang sila. Walang key na nasa
`client/` o `portal/`; server lamang ang nakakapag-access.

### Supabase

Patakarin ang `server/schema.sql` sa Supabase SQL Editor, saka ilagay ang
`SUPABASE_URL` at server-only na `SUPABASE_SERVICE_ROLE_KEY` sa `server/.env`.
Maaaring gamitin ang Secret API key (`sb_secret_...`) o ang legacy `service_role`
key. Huwag ilagay ang privileged key sa `.env.local`, `client/`, o `portal/`.
Hindi kailangan ang `@supabase/ssr` dito dahil Vite + Express ang project, hindi Next.js.

- Sa boot, binabasa ng server ang tatlong talahanayan at pinapalitan ang laman ng
  `store.json`. Kung walang laman ang isang talahanayan, ang lokal na datos ang
  pinag-bootstrap papunta sa Supabase.
- Sa bawat write, sinusunod ang buong estado (upsert + burahin ang nawala).
- Kapag may error, **nananatiling lokal na store** ang ginagamit at nakikita ang
  detalye sa `GET /api/health`.
- Public SELECT lang ang pinapayagan ng RLS policies; ang mga pagbabago ay dumadaan
  sa authenticated Express API gamit ang server-only key.

### Cloudinary

Kapag nakalagay ang tatlong `CLOUDINARY_*`, ang `POST /api/upload` ay mapupunta sa
Cloudinary sa ilalim ng `CLOUDINARY_FOLDER` + ang `folder` na ipinapadala ng portal.
Kapag nabigo, awtomatikong bumabalik sa lokal na disk. Ang tugon ay palaging
`{ url, provider, filename, size }` — `provider` ay `"cloudinary"` o `"local"`.

---

## 📝 Tala

- Ang Supabase at Cloudinary ay opsyonal at aktibong sinusuportahan ng server.
  Kapag wala ang mga key, lokal na JSON store at disk-based uploads ang ginagamit —
  mas simple at gumagana nang offline.
- Ang lumang bersyon ng client (vanilla `index.html`, `main.js`, `style.css`) ay
  nasa `archive/legacy-client/`.