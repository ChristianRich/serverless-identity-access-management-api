import logger from '@/services/logger';
import { deleteUserById as deleteCognitoUser } from '../cognito/delete-user';
import { hardDeleteUser as deleteDynamoDBUser } from '../dynamo/user-table/user';

// *** LOSS OF DATA WARNING ***
// Remove user data from Cognito and DynamoDB (intended for cleaning up test data)
// Tip: To soft delete a user update the status: `PATCH user/{id}/status/ARCHIVED`, this will prevent authentication, but keep the record on file
export const deleteUser = async (id: string): Promise<void> => {
  await deleteCognitoUser(id);
  await deleteDynamoDBUser(id);
  logger.info(`User ${id} deleted`);
};
