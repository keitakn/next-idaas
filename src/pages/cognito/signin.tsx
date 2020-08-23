import { Auth } from 'aws-amplify';
import React from 'react';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';

export const SignInPage: React.FC = (): JSX.Element => {
  const handleLineLoginClick = async () => {
    await Auth.federatedSignIn({
      customProvider: 'LINE',
    });
  };

  const handleFacebookLoginClick = async () => {
    await Auth.federatedSignIn({
      provider: CognitoHostedUIIdentityProvider.Facebook,
    });
  };

  return (
    <>
      <button type="button" onClick={handleLineLoginClick}>
        LINEでログイン
      </button>
      <button type="button" onClick={handleFacebookLoginClick}>
        Facebookでログイン
      </button>
    </>
  );
};

export default SignInPage;
