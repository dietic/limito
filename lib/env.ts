type NonEmptyString = string & { readonly __nonEmpty: unique symbol }

function requireEnv(name: string): NonEmptyString {
  const v = process.env[name]
  if (!v || v.trim().length === 0) {
    throw new Error(`Missing env: ${name}`)
  }
  return v as NonEmptyString
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '',
  RESEND_API_KEY: process.env['RESEND_API_KEY'] ?? '',
  APP_URL: process.env['APP_URL'] ?? 'http://localhost:3000',
  STRIPE_SECRET_KEY: process.env['STRIPE_SECRET_KEY'] ?? '',
  STRIPE_WEBHOOK_SECRET: process.env['STRIPE_WEBHOOK_SECRET'] ?? ''
}
