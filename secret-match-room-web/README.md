# Secret Match Room - publish-ready prototype

This is a Vite + React + Tailwind prototype for browser deployment.

## Important

This ZIP is a **URL公開用のフロントエンド版**です。
At this stage, room data is stored only in the browser state. For real multi-device use, connect Supabase or Firebase.

## Deploy to Vercel

1. Create a GitHub repository and upload these files.
2. Go to Vercel and import the repository.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy. Vercel will issue a public URL.

## Deploy to Netlify

1. Create a GitHub repository and upload these files.
2. Go to Netlify and create a site from Git.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy. Netlify will issue a public URL.

## Local test

```bash
npm install
npm run dev
```

## Next production steps

1. Supabase tables:
   - rooms
   - seats
   - members
   - votes
   - payments
2. Real room URLs:
   - `/r/:roomCode`
3. Payment:
   - Stripe Payment Links for paid room creation
   - or Stripe Checkout for in-app flow
deploy test
