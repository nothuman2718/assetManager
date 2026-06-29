import { UserModel, toSafeUser } from '../users/user.model.js';
import type { SafeUser } from '../users/user.types.js';
import { verifyPassword } from './password.service.js';
import { signAuthToken } from './token.service.js';

export type LoginResult = {
  token: string;
  user: SafeUser;
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<LoginResult> => {
  const user = await UserModel.findOne({
    email: email.toLowerCase(),
    status: 'active',
  }).exec();

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);

  if (!passwordMatches) {
    throw new Error('Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save();

  return {
    token: signAuthToken({
      sub: user.id,
      role: user.role,
    }),
    user: toSafeUser(user),
  };
};
