-- ====================================================================
-- G-TECH ISP OPERATING SYSTEM
-- Migration 012: Row Level Security (RLS) Policies
-- 
-- DESIGN PRINCIPLES:
-- 1. Tenant isolation: Users only see their organization's data
-- 2. Role-based access: Enforced at DB level, not just frontend
-- 3. Customer isolation: Customers only see their own records
-- 4. Credentials never exposed to browser via RLS
-- 5. RADIUS tables block all client access (server-role only)
-- ====================================================================

-- ----------------------------------------------------------------
-- HELPER FUNCTIONS
-- ----------------------------------------------------------------

-- Returns the authenticated user's organization_id
CREATE OR REPLACE FUNCTION auth_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT organization_id FROM profiles WHERE id = auth.uid();
$$;

-- Returns the authenticated user's role
CREATE OR REPLACE FUNCTION auth_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Returns true if user has staff-level access (not a customer)
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role IN ('super_admin', 'isp_owner', 'isp_admin', 'finance', 'support', 'technician', 'agent')
    FROM profiles WHERE id = auth.uid();
$$;

-- Returns true if user is admin-level (can modify critical data)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role IN ('super_admin', 'isp_owner', 'isp_admin')
    FROM profiles WHERE id = auth.uid();
$$;

-- ----------------------------------------------------------------
-- ENABLE RLS ON ALL APPLICATION TABLES
-- ----------------------------------------------------------------
ALTER TABLE organizations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites             ENABLE ROW LEVEL SECURITY;
ALTER TABLE routers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans             ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pppoe_accounts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_batches   ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotspot_vouchers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices          ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_alerts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log         ENABLE ROW LEVEL SECURITY;
-- RADIUS tables: RLS blocks all client access. Server-role only.
ALTER TABLE radcheck          ENABLE ROW LEVEL SECURITY;
ALTER TABLE radreply          ENABLE ROW LEVEL SECURITY;
ALTER TABLE radusergroup      ENABLE ROW LEVEL SECURITY;
ALTER TABLE radgroupreply     ENABLE ROW LEVEL SECURITY;
ALTER TABLE radacct           ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- ORGANIZATIONS
-- Staff can view their own org. Admins can update it.
-- ----------------------------------------------------------------
CREATE POLICY "organizations_staff_select"
    ON organizations FOR SELECT
    USING (id = auth_org_id());

CREATE POLICY "organizations_admin_update"
    ON organizations FOR UPDATE
    USING (id = auth_org_id() AND is_admin())
    WITH CHECK (id = auth_org_id());

-- ----------------------------------------------------------------
-- PROFILES
-- Users can view all profiles in their org. Users can update their own.
-- ----------------------------------------------------------------
CREATE POLICY "profiles_org_select"
    ON profiles FOR SELECT
    USING (organization_id = auth_org_id());

CREATE POLICY "profiles_self_update"
    ON profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_admin_insert"
    ON profiles FOR INSERT
    WITH CHECK (organization_id = auth_org_id() AND is_admin());

-- ----------------------------------------------------------------
-- SITES
-- Staff can read. Admins can write.
-- ----------------------------------------------------------------
CREATE POLICY "sites_staff_select"
    ON sites FOR SELECT
    USING (organization_id = auth_org_id() AND is_staff());

CREATE POLICY "sites_admin_insert"
    ON sites FOR INSERT
    WITH CHECK (organization_id = auth_org_id() AND is_admin());

CREATE POLICY "sites_admin_update"
    ON sites FOR UPDATE
    USING (organization_id = auth_org_id() AND is_admin());

-- ----------------------------------------------------------------
-- ROUTERS
-- Staff can read router metadata (excluding encrypted credentials).
-- Admins can write. Credentials handled server-side via service_role.
-- NOTE: password_encrypted and radius_secret_encrypted are never
-- selected by client — application excludes these columns explicitly.
-- ----------------------------------------------------------------
CREATE POLICY "routers_staff_select"
    ON routers FOR SELECT
    USING (organization_id = auth_org_id() AND is_staff());

