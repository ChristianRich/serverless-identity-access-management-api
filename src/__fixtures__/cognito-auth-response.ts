import accessToken from './access-token.json';
import idToken from './id-token.json';

export const getCognitoAuthResponse = () => ({
  AccessToken: accessToken,
  ExpiresIn: 18000,
  IdToken: idToken,
  RefreshToken: '',
  TokenType: 'Bearer',
});
