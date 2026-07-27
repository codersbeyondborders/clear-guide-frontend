/**
 * Role permission matrix for company members.
 * Used in all /api/company/* routes to gate actions by role.
 */
import type { CompanyRole } from '@/lib/types'

export const ROLE_HIERARCHY: Record<CompanyRole, number> = {
  owner:   5,
  admin:   4,
  manager: 3,
  creator: 2,
  viewer:  1,
}

/** Returns true if `actorRole` has at least as much privilege as `required`. */
export function hasRole(actorRole: CompanyRole, required: CompanyRole): boolean {
  return ROLE_HIERARCHY[actorRole] >= ROLE_HIERARCHY[required]
}

export type Permission =
  | 'edit_company'      // edit company details
  | 'invite_members'    // send invitations
  | 'change_roles'      // change a member's role
  | 'create_manual'     // create or edit a manual
  | 'publish_manual'    // set status to published
  | 'view_analytics'    // view analytics
  | 'submit_review'     // submit a manual for review
  | 'approve_review'    // approve/reject review

const PERMISSION_MAP: Record<Permission, CompanyRole> = {
  edit_company:   'admin',
  invite_members: 'manager',
  change_roles:   'admin',
  create_manual:  'creator',
  submit_review:  'creator',
  publish_manual: 'manager',
  approve_review: 'manager',
  view_analytics: 'viewer',
}

export function can(role: CompanyRole, permission: Permission): boolean {
  return hasRole(role, PERMISSION_MAP[permission])
}

export const ALL_ROLES: CompanyRole[] = ['owner', 'admin', 'manager', 'creator', 'viewer']

/** Human-readable role labels */
export const ROLE_LABELS: Record<CompanyRole, string> = {
  owner:   'Owner',
  admin:   'Admin',
  manager: 'Manager',
  creator: 'Creator',
  viewer:  'Viewer',
}

export const ROLE_DESCRIPTIONS: Record<CompanyRole, string> = {
  owner:   'Full access. Owns the company account.',
  admin:   'Can edit company details, invite members, and manage roles.',
  manager: 'Can invite members and publish manuals.',
  creator: 'Can create and edit manuals, submit for review.',
  viewer:  'Read-only access to manuals and analytics.',
}