CREATE POLICY "routers_admin_insert"
    ON routers FOR INSERT
    WITH CHECK (organization_id = auth_org_id() AND is_admin());

CREATE POLICY "routers_admin_update"
    ON routers FOR UPDATE
    USING (organization_id = auth_org_id() AND is_admin());

-- ----------------------------------------------------------------
-- PLANS
-- All staff can read. Admins can modify.
-- ----------------------------------------------------------------
CREATE POLICY "plans_staff_select"
    ON plans FOR SELECT
    USING (organization_id = auth_org_id() AND is_staff());

CREATE POLICY "plans_admin_write"
    ON plans FOR INSERT
    WITH CHECK (organization_id = auth_org_id() AND is_admin());

CREATE POLICY "plans_admin_update"
    ON plans FOR UPDATE
    USING (organization_id = auth_org_id() AND is_admin());

-- ----------------------------------------------------------------
-- CUSTOMERS
-- Staff can read all customers in their org.
-- Customers can only read their own record (via auth_user_id).
-- ----------------------------------------------------------------
CREATE POLICY "customers_staff_select"
    ON customers FOR SELECT
    USING (organization_id = auth_org_id() AND is_staff());

CREATE POLICY "customers_self_select"
    ON customers FOR SELECT
    USING (auth_user_id = auth.uid());

CREATE POLICY "customers_staff_insert"
    ON customers FOR INSERT
    WITH CHECK (
        organization_id = auth_org_id() AND
        auth_role() IN ('super_admin', 'isp_owner', 'isp_admin', 'support', 'agent')
    );

CREATE POLICY "customers_staff_update"
    ON customers FOR UPDATE
    USING (
        organization_id = auth_org_id() AND
        auth_role() IN ('super_admin', 'isp_owner', 'isp_admin', 'support')
    );

-- ----------------------------------------------------------------
-- PPPOE ACCOUNTS
-- CRITICAL: password_plain must never reach the browser.
-- Staff see account metadata only. Application excludes password_plain
-- in all client queries. Server-side provisioning uses service_role.
-- ----------------------------------------------------------------
CREATE POLICY "pppoe_staff_select"
    ON pppoe_accounts FOR SELECT
    USING (organization_id = auth_org_id() AND is_staff());

CREATE POLICY "pppoe_staff_insert"
    ON pppoe_accounts FOR INSERT
    WITH CHECK (
        organization_id = auth_org_id() AND
        auth_role() IN ('super_admin', 'isp_owner', 'isp_admin', 'support')
    );

CREATE POLICY "pppoe_admin_update"
    ON pppoe_accounts FOR UPDATE
    USING (
        organization_id = auth_org_id() AND
        auth_role() IN ('super_admin', 'isp_owner', 'isp_admin')
    );

-- ----------------------------------------------------------------
-- SUBSCRIPTIONS
-- Staff can read/write. Customers can read their own.
-- ----------------------------------------------------------------
CREATE POLICY "subscriptions_staff_select"
    ON subscriptions FOR SELECT
    USING (organization_id = auth_org_id() AND is_staff());

