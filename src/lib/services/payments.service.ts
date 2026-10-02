// ====================================================================
// G-TECH ISP OPERATING SYSTEM
// Payments Service — Data Access Layer
// 
// SECURITY:
// - STK Push / Daraja API calls happen server-side only
// - Callbacks are processed server-side and persisted via service_role
// - Payment records are INSERT-only (immutable ledger)
// - No client-side UPDATE or DELETE on payment records
// ====================================================================

import type { Payment } from '@/types'
import { SEED_PAYMENTS } from '@/lib/db/mock-db'
import { handleSupabaseError } from '@/lib/supabase/errors'
import type { ServiceResult } from './customers.service'

const SUPABASE_READY = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://[PROJECT_REF].supabase.co'
)

export class PaymentsService {
  static async list(options: { customerId?: string; limit?: number } = {}): Promise<ServiceResult<Payment[]>> {
    if (!SUPABASE_READY) {
      let data = [...SEED_PAYMENTS]
      if (options.customerId) {
        data = data.filter(p => p.customerId === options.customerId)
      }
      return { data, error: null, count: data.length }
    }

    try {
      const { createSupabaseServerClient } = await import('@/lib/supabase/server')
      const supabase = await createSupabaseServerClient()

      let query = supabase
        .from('payments')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(options.limit ?? 100)

      if (options.customerId) {
        query = query.eq('customer_id', options.customerId)
      }

      const { data, error, count } = await query

      if (error) {
        const appError = handleSupabaseError(error, 'payments.list')
        return { data: null, error: appError.userMessage }
      }

      const payments: Payment[] = (data ?? []).map(mapPaymentRow)
      return { data: payments, error: null, count: count ?? payments.length }
    } catch (err) {
      const appError = handleSupabaseError(err, 'payments.list')
      return { data: null, error: appError.userMessage }
    }
  }

  /**
   * Records a completed M-Pesa transaction.
   * Called server-side from the Daraja callback handler.
   * Uses service_role to bypass RLS — callbacks are not user-authenticated.
   */
  static async recordMpesaPayment(payload: {
    organizationId: string
    customerId?: string
    invoiceId?: string
    amount: number
    transactionReference: string
    msisdnPhone: string
    senderName?: string
    paymentMethod: Payment['paymentMethod']
    rawPayload: unknown
  }): Promise<ServiceResult<Payment>> {
    if (!SUPABASE_READY) {
      const mockPayment: Payment = {
        id: `pay-${Date.now()}`,
        organizationId: payload.organizationId,
        customerId: payload.customerId,
        invoiceId: payload.invoiceId,
        paymentMethod: payload.paymentMethod,
        amount: payload.amount,
        currency: 'KES',
        transactionReference: payload.transactionReference,
        msisdnPhone: payload.msisdnPhone,
        senderName: payload.senderName,
        status: 'COMPLETED',
        processedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
      return { data: mockPayment, error: null }
    }

    try {
      // Service client used here: Daraja callbacks are not user-authenticated
      const { createSupabaseServiceClient } = await import('@/lib/supabase/server')
      const supabase = createSupabaseServiceClient()

      const { data, error } = await supabase
        .from('payments')
        .insert({
          organization_id: payload.organizationId,
          customer_id: payload.customerId ?? null,
          invoice_id: payload.invoiceId ?? null,
          payment_method: payload.paymentMethod,
          amount: payload.amount,
          currency: 'KES',
          transaction_reference: payload.transactionReference,
          msisdn_phone: payload.msisdnPhone,
          sender_name: payload.senderName ?? null,
          status: 'COMPLETED',
          raw_payload: (payload.rawPayload as unknown) as import('@/types/database.types').Json,
          processed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        const appError = handleSupabaseError(error, 'payments.create')
        return { data: null, error: appError.userMessage }
      }

      return { data: mapPaymentRow(data), error: null }
    } catch (err) {
      const appError = handleSupabaseError(err, 'payments.create')
      return { data: null, error: appError.userMessage }
    }
  }
}

function mapPaymentRow(row: Record<string, unknown>): Payment {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    customerId: row.customer_id as string | undefined,
    customerName: row.customer_name as string | undefined,
    accountNumber: row.account_number as string | undefined,
    invoiceId: row.invoice_id as string | undefined,
    paymentMethod: row.payment_method as Payment['paymentMethod'],
    amount: Number(row.amount),
    currency: row.currency as string,
    transactionReference: row.transaction_reference as string,
    msisdnPhone: row.msisdn_phone as string,
    senderName: row.sender_name as string | undefined,
    status: row.status as Payment['status'],
    processedAt: row.processed_at as string | undefined,
    createdAt: row.created_at as string,
  }
}
