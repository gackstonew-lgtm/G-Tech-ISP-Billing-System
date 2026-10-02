// ====================================================================
// G-TECH ISP OPERATING SYSTEM
// Routers Service — Data Access Layer
// 
// SECURITY: Router credentials (password_encrypted, radius_secret_encrypted)
// are NEVER returned to the client. They are excluded from all queries
// and are only accessible server-side via service_role for provisioning.
// ====================================================================

import type { Router } from '@/types'
import { SEED_ROUTERS } from '@/lib/db/mock-db'
import { handleSupabaseError } from '@/lib/supabase/errors'
import type { ServiceResult } from './customers.service'

const SUPABASE_READY = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://[PROJECT_REF].supabase.co'
)

// Columns safe to expose to authenticated browser clients.
// CRITICAL: password_encrypted and radius_secret_encrypted are EXCLUDED.
const SAFE_ROUTER_COLUMNS = [
  'id', 'organization_id', 'site_id', 'name', 'management_ip',
  'api_port', 'api_ssl_port', 'username',
  'routeros_version', 'board_model', 'cpu_load', 'free_memory_mb',
  'uptime', 'connection_type', 'wireguard_public_key', 'wireguard_tunnel_ip',
  'status', 'last_seen_at', 'created_at', 'updated_at',
].join(',')

export class RoutersService {
  static async list(): Promise<ServiceResult<Router[]>> {
    if (!SUPABASE_READY) {
      return { data: SEED_ROUTERS, error: null, count: SEED_ROUTERS.length }
    }

    try {
      const { createSupabaseServerClient } = await import('@/lib/supabase/server')
      const supabase = await createSupabaseServerClient()

      const { data, error, count } = await supabase
        .from('routers')
        .select(SAFE_ROUTER_COLUMNS, { count: 'exact' })
        .order('name', { ascending: true })

      if (error) {
        const appError = handleSupabaseError(error, 'routers.list')
        return { data: null, error: appError.userMessage }
      }

      const routers: Router[] = (data as unknown as Record<string, unknown>[] ?? []).map(mapRouterRow)
      return { data: routers, error: null, count: count ?? routers.length }
    } catch (err) {
      const appError = handleSupabaseError(err, 'routers.list')
      return { data: null, error: appError.userMessage }
    }
  }

  /**
   * Updates router telemetry (CPU, memory, uptime, status).
   * Called by the network gateway service, not browser clients.
   */
  static async updateTelemetry(
    routerId: string,
    telemetry: {
      cpuLoad: number
      freeMemoryMb: number
      uptime: string
      status: Router['status']
      lastSeenAt?: string
    }
  ): Promise<ServiceResult<null>> {
    if (!SUPABASE_READY) {
      return { data: null, error: null }
    }

    try {
      // This uses service client to update telemetry from the gateway service.
      // Only callable from server-side provisioning services.
      const { createSupabaseServiceClient } = await import('@/lib/supabase/server')
      const supabase = createSupabaseServiceClient()

      const { error } = await supabase
        .from('routers')
        .update({
          cpu_load: telemetry.cpuLoad,
          free_memory_mb: telemetry.freeMemoryMb,
          uptime: telemetry.uptime,
          status: telemetry.status,
          last_seen_at: telemetry.lastSeenAt ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', routerId)

      if (error) {
        const appError = handleSupabaseError(error, 'routers.updateTelemetry')
        return { data: null, error: appError.userMessage }
      }

      return { data: null, error: null }
    } catch (err) {
      const appError = handleSupabaseError(err, 'routers.updateTelemetry')
      return { data: null, error: appError.userMessage }
    }
  }
}

function mapRouterRow(row: Record<string, unknown>): Router {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    siteId: row.site_id as string | undefined,
    name: row.name as string,
    managementIp: row.management_ip as string,
    apiPort: Number(row.api_port),
    apiSslPort: Number(row.api_ssl_port),
    username: row.username as string,
    routerosVersion: row.routeros_version as string,
    boardModel: row.board_model as string,
    cpuLoad: Number(row.cpu_load),
    freeMemoryMb: Number(row.free_memory_mb),
    uptime: row.uptime as string,
    connectionType: row.connection_type as Router['connectionType'],
    wireguardPublicKey: row.wireguard_public_key as string | undefined,
    wireguardTunnelIp: row.wireguard_tunnel_ip as string | undefined,
    status: row.status as Router['status'],
    lastSeenAt: row.last_seen_at as string,
    createdAt: row.created_at as string,
  }
}
