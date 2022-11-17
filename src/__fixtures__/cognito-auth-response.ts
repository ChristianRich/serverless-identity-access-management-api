import { AuthenticationResultType } from '@aws-sdk/client-cognito-identity-provider';
import accessToken from './access-token.json';
import idToken from './id-token.json';

export const getCognitoAuthResponse = (): AuthenticationResultType => ({
  AccessToken: String(accessToken),
  ExpiresIn: 18000,
  IdToken: String(idToken),
  RefreshToken: '',
  TokenType: 'Bearer',
});
