import type { User } from '@/types/user';

import createHttpError from 'http-errors';
import { getUserById, updateUserData } from '../dynamo/user';

export type UpdateUserDataMode = 'OVERWRITE' | 'MERGE';

export const updateData = async (
  id: string,
  update: Record<string, unknown>,
  mode: UpdateUserDataMode = 'MERGE',
): Promise<void> => {
  if (mode === 'OVERWRITE') {
    await updateUserData(id, update);
  }

  const user: User | null = await getUserById(id);

  if (!user) {
    throw createHttpError(404);
  }

  // Merge with existing data
  const mergeUpdate: Record<string, unknown> = Object.assign(
    user?.data || {},
    update,
  );
  await updateUserData(id, mergeUpdate);
};
