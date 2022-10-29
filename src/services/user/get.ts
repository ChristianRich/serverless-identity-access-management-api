import type { User } from '@/types/user';
import createError from 'http-errors';
import { UserModel } from '@/models/user-model';
import { getUserById as getDynamoUserById } from '../dynamo/user';

export const getUserById = async (id: string): Promise<UserModel> => {
  const user: User | null = await getDynamoUserById(id);

  if (!user) {
    throw createError(404);
  }

  return new UserModel(user);
};
