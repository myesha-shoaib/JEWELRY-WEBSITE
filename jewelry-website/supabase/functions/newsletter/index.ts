import { createClient } from 'npm:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''
const senderEmail = Deno.env.get('NEWSLETTER_FROM_EMAIL') ?? ''
const appUrl = Deno.env.get('WEB_APP_URL') ?? ''
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const encoder = new TextEncoder()
const allowedOrigins = new Set([
  appUrl ? new URL(appUrl).origin : '',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
])

const responseOrigin = (origin: string | null) =>
  origin && allowedOrigins.has(origin) ? origin : appUrl

const jsonResponse = (body: Record<string, unknown>, status: number, origin: string | null) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': responseOrigin(origin),
      'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Vary': 'Origin',
    },
  })

async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function hashIp(ip: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(serviceRoleKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(ip))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function createToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

async function sendConfirmation(email: string, token: string) {
  const confirmUrl = new URL('/functions/v1/newsletter', supabaseUrl)
  confirmUrl.searchParams.set('token', token)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: senderEmail,
      to: [email],
      subject: 'Confirm your Aurelia newsletter subscription',
      html: `<div style="font-family:Georgia,serif;color:#332927;max-width:560px;margin:40px auto;line-height:1.7"><p style="font-size:12px;letter-spacing:.18em">AURELIA · OBJECTS TO KEEP</p><h1 style="font-weight:400">A little note, now and then.</h1><p>Please confirm that you would like to receive occasional Aurelia notes and new arrivals.</p><p style="margin:32px 0"><a href="${confirmUrl.toString()}" style="display:inline-block;background:#624743;color:white;padding:13px 22px;text-decoration:none">Confirm my subscription</a></p><p style="font-size:12px;color:#82736d">This link expires in 24 hours. If you did not sign up, you can ignore this message.</p></div>`,
      text: `Confirm your Aurelia newsletter subscription: ${confirmUrl.toString()}\n\nThis link expires in 24 hours. If you did not sign up, you can ignore this message.`,
    }),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Resend returned ${response.status}: ${details.slice(0, 400)}`)
  }
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin')
  if (origin && !allowedOrigins.has(origin)) {
    return jsonResponse({ error: 'This origin is not allowed.' }, 403, origin)
  }

  if (request.method === 'OPTIONS') return jsonResponse({}, 200, origin)

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !senderEmail || !appUrl) {
    console.error('Newsletter function is missing one or more required environment variables.')
    return jsonResponse({ error: 'Newsletter confirmation is not configured yet.' }, 503, origin)
  }

  if (request.method === 'GET') {
    const token = new URL(request.url).searchParams.get('token') ?? ''
    if (token.length < 40 || token.length > 100) {
      return Response.redirect(new URL('/?newsletter=invalid', appUrl), 303)
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        confirmation_token_hash: null,
        confirmation_expires_at: null,
      })
      .eq('confirmation_token_hash', await sha256(token))
      .eq('status', 'pending')
      .gt('confirmation_expires_at', new Date().toISOString())
      .select('id')
      .maybeSingle()

    if (error) {
      console.error('Could not confirm newsletter subscription:', error.message)
      return Response.redirect(new URL('/?newsletter=error', appUrl), 303)
    }
    return Response.redirect(new URL(data ? '/?newsletter=confirmed' : '/?newsletter=invalid', appUrl), 303)
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405, origin)
  }

  let payload: { action?: string; email?: string; consent?: boolean }
  try {
    payload = await request.json()
  } catch {
    return jsonResponse({ error: 'Enter a valid email address and consent to subscribe.' }, 400, origin)
  }

  const email = payload.email?.trim().toLowerCase() ?? ''
  if (payload.action !== 'subscribe' || payload.consent !== true || email.length > 254 || !emailPattern.test(email)) {
    return jsonResponse({ error: 'Enter a valid email address and consent to subscribe.' }, 400, origin)
  }

  const ip = (request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0] ?? '').trim()
  if (!ip) return jsonResponse({ error: 'Could not verify this request. Please try again.' }, 400, origin)

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const ipHash = await hashIp(ip)
  const { data: allowed, error: rateLimitError } = await supabase.rpc('consume_newsletter_rate_limit', {
    p_ip_hash: ipHash,
    p_now: new Date().toISOString(),
    p_max_requests: 3,
    p_window_seconds: 3600,
  })
  if (rateLimitError) {
    console.error('Newsletter rate limiting failed:', rateLimitError.message)
    return jsonResponse({ error: 'Newsletter signup is temporarily unavailable.' }, 503, origin)
  }
  if (!allowed) return jsonResponse({ error: 'Too many signup attempts. Please try again in an hour.' }, 429, origin)

  const now = new Date()
  const { data: existing, error: lookupError } = await supabase
    .from('newsletter_subscriptions')
    .select('status, last_confirmation_sent_at')
    .eq('email', email)
    .maybeSingle()

  if (lookupError) {
    console.error('Could not look up newsletter subscriber:', lookupError.message)
    return jsonResponse({ error: 'Newsletter signup is temporarily unavailable.' }, 503, origin)
  }
  if (existing?.status === 'confirmed') {
    return jsonResponse({ message: 'If this address is not already subscribed, check your inbox for a confirmation link.' }, 200, origin)
  }
  if (existing?.last_confirmation_sent_at
    && now.getTime() - Date.parse(existing.last_confirmation_sent_at) < 60_000) {
    return jsonResponse({ message: 'If this address is not already subscribed, check your inbox for a confirmation link.' }, 200, origin)
  }

  const token = createToken()
  const { error: saveError } = await supabase.from('newsletter_subscriptions').upsert({
    email,
    status: 'pending',
    confirmation_token_hash: await sha256(token),
    confirmation_expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    last_confirmation_sent_at: now.toISOString(),
    consented_at: now.toISOString(),
    confirmed_at: null,
  }, { onConflict: 'email' })

  if (saveError) {
    console.error('Could not save newsletter subscription:', saveError.message)
    return jsonResponse({ error: 'Newsletter signup could not be saved.' }, 503, origin)
  }

  try {
    await sendConfirmation(email, token)
  } catch (error) {
    console.error('Could not send newsletter confirmation email:', error)
    await supabase
      .from('newsletter_subscriptions')
      .update({ last_confirmation_sent_at: null })
      .eq('email', email)
      .eq('status', 'pending')
      .eq('confirmation_token_hash', await sha256(token))
    return jsonResponse({ error: 'We could not send the confirmation email. Please try again later.' }, 502, origin)
  }

  return jsonResponse({ message: 'Check your inbox to confirm your newsletter subscription.' }, 200, origin)
})