CREATE POLICY "subscriptions_customer_self_select"
    ON subscriptions FOR SELECT
    USING (
        organization_id = auth_org_id() AND
        customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "subscriptions_staff_write"
    ON subscriptions FOR INSERT
    WITH CHECK (
        organization_id = auth_org_id() AND
        auth_role() IN ('super_admin', 'isp_owner', 'isp_admin', 'finance')
    );

-- ----------------------------------------------------------------
-- VOUCHERS
-- Staff with voucher permissions can read/write.
-- ----------------------------------------------------------------
CREATE POLICY "voucher_batches_staff_select"
    ON voucher_batches FOR SELECT
    USING (organization_id = auth_org_id() AND is_staff());

CREATE POLICY "voucher_batches_agent_insert"
    ON voucher_batches FOR INSERT
    WITH CHECK (
        organization_id = auth_org_id() AND
        auth_role() IN ('super_admin', 'isp_owner', 'isp_admin', 'finance', 'agent')
    );

CREATE POLICY "hotspot_vouchers_staff_select"
    ON hotspot_vouchers FOR SELECT
    USING (organization_id = auth_org_id() AND is_staff());

CREATE POLICY "hotspot_vouchers_insert"
    ON hotspot_vouchers FOR INSERT
    WITH CHECK (organization_id = auth_org_id() AND is_staff());

-- ----------------------------------------------------------------
-- BILLING — INVOICES & PAYMENTS
-- Finance/admin can read/write. Customers can read their own invoices.
-- Payment records are IMMUTABLE — no UPDATE/DELETE for normal users.
-- ----------------------------------------------------------------
CREATE POLICY "invoices_staff_select"
    ON invoices FOR SELECT
    USING (organization_id = auth_org_id() AND is_staff());

CREATE POLICY "invoices_customer_self_select"
    ON invoices FOR SELECT
    USING (
        organization_id = auth_org_id() AND
        customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "invoices_finance_insert"
    ON invoices FOR INSERT
    WITH CHECK (
        organization_id = auth_org_id() AND
        auth_role() IN ('super_admin', 'isp_owner', 'isp_admin', 'finance')
    );

CREATE POLICY "payments_staff_select"
    ON payments FOR SELECT
    USING (organization_id = auth_org_id() AND is_staff());

CREATE POLICY "payments_customer_self_select"
    ON payments FOR SELECT
    USING (
        organization_id = auth_org_id() AND
        customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    );

-- Payment INSERT is service-role only (callbacks processed server-side)
-- No client UPDATE or DELETE on payments.

-- ----------------------------------------------------------------
-- WORK ORDERS
-- Staff read. Technicians can update their assigned orders.
-- ----------------------------------------------------------------
CREATE POLICY "work_orders_staff_select"
    ON work_orders FOR SELECT
    USING (organization_id = auth_org_id() AND is_staff());

CREATE POLICY "work_orders_admin_insert"
    ON work_orders FOR INSERT
    WITH CHECK (
        organization_id = auth_org_id() AND
        auth_role() IN ('super_admin', 'isp_owner', 'isp_admin', 'support')
    );

CREATE POLICY "work_orders_technician_update"
    ON work_orders FOR UPDATE
    USING (
        organization_id = auth_org_id() AND (
            is_admin() OR
            assigned_technician_id = auth.uid()
        )
    );

-- ----------------------------------------------------------------
-- NETWORK ALERTS
-- Staff can read. Admins can resolve.
-- ----------------------------------------------------------------
CREATE POLICY "network_alerts_staff_select"
    ON network_alerts FOR SELECT
    USING (organization_id = auth_org_id() AND is_staff());

CREATE POLICY "network_alerts_admin_insert"
    ON network_alerts FOR INSERT
    WITH CHECK (organization_id = auth_org_id() AND is_staff());

CREATE POLICY "network_alerts_admin_update"
    ON network_alerts FOR UPDATE
    USING (organization_id = auth_org_id() AND is_admin());

-- ----------------------------------------------------------------
-- AUDIT LOG
-- Read: admins only. Insert: any authenticated staff.
-- No UPDATE or DELETE — audit log is append-only.
-- ----------------------------------------------------------------
CREATE POLICY "audit_log_admin_select"
    ON audit_log FOR SELECT
    USING (organization_id = auth_org_id() AND is_admin());

CREATE POLICY "audit_log_staff_insert"
    ON audit_log FOR INSERT
    WITH CHECK (organization_id = auth_org_id() AND is_staff());

-- ----------------------------------------------------------------
-- RADIUS TABLES — BLOCK ALL CLIENT ACCESS
-- These tables contain FreeRADIUS credentials and session data.
-- No authenticated browser client should ever read or write these.
-- Access is exclusively via service_role on the provisioning server.
-- ----------------------------------------------------------------
-- No policies created = default DENY for all authenticated users.
-- service_role bypasses RLS by design.
