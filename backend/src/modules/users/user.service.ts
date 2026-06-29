import { UserModel, toSafeUser } from './user.model.js';
import type { SafeUser, UserRole, UserStatus } from './user.types.js';

export type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status?: UserStatus;
};

export const createUser = async (input: CreateUserInput): Promise<SafeUser> => {
  const existing = await UserModel.findOne({ email: input.email.toLowerCase() });

  if (existing) {
    throw new Error('A user with this email already exists');
  }

  const user = await UserModel.create({
    ...input,
    email: input.email.toLowerCase(),
    status: input.status ?? 'active',
  });

  return toSafeUser(user);
};

export const listUsers = async (): Promise<SafeUser[]> => {
  const users = await UserModel.find({ status: { $ne: 'deleted' } })
    .sort({ createdAt: -1 })
    .exec();

  return users.map(toSafeUser);
};
