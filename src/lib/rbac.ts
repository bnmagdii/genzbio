import { UserProfile } from '../types';

/**
 * Checks if the user list/profile or role contains 'super_admin'
 */
export function isSuperAdmin(userOrRoles?: UserProfile | string[] | string | null): boolean {
  if (!userOrRoles) return false;
  if (Array.isArray(userOrRoles)) {
    return userOrRoles.includes('super_admin');
  }
  if (typeof userOrRoles === 'string') {
    return userOrRoles === 'super_admin';
  }
  // UserProfile object
  const rolesList = userOrRoles.roles || (userOrRoles.role ? [userOrRoles.role] : []);
  return rolesList.includes('super_admin') || userOrRoles.role === 'super_admin';
}

/**
 * Checks if the user list/profile or role contains 'super_admin' or 'admin'
 */
export function isAdmin(userOrRoles?: UserProfile | string[] | string | null): boolean {
  if (!userOrRoles) return false;
  if (Array.isArray(userOrRoles)) {
    return userOrRoles.includes('super_admin') || userOrRoles.includes('admin');
  }
  if (typeof userOrRoles === 'string') {
    return userOrRoles === 'super_admin' || userOrRoles === 'admin';
  }
  // UserProfile object
  const rolesList = userOrRoles.roles || (userOrRoles.role ? [userOrRoles.role] : []);
  return (
    rolesList.includes('super_admin') ||
    rolesList.includes('admin') ||
    userOrRoles.role === 'super_admin' ||
    userOrRoles.role === 'admin'
  );
}

/**
 * Checks if the user list/profile or role contains 'super_admin', 'admin', or 'moderator'
 */
export function isModerator(userOrRoles?: UserProfile | string[] | string | null): boolean {
  if (!userOrRoles) return false;
  if (Array.isArray(userOrRoles)) {
    return (
      userOrRoles.includes('super_admin') ||
      userOrRoles.includes('admin') ||
      userOrRoles.includes('moderator')
    );
  }
  if (typeof userOrRoles === 'string') {
    return (
      userOrRoles === 'super_admin' ||
      userOrRoles === 'admin' ||
      userOrRoles === 'moderator'
    );
  }
  // UserProfile object
  const rolesList = userOrRoles.roles || (userOrRoles.role ? [userOrRoles.role] : []);
  return (
    rolesList.includes('super_admin') ||
    rolesList.includes('admin') ||
    rolesList.includes('moderator') ||
    userOrRoles.role === 'super_admin' ||
    userOrRoles.role === 'admin' ||
    userOrRoles.role === 'moderator'
  );
}

/**
 * Checks if the user has standard user role or higher
 */
export function isUser(userOrRoles?: UserProfile | string[] | string | null): boolean {
  if (!userOrRoles) return false;
  if (Array.isArray(userOrRoles)) {
    return (
      userOrRoles.includes('super_admin') ||
      userOrRoles.includes('admin') ||
      userOrRoles.includes('moderator') ||
      userOrRoles.includes('user')
    );
  }
  if (typeof userOrRoles === 'string') {
    return ['super_admin', 'admin', 'moderator', 'user'].includes(userOrRoles);
  }
  // UserProfile object
  const rolesList = userOrRoles.roles || (userOrRoles.role ? [userOrRoles.role] : []);
  return (
    rolesList.includes('user') ||
    rolesList.includes('moderator') ||
    rolesList.includes('admin') ||
    rolesList.includes('super_admin') ||
    ['super_admin', 'admin', 'moderator', 'user'].includes(userOrRoles.role || '')
  );
}

/**
 * Prints system-level role debug logs to the console
 */
export function logRbacDebug(uid: string, role: string, roles: string[]): void {
  const superAdminFlag = isSuperAdmin(roles) || role === 'super_admin';
  console.log('====== [RBAC DEBUG LOG] ======');
  console.log(`Current UID: ${uid}`);
  console.log(`Current role: ${role}`);
  console.log(`Current roles array: [${(roles || []).join(', ')}]`);
  console.log(`Is Super Admin = ${superAdminFlag}`);
  console.log('==============================');
}
