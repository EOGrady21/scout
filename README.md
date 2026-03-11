# 🏕️ Scout

A community-driven platform for discovering and sharing outdoor location conditions. Built with Next.js 15, Leaflet/OpenStreetMap, Auth.js (Google OAuth), Neon PostgreSQL (PostGIS), and Cloudinary.

## Features

- 🗺️ Interactive map (Leaflet + OpenStreetMap) showing all community locations
- 📍 Submit new locations with coordinates or auto-detect via browser geolocation
- 📋 Condition reports with 1–5 star ratings, descriptions, and optional photos
- 🔐 Google OAuth authentication via Auth.js (next-auth v5)
- 🖼️ Photo uploads to Cloudinary
- 🗄️ Neon PostgreSQL with PostGIS for geospatial queries
- 📱 Responsive design with Tailwind CSS

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Map | Leaflet + react-leaflet + OpenStreetMap |
| Auth | Auth.js v5 beta (Google OAuth) |
| Database | Neon PostgreSQL + PostGIS |
| Storage | Cloudinary |
| Deployment | Vercel |

## Software Requirements (First-Time Setup)

Install these tools before running the project:

- [Git](https://git-scm.com/downloads)
- [Node.js LTS](https://nodejs.org/en/download) (includes `npm`)
- [Visual Studio Code](https://code.visualstudio.com/)

Verify install:

```bash
git --version
node --version
npm --version
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/EOGrady21/scout.git
cd scout
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

macOS/Linux:

```bash
cp .env.example .env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Fill in the values in `.env.local` (see [Environment Variables](#environment-variables) below).


### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string (with `?sslmode=require`) |
| `NEXTAUTH_SECRET` | Random secret for Auth.js (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Public URL of your app (e.g. `http://localhost:3000` for dev) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (public/client-side) |
| `RATE_LIMIT_UPLOAD_MAX` | Max upload requests per window (optional) |
| `RATE_LIMIT_UPLOAD_WINDOW_MS` | Upload window duration in ms (optional) |
| `RATE_LIMIT_CONDITIONS_MAX` | Max condition submission requests per window (optional) |
| `RATE_LIMIT_CONDITIONS_WINDOW_MS` | Condition submission window duration in ms (optional) |
| `RATE_LIMIT_LOCATIONS_MAX` | Max location submission requests per window (optional) |
| `RATE_LIMIT_LOCATIONS_WINDOW_MS` | Location submission window duration in ms (optional) |


## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # Auth.js route handler
│   │   ├── locations/            # GET all / POST new location
│   │   ├── locations/[id]/       # GET single location + conditions
│   │   ├── conditions/           # POST new condition (protected)
│   │   └── upload/               # POST image upload to Cloudinary
│   ├── locations/[id]/           # Location detail page
│   ├── submit/                   # Submit new location page
│   ├── profile/                  # User profile page
│   ├── layout.tsx                # Root layout with header
│   └── page.tsx                  # Home page with map
├── components/
│   ├── Map.tsx                   # Leaflet map (client-side only)
│   ├── LocationCard.tsx          # Location summary card
│   ├── ConditionForm.tsx         # Submit condition + photo upload
│   ├── Header.tsx                # Navigation header
│   └── AuthButton.tsx            # Sign in/out button
├── db/
│   └── schema.sql                # PostgreSQL + PostGIS schema
├── lib/
│   ├── auth.ts                   # Auth.js config
│   ├── cloudinary.ts             # Cloudinary upload helper
│   └── db.ts                     # Neon DB client + query helpers
├── middleware.ts                 # Route protection (Auth.js)
└── types/
    └── index.ts                  # TypeScript types
```



## License

MIT

## Authors

- Sydeny Parsons
- Patricka Abankwa
- Bibekta Malla
- Emily O'Grady



## Development TODO List

- Add map pin drop selection tool to submit a new location
- move condition report to top of page when looking at a location
- add badges to profiles
- add one verified location demo
- add location badges
- business profile option
