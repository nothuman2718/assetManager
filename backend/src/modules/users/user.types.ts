export const userRoles = ['Admin', 'Engineer', 'Operator'] as const;
export type UserRole = (typeof userRoles)[number];

export const userStatuses = ['active', 'inactive', 'deleted'] as const;
export type UserStatus = (typeof userStatuses)[number];

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};
