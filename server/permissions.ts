export type Role = "student" | "school_student" | "university_student" | "teacher" | "content_admin" | "admin";

export type Permission =
  | "learn"
  | "edit_content"
  | "publish_content"
  | "manage_site"
  | "manage_users";

const siteManagementEntities = new Set([
  "settings",
  "pages",
  "pageSections",
  "texts",
  "navigation",
]);

const permissions: Record<Role, readonly Permission[]> = {
  student: ["learn"],
  school_student: ["learn"],
  university_student: ["learn"],
  teacher: ["learn", "edit_content"],
  content_admin: ["learn", "edit_content", "publish_content"],
  admin: ["learn", "edit_content", "publish_content", "manage_site", "manage_users"],
};

export function canAccess(role: Role, allowed: Role[]) {
  return allowed.includes(role);
}

export function hasPermission(role: Role, permission: Permission) {
  return permissions[role].includes(permission);
}

/**
 * The generic CMS is an administrative surface, not the teacher workspace.
 * Teachers manage only their own lessons through the scoped teacher routes.
 */
export function cmsPermissionForEntity(entity: string): Permission {
  return siteManagementEntities.has(entity) ? "manage_site" : "publish_content";
}
