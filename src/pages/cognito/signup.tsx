import React from 'react';
import { AmplifyAuthenticator, AmplifySignUp } from '@aws-amplify/ui-react';

const SignupPage: React.FC = () => {
  return (
    <AmplifyAuthenticator>
      <AmplifySignUp
        headerText="Sign Up"
        slot="sign-up"
        usernameAlias="email"
        formFields={[
          {
            type: 'email',
            label: 'メールアドレス(必須)',
            placeholder: '',
            required: true,
          },
          {
            type: 'password',
            label: 'パスワード(必須)',
            placeholder: '',
            required: true,
          },
        ]}
      />
    </AmplifyAuthenticator>
  );
};

export default SignupPage;
