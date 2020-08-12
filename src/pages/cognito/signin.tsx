import { Auth } from 'aws-amplify';
import React from 'react';

export const SignInPage: React.FC = (): JSX.Element => {
  const handleLineLoginClick = async () => {
    await Auth.federatedSignIn({
      customProvider: `${process.env.NEXT_PUBLIC_DEPLOY_STAGE}-LINE`,
    });
  };

  return (
    <button type="button" onClick={handleLineLoginClick}>
      LINEでログイン
    </button>
  );
};

export default SignInPage;
