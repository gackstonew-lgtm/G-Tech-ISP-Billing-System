// ====================================================================
// G-TECH ISP OPERATING SYSTEM
// Supabase Error Handler
// Converts database/API errors into safe, user-facing messages.
// NEVER expose SQL errors, stack traces, or DB internals to users.
// ====================================================================

import type { PostgrestError } from '@supabase/supabase-js'

/**
 * User-facing error messages for common Supabase/PostgreSQL error codes.
 * These are shown to users. Technical details are logged server-side only.
 */
const ERROR_MESSAGES: Record<string, string> = {
  // RLS / Auth errors
  'PGRST116': 'You do not have permission to perform this action.',
  'PGRST301': 'Your session has expired. Please sign in again.',
  '42501': 'You do not have permission to perform this action.',
  '28000': 'Authentication failed. Please sign in again.',
  
  // Constraint violations
  '23505': 'A record with this information already exists.',
  '23503': 'This operation references a record that no longer exists.',
  '23514': 'The provided data does not meet the required format.',
  '23502': 'A required field is missing.',
  
  // Connection
  'PGRST000': 'Unable to connect to the database. Please try again.',
}

export interface AppError {
  userMessage: string
  code?: string
  isRetryable: boolean
}

/**
 * Converts a Supabase/PostgreSQL error into a safe AppError.
 * Logs technical details to console (server-side) without exposing them to users.
 */
export function handleSupabaseError(
  error: PostgrestError | Error | unknown,
  context: string
): AppError {
  if (error && typeof error === 'object' && 'code' in error) {
    const pgError = error as PostgrestError
    
    // Log technical details server-side only
    console.error(`[G-Tech ISP] Supabase error in ${context}:`, {
      code: pgError.code,
      message: pgError.message,
      details: pgError.details,
      hint: pgError.hint,
    })

    const userMessage =
      ERROR_MESSAGES[pgError.code] ??
      getContextualMessage(context)

    return {
      userMessage,
      code: pgError.code,
      isRetryable: isRetryableCode(pgError.code),
    }
  }

  console.error(`[G-Tech ISP] Unknown error in ${context}:`, error)

  return {
    userMessage: getContextualMessage(context),
    isRetryable: true,
  }
}

/**
 * Returns a context-appropriate user-facing error message.
 */
function getContextualMessage(context: string): string {
  const contextMessages: Record<string, string> = {
    'customers.list': 'Unable to load subscriber data. Please try again.',
    'customers.create': 'Unable to create subscriber. Please check the details and try again.',
    'customers.update': 'Unable to update subscriber record. Please try again.',
    'plans.list': 'Unable to load service plans. Please try again.',
    'routers.list': 'Unable to load router fleet data. Please try again.',
    'payments.create': 'Payment could not be processed. Please try again.',
    'payments.list': 'Unable to load payment records. Please try again.',
    'vouchers.generate': 'Voucher batch generation failed. Please try again.',
    'invoices.list': 'Unable to load invoice records. Please try again.',
    'noc.stats': 'Unable to load NOC statistics. Network service temporarily unavailable.',
    'auth.login': 'Sign in failed. Please check your credentials.',
    'auth.logout': 'Sign out failed. Please try again.',
    'auth.profile': 'Unable to load your profile. Please try again.',
  }

  return contextMessages[context] ?? 'An unexpected error occurred. Please try again.'
}

/**
 * Determines if an error condition is safe to retry.
 */
function isRetryableCode(code: string): boolean {
  const nonRetryable = new Set(['23505', '23503', '23514', '23502', '42501', 'PGRST116'])
  return !nonRetryable.has(code)
}
