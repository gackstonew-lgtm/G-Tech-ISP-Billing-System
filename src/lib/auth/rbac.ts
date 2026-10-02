import { UserRole } from "@/types";

export type Permission =
  | "org.manage"
  | "users.manage"
  | "routers.view"
  | "routers.manage"
  | "routers.provision"
  | "customers.view"
  | "customers.create"
  | "customers.update"
  | "customers.suspend"
  | "plans.view"
  | "plans.modify"
  | "billing.view"
  | "billing.reconcile"
  | "billing.refund"
  | "vouchers.view"
  | "vouchers.generate"
  | "work_orders.view"
  | "work_orders.update"
  | "noc.view"
  | "portal.access";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    "org.manage",
    "users.manage",
    "routers.view",
    "routers.manage",
    "routers.provision",
    "customers.view",
    "customers.create",
    "customers.update",
    "customers.suspend",
    "plans.view",
    "plans.modify",
    "billing.view",
    "billing.reconcile",
    "billing.refund",
    "vouchers.view",
    "vouchers.generate",
    "work_orders.view",
    "work_orders.update",
    "noc.view",
    "portal.access",
  ],
  isp_owner: [
    "org.manage",
    "users.manage",
    "routers.view",
    "routers.manage",
    "routers.provision",
    "customers.view",
    "customers.create",
    "customers.update",
    "customers.suspend",
    "plans.view",
    "plans.modify",
    "billing.view",
    "billing.reconcile",
    "billing.refund",
    "vouchers.view",
    "vouchers.generate",
    "work_orders.view",
    "work_orders.update",
    "noc.view",
    "portal.access",
  ],
  isp_admin: [
    "users.manage",
    "routers.view",
    "routers.manage",
    "routers.provision",
    "customers.view",
    "customers.create",
    "customers.update",
    "customers.suspend",
    "plans.view",
    "billing.view",
    "billing.reconcile",
    "vouchers.view",
    "vouchers.generate",
    "work_orders.view",
    "work_orders.update",
    "noc.view",
  ],
  finance: [
    "customers.view",
    "billing.view",
    "billing.reconcile",
    "billing.refund",
    "plans.view",
    "vouchers.view",
    "noc.view",
  ],
  support: [
    "customers.view",
    "customers.create",
    "customers.update",
    "routers.view",
    "plans.view",
    "billing.view",
    "vouchers.view",
    "work_orders.view",
    "noc.view",
  ],
  technician: [
    "customers.view",
    "routers.view",
    "work_orders.view",
    "work_orders.update",
    "noc.view",
  ],
  agent: [
    "customers.view",
    "customers.create",
    "plans.view",
    "vouchers.view",
    "vouchers.generate",
    "billing.view",
  ],
  customer: [
    "portal.access",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

export function canManageTenant(role: UserRole): boolean {
  return role === "super_admin" || role === "isp_owner";
}
