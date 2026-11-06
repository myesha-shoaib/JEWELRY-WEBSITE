# Aurelia Jewellery

A React and Vite jewellery storefront with 300 local WebP product images.

## Run locally

```sh
npm install
npm run dev
```

## Supabase backend

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to create and seed the PostgreSQL database, configure authentication, COD orders, and the Resend newsletter confirmation function.

The frontend only uses Supabase's publishable/`anon` key. Never expose a `service_role` key in browser code.

The seeded PKR prices are temporary estimates. COD orders can be placed after Supabase is configured; the newsletter requires the deployed Edge Function and Resend secrets.

## Checks

```sh
npm run lint
npm run build
```
