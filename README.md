# Lil Miss Tiffany Site

This repository contains the public Next.js website, Express/Supabase backend, and Expo creator admin app.

## Prerequisites

- Node.js 20 or newer
- npm
- A running PostgreSQL/Supabase database for the backend
- A phone or simulator for the Expo admin app

## Configure the backend

Never commit `backend/.env`. Copy the template and fill in real values:

```bash
cd backend
cp .env.example .env
npm ci
npm run dev
```

The backend listens on port `4000`. Verify it with <http://192.0.0.1:4000/health> when using the configured local address.

## Open the website in a browser

In a second terminal:

```bash
cd frontend
cp .env.example .env.local
npm ci
npm run dev
```

Open <http://localhost:3000> for the site or <http://localhost:3000/admin> for stream controls. Set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` to the deployed backend URL before a production build.

For a release build:

```bash
npm run build
npm run start
```

## Open the admin app in a browser or device

The Expo app can run in a browser:

```bash
cd creator-mobile-admin
cp .env.example .env.local
npm ci
npm run web
```

Then open the URL printed by Expo, usually <http://localhost:8081>. For a physical phone, use the same reachable backend URL in `EXPO_PUBLIC_API_URL`, then run `npm start` and scan the Expo QR code.

## Release checklist

1. Rotate any credentials that were previously stored in the repository, especially the Supabase/Postgres credentials in the old `backend/.env`.
2. Set `NEXT_PUBLIC_API_URL` and `EXPO_PUBLIC_API_URL` to the deployed HTTPS backend URL.
3. Deploy the backend with `npm ci` and `npm start`; configure its environment variables in the hosting provider.
4. Deploy the frontend with `npm ci`, `npm run build`, and `npm start`.
5. Run the mobile app through an Expo development build or EAS build; `npm run web` is for browser testing, not App Store release.
6. Check `GET /health`, live status, image upload, start stream, and end stream after deployment.
