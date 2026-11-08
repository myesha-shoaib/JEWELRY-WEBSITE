# Aurelia Jewellery

A React and Vite jewellery storefront with 300 local WebP product images.

## Run locally

```sh
npm install
npm run dev
```

## Supabase backend

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to create and seed the PostgreSQL database, configure existing account sessions, COD orders, and the Resend newsletter confirmation function.

The frontend only uses Supabase's publishable/`anon` key. Never expose a `service_role` key in browser code.

The seeded PKR prices are temporary estimates. Sign-in is currently hidden: shoppers can browse and save their bag locally, but COD checkout is available only to existing authenticated sessions. The newsletter requires the deployed Edge Function and Resend secrets.

## Checks

```sh
npm run lint
npm run build
```
