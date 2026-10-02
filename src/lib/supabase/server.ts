// ====================================================================
// G-TECH ISP OPERATING SYSTEM
// Supabase Server Client
// Use this in Server Components, Route Handlers, and Server Actions.
// Reads the auth session from cookies automatically.
// Never expose the service_role key through this client.
// ====================================================================

import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Service-role Supabase client for privileged server-side operations.
 *
 * CRITICAL SECURITY RULES:
 * - NEVER use this client in any code that runs in the browser.
 * - NEVER import this into Client Components.
 * - NEVER expose SUPABASE_SERVICE_ROLE_KEY to the client bundle.
 * - Use ONLY for: payment callbacks, network provisioning,
 *   admin operations, and scheduled server-side tasks.
 */
export function createSupabaseServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error(
      '[G-Tech ISP OS] SUPABASE_SERVICE_ROLE_KEY is not configured. ' +
      'This is required for privileged server-side operations. ' +
      'Never expose this key to the browser.'
    )
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
