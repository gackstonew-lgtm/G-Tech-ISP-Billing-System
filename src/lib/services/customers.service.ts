// ====================================================================
// G-TECH ISP OPERATING SYSTEM
// Customer Service — Data Access Layer
// 
// Provides a stable API for customer data regardless of whether the
// backend is Supabase or the in-memory mock database.
// 
// Migration strategy:
// - SUPABASE_URL set: routes to Supabase
// - SUPABASE_URL not set: falls back to mock data (dev compatibility)
// ====================================================================

import type { Customer } from '@/types'
import { SEED_CUSTOMERS } from '@/lib/db/mock-db'
import { handleSupabaseError } from '@/lib/supabase/errors'

const SUPABASE_READY = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://[PROJECT_REF].supabase.co'
)

export interface CustomerListOptions {
  status?: string
  siteId?: string
  searchQuery?: string
  limit?: number
  offset?: number
}

export interface ServiceResult<T> {
  data: T | null
  error: string | null
  count?: number
}

export class CustomerService {
  /**
   * Lists customers for an organization.
   * Falls back to mock data if Supabase is not configured.
   */
  static async list(options: CustomerListOptions = {}): Promise<ServiceResult<Customer[]>> {
    if (!SUPABASE_READY) {
      // Mock fallback — preserves existing UI behavior during development
      let data = [...SEED_CUSTOMERS]
      if (options.status && options.status !== 'ALL') {
        data = data.filter(c => c.status === options.status)
      }
      if (options.searchQuery) {
        const q = options.searchQuery.toLowerCase()
        data = data.filter(c =>
          c.fullName.toLowerCase().includes(q) ||
          c.phoneNumber.includes(q) ||
          c.accountNumber.toLowerCase().includes(q)
        )
      }
      return { data, error: null, count: data.length }
    }

    try {
      const { createSupabaseServerClient } = await import('@/lib/supabase/server')
      const supabase = await createSupabaseServerClient()

      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (options.status && options.status !== 'ALL') {
        query = query.eq('status', options.status as Customer['status'])
      }
      if (options.siteId) {
        query = query.eq('site_id', options.siteId)
      }
      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit ?? 50) - 1)
      }

      const { data, error, count } = await query

      if (error) {
        const appError = handleSupabaseError(error, 'customers.list')
        return { data: null, error: appError.userMessage }
      }

      // Map snake_case DB rows to camelCase app types
      const customers: Customer[] = (data ?? []).map(mapCustomerRow)

      return { data: customers, error: null, count: count ?? customers.length }
    } catch (err) {
      const appError = handleSupabaseError(err, 'customers.list')
      return { data: null, error: appError.userMessage }
    }
  }

  /**
   * Creates a new customer record.
   */
  static async create(
    organizationId: string,
    input: {
      fullName: string
      phoneNumber: string
      email?: string
      physicalAddress?: string
      siteId?: string
      altPhoneNumber?: string
      nationalId?: string
    }
  ): Promise<ServiceResult<Customer>> {
    if (!SUPABASE_READY) {
      // Mock create — returns a simulated new customer
      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        organizationId,
        accountNumber: `GT-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: input.fullName,
        phoneNumber: input.phoneNumber,
        altPhoneNumber: input.altPhoneNumber,
        email: input.email,
        nationalId: input.nationalId,
        physicalAddress: input.physicalAddress,
        siteId: input.siteId,
        status: 'ACTIVE',
        balanceDue: 0,
        createdAt: new Date().toISOString(),
      }
      return { data: newCustomer, error: null }
    }

    try {
      const { createSupabaseServerClient } = await import('@/lib/supabase/server')
      const supabase = await createSupabaseServerClient()

      const accountNumber = `GT-${Math.floor(1000 + Math.random() * 9000)}`

      const { data, error } = await supabase
        .from('customers')
        .insert({
          organization_id: organizationId,
          account_number: accountNumber,
          full_name: input.fullName,
          phone_number: input.phoneNumber,
          alt_phone_number: input.altPhoneNumber ?? null,
          email: input.email ?? null,
          national_id: input.nationalId ?? null,
          physical_address: input.physicalAddress ?? null,
          site_id: input.siteId ?? null,
          status: 'ACTIVE',
          balance_due: 0,
        })
        .select()
        .single()

      if (error) {
        const appError = handleSupabaseError(error, 'customers.create')
        return { data: null, error: appError.userMessage }
      }

      return { data: mapCustomerRow(data), error: null }
    } catch (err) {
      const appError = handleSupabaseError(err, 'customers.create')
      return { data: null, error: appError.userMessage }
    }
  }
}

/**
 * Maps a Supabase customers row to the application Customer type.
 * Excludes sensitive fields like national_id from logs.
 */
function mapCustomerRow(row: Record<string, unknown>): Customer {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    accountNumber: row.account_number as string,
    fullName: row.full_name as string,
    phoneNumber: row.phone_number as string,
    altPhoneNumber: row.alt_phone_number as string | undefined,
    email: row.email as string | undefined,
    nationalId: row.national_id as string | undefined,
    physicalAddress: row.physical_address as string | undefined,
    siteId: row.site_id as string | undefined,
    status: row.status as Customer['status'],
    balanceDue: Number(row.balance_due ?? 0),
    createdAt: row.created_at as string,
  }
}
