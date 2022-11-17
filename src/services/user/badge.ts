// import createError from 'http-errors';
// import { UserBadgeName } from '@/types/user';
// import { addBadge, revokeBadge } from '../dynamo/user-table/badge';

// export const updateBadge = async (
//   userId: string,
//   badgeName: string,
//   action: string,
// ): Promise<void> => {
//   if (action === 'issue') {
//     await addBadge(userId, <UserBadgeName>badgeName);
//   }

//   if (action === 'revoke') {
//     await revokeBadge(userId, badgeName);
//   }

//   throw createError(400, `Invalid action ${action}`);
// };
