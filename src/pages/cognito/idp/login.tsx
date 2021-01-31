import React from 'react';
import { cognitoUserPoolClientId } from '../../../domain/cognito';

export const LoginPage: React.FC = (): JSX.Element => {
  const handleLineLoginClick = () => {
    const redirectUri = `${String(
      process.env.NEXT_PUBLIC_APP_URL,
    )}/cognito/idp/callback`;

    const authorizeUrl = `https://${String(
      process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
    )}/oauth2/authorize?response_type=code&client_id=${cognitoUserPoolClientId()}&redirect_uri=${redirectUri}&identity_provider=LINE`;

    window.location.href = authorizeUrl;
  };

  const handleFacebookLoginClick = () => {
    const redirectUri = `${String(
      process.env.NEXT_PUBLIC_APP_URL,
    )}/cognito/idp/callback`;

    const authorizeUrl = `https://${String(
      process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
    )}/oauth2/authorize?response_type=code&client_id=${cognitoUserPoolClientId()}&redirect_uri=${redirectUri}&identity_provider=Facebook`;

    window.location.href = authorizeUrl;
  };

  return (
    <>
      <h1>Cognito + ソーシャルログイン（aws-amplify未使用バージョン）</h1>
      <button type="button" onClick={handleLineLoginClick}>
        LINEでログイン
      </button>
      <button type="button" onClick={handleFacebookLoginClick}>
        Facebookでログイン
      </button>
    </>
  );
};

export default LoginPage;
