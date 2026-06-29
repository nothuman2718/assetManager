import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';

import { env } from '../../shared/config/env.js';
import { logger } from '../../shared/logger/logger.js';
import { hashPassword } from '../auth/password.service.js';
import { UserModel } from '../users/user.model.js';
import { userRoles, userStatuses } from '../users/user.types.js';

const seedUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(userRoles),
  status: z.enum(userStatuses).default('active'),
});

const seedUsersSchema = z.array(seedUserSchema);

export const bootstrapDevelopmentSeed = async () => {
  if (env.nodeEnv !== 'development') {
    return;
  }

  const seedPath = path.resolve(process.cwd(), 'src/seed/management/users.json');
  const rawSeed = await readFile(seedPath, 'utf-8');
  const seedUsers = seedUsersSchema.parse(JSON.parse(rawSeed));

  for (const seedUser of seedUsers) {
    const passwordHash = await hashPassword(seedUser.password);

    await UserModel.updateOne(
      { email: seedUser.email.toLowerCase() },
      {
        $set: {
          name: seedUser.name,
          email: seedUser.email.toLowerCase(),
          passwordHash,
          role: seedUser.role,
          status: seedUser.status,
        },
        $setOnInsert: {
          lastLoginAt: undefined,
        },
      },
      { upsert: true },
    );
  }

  logger.info(`Development seed bootstrapped ${seedUsers.length} users`);
};
