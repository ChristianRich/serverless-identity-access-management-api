import type { User, UserStatus } from '@/types/user';

import createHttpError from 'http-errors';
import { getUserByActivationCode, updateUserStatus } from '../dynamo/user';

export const activate = async (activationCode: string): Promise<void> => {
  const user: User | null = await getUserByActivationCode(activationCode);

  if (!user) {
    throw createHttpError(404);
  }

  const { status, id }: { status: UserStatus; id: string } = user;

  if (status === 'CONFIRMED') {
    throw createHttpError(400, {
      detail: 'This account has already been activated',
    });
  }

  if (status !== 'UNCONFIRMED') {
    throw createHttpError(400, {
      detail: 'This account cannot be activated',
    });
  }

  await updateUserStatus(id, 'CONFIRMED');
};
