# Supabase setup

The storefront is wired for a Supabase PostgreSQL database, email/password accounts, saved shopping bags and favourites, cash-on-delivery orders, and a double-opt-in newsletter confirmation email. The local catalogue remains available if Supabase has not been configured.

## 1. Create a Supabase project

Create a project in the Supabase dashboard and save its database password in a password manager. In **Project Settings → API**, copy the project URL and its publishable key (or legacy `anon` key). The database password and service-role key do not belong in the frontend.

## 2. Configure the local storefront

Copy `.env.example` to `.env.local` in the project root and replace the example values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

Restart Vite after changing `.env.local`. Never use a Supabase `service_role` or secret key in a `VITE_` variable or browser code.

## 3. Create and seed the database

In the Supabase dashboard, open **SQL Editor** and run these files in order:

1. `supabase/schema.sql` creates the product, profile, cart, favourites, COD order, newsletter, and rate-limit tables; row-level security policies; and server-side RPCs.
2. `supabase/seed.sql` inserts 300 products. Prices are temporary estimates in Pakistani rupees, stored as paisa (`1 PKR = 100 paisa`).

The seed data is paired with the WebP files in `public/images/`. Keep product IDs and image filenames in sync if you replace or remove catalogue images.

## 4. Configure authentication

In **Authentication → Providers**, enable Email. Under **Authentication → URL Configuration**, set the local development URL to `http://localhost:5173` and add the deployed storefront URL when one exists. Email confirmation can remain enabled.

Signed-in users' bags and favourites are saved to their account; signed-out shoppers' data stays in that browser's local storage. COD checkout requires a signed-in account. The database calculates the total from current product prices, saves an order and item snapshots, and clears the bag only when the order succeeds.

## 5. Configure Resend and deploy the newsletter function

Verify a sender domain in Resend and create an API key. Then set the function secrets in a terminal; replace the placeholders locally and do not commit or share the values:

```sh
npx supabase login
npx supabase secrets set --project-ref your-project-ref RESEND_API_KEY=your-resend-api-key NEWSLETTER_FROM_EMAIL="Aurelia <hello@your-verified-domain.com>" WEB_APP_URL=http://localhost:5173
npx supabase functions deploy newsletter --project-ref your-project-ref
```

Find `your-project-ref` in the Supabase project URL (the subdomain before `.supabase.co`). Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions; do not add the service-role key to `.env.local` or the frontend. Set `WEB_APP_URL` to the exact deployed storefront origin for production. The function allows that origin and the Vite localhost origins.

The newsletter form requires explicit consent and sends a confirmation link that expires after 24 hours. Only confirmed addresses are subscribed. This code sends confirmation emails; it does not yet send marketing campaigns or provide an unsubscribe/preferences page.

## Not included

This project currently supports COD only; it has no online payment provider, shipment tracking, order administration, or tax/shipping calculation. Catalogue prices are placeholders, not approved retail prices. Review them before accepting real orders. Create the Supabase project and Resend account, apply the SQL, add local public credentials, configure secrets, and deploy the function before those hosted services can work.
