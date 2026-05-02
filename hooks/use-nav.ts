import type { NavItem, NavGroup } from '@/types';

/**
 * RBAC filtering is disabled in this build (no Clerk orgs/plans).
 * These return inputs unchanged so any callers continue to compile.
 */
export function useFilteredNavItems(items: NavItem[]) {
  return items;
}

export function useFilteredNavGroups(groups: NavGroup[]) {
  return groups;
}
