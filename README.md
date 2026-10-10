# Ang Himaya

Ang Opisyal na Estudyanteng Pampahayagan ng **Politeknikong Unibersidad ng Pilipinas — Campus ng Lopez**.

Isang React front-end na may three.js 3D hero (mountain terrain + emblem + aklat) at
Node/Express REST API para sa nilalaman at ang Tanggapan ng Patnugutan.

---

## 📁 Structure

```
.
├── client/                  React + Vite front-end
│   ├── src/
│   │   ├── scene/           three.js scene (SceneHero, HimayaScene, config, shaders)
│   │   ├── components/      Mga seksyon ng pahayagan
│   │   ├── hooks/           useContent, useInView
│   │   ├── lib/             API client at mga formatter
│   │   ├── data/seed.json   Offline fallback (kopya ng server/data/store.json)
│   │   └── styles/global.css  Design system
│   ├── public/              Mga asset, draco decoder, portal.html
│   └── smoke.test.jsx       Render test ng buong component tree
│
├── server/                  Node + Express API
│   ├── src/
│   │   ├── index.js         App bootstrap, CORS, static, uploads
│   │   ├── config.js        Environment config
│   │   ├── store.js         JSON file store (data/store.json)
│   │   ├── lib/             http helpers, validation, token signing
│   │   ├── middleware/      auth
│   │   └── routes/          articles, ticker, editions, upload, auth
│   └── data/store.json      Source of truth ng nilalaman
│
└── archive/                 Lumang bersyon at mga kasangkapan
```

---

## 🚀 Pagpapatakbo

### Development (dalawang terminal)

```bash
npm run install:all   # i-install ang lahat ng dependencies
npm run dev:api       # API  → http://localhost:5000/api
npm run dev           # Site → http://localhost:5173
```

Ang Vite dev server ay nagpo-proxy ng `/api` at `/uploads` papunta sa Express.

### Production

```bash
npm run build         # bubuild ang client papunta sa client/dist
npm start             # Express ang magse-serve ng dist + API sa :5000
```

Pagkatapos, buong site (at ang `/portal.html`) ay nasa `http://localhost:5000`.

### Mga pagsubok

```bash
cd client
npm run test:smoke    # nire-render ang buong App at nini-check ang mga seksyon
```

---

## 🧩 Ang 3D hero

Nananatiling buo ang dating interactive na 3D scene — hindi binago ang anumang
posisyon, rotasyon, sukat, ilaw, fog, o shader parameter.

| Bahagi | File |
| --- | --- |
| Lahat ng posisyon, kamera, ilaw, tunog | `client/src/scene/sceneConfig.js` |
| Scanline wave vertex/fragment shaders | `client/src/scene/shaders.js` |
| Renderer, loader, RAF loop, teardown | `client/src/scene/HimayaScene.js` |
| React wrapper, preloader, hero UI | `client/src/scene/SceneHero.jsx` |
| Lenis smooth scroll (shared) | `client/src/scene/scroll.js` |

Behavyor:
- Ang camera ay lumilipad mula `(1.538, 4.888, 33.0)` patungo sa `(1.387, 7.144, 14.973)`
  batay sa scroll sa loob ng 350vh spacer.
- Ang wireframe "scanline" wave ay dumadaloy sa terrain at aklat.
- Ang ambient sound ay naka-muffle at awtomatikong nag-pause kapag pumasok na sa
  bahagi ng nilalaman, at bumabalik kapag bumalik sa 3D mundo.

**Resilience** — ang nilalaman ay hindi kailanman nakakabatay sa 3D scene o sa API:

| Sitwasyon | Nangyayari |
| --- | --- |
| Isang GLB model ang nabigo | Itinaturing itong tapos na ("settled") — bahagyang 3D, buong pahayagan |
| Hindi available ang WebGL / nag-crash ang scene | Itinatapon ang canvas, ipinapakita ang hero overlay + buong nilalaman |
| Sunod ang pag-load (6s) | Pinipilit ang preloader na umalis para hindi hadlang ang nilalaman |
| Walang backend (:5000) | Ginagamit ang `client/src/data/seed.json` — walang network kailangan |
| Walang available na audio | Itinatago ang audio toggle; nananatiling buo ang scene |

Pinoprotektahan ng `SceneErrorBoundary` ang buong pahayagan: walang throw sa 3D code
ang makakapagpatigil ng pag-render ng nilalaman.

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
| GET | `/health` | – | Kalagayan ng server at bilang ng talaan |
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

Ang `portal.html` ay gumagamit ng iisang `apiFetch()` helper na awtomatikong
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

---

## 📝 Tala

- Ang dating Supabase at Cloudinary ay inalis at pinalitan ng lokal na JSON store
  at disk-based uploads — mas simple at gumagana nang offline.
- Ang lumang bersyon ng client (vanilla `index.html`, `main.js`, `style.css`) ay
  nasa `archive/legacy-client/`.