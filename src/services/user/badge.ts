import createError from 'http-errors';
import { addBadge } from '../dynamo/user-table/badge';

export const updateBadge = async (
  userId: string,
  badgeName: string,
  action: string,
): Promise<void> => {
  if (action === 'issue') {
    await addBadge(userId, badgeName);
  }

  if (action === 'revoke') {
    throw createError(503, 'Not Implemented');
  }

  throw createError(400, `Invalid action ${action}`);
};
