import type { User } from '@/types/user';
import createHttpError from 'http-errors';
import type { JsonObject } from 'type-fest';
import { getUserById } from './get';
import { updateUserData } from './user';

export type UpdateUserDataMode = 'OVERWRITE' | 'MERGE';

export const updateData = async (
  id: string,
  update: Record<string, unknown> = {},
  mode: UpdateUserDataMode = 'MERGE',
): Promise<void> => {
  if (!Object.keys(update).length) {
    return;
  }

  if (mode === 'OVERWRITE') {
    await updateUserData(id, update);
  }

  const user: User | null = await getUserById(id);

  if (!user) {
    throw createHttpError(404);
  }

  const mergeUpdate: JsonObject = Object.assign(user?.data || {}, update);
  await updateUserData(id, mergeUpdate);
};
