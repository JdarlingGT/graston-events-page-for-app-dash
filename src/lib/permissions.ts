export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  GUEST: 'guest',
};

export const PERMISSIONS = {
  [ROLES.ADMIN]: [
    'manage_users',
    'manage_events',
    'manage_tasks',
    'manage_integrations',
  ],
  [ROLES.MANAGER]: [
    'manage_events',
    'manage_tasks',
    'manage_integrations',
  ],
  [ROLES.USER]: [
    'view_events',
    'view_tasks',
  ],
  [ROLES.GUEST]: [
    'view_events',
  ],
};

export function hasPermission(userRole: string, requiredPermission: string): boolean {
  const userPermissions = PERMISSIONS[userRole] || [];
  return userPermissions.includes(requiredPermission);
}