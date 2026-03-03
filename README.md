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

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/scout.git
cd scout
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in the values in `.env.local` (see [Environment Variables](#environment-variables) below).

### 4. Set up the database

Create a [Neon](https://neon.tech) project (free tier is sufficient) and copy the connection string into `DATABASE_URL` in your `.env.local`. Then run the setup script to apply the schema:

```bash
npm run db:setup
```

This executes `src/db/schema.sql` against your Neon database, enabling the PostGIS extension and creating all required tables and indexes.

Alternatively, you can apply the schema directly with `psql`:

```bash
psql "$DATABASE_URL" -f src/db/schema.sql
```

### 5. Start the development server

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
| `RATE_LIMIT_UPLOAD_MAX` | Max `POST /api/upload` requests per window (default: `10`) |
| `RATE_LIMIT_UPLOAD_WINDOW_MS` | Window in ms for upload limit (default: `60000`) |
| `RATE_LIMIT_CONDITIONS_MAX` | Max `POST /api/conditions` requests per window (default: `20`) |
| `RATE_LIMIT_CONDITIONS_WINDOW_MS` | Window in ms for conditions limit (default: `300000`) |
| `RATE_LIMIT_LOCATIONS_MAX` | Max `POST /api/locations` requests per window (default: `10`) |
| `RATE_LIMIT_LOCATIONS_WINDOW_MS` | Window in ms for locations limit (default: `600000`) |

### Getting credentials

- **Google OAuth**: [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → OAuth 2.0 Client. Add `http://localhost:3000/api/auth/callback/google` as an authorised redirect URI.
- **Neon**: [neon.tech](https://neon.tech) — create a free project and enable the PostGIS extension.
- **Cloudinary**: [cloudinary.com](https://cloudinary.com) — free tier is sufficient.

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

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add all environment variables in the Vercel dashboard
4. Update `NEXTAUTH_URL` to your Vercel deployment URL
5. Add the Vercel URL as an authorised redirect URI in Google Cloud Console

```bash
# One-time deployment
vercel --prod
```

## Database Schema

The app uses PostGIS for geospatial features:

- **users** — OAuth user accounts
- **locations** — Scout locations with `geometry(Point, 4326)` for lat/lon
- **conditions** — Condition reports with ratings, descriptions, and optional photos

A GIST index on `locations.geom` enables fast bounding-box and nearest-neighbour queries.

## License

MIT
DRAFT: A community conditions platform where you can scout your next adventure

