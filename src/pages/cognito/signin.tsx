import { Auth } from 'aws-amplify';
import React from 'react';

export const SignInPage: React.FC = (): JSX.Element => {
  const handleLineLoginClick = async () => {
    await Auth.federatedSignIn({
      customProvider: 'LINE',
    });
  };

  return (
    <button type="button" onClick={handleLineLoginClick}>
      LINEでログイン
    </button>
  );
};

export default SignInPage;
