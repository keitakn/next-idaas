import React, { ReactElement } from 'react';
import { AppProps } from 'next/app';
import Amplify from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: process.env.NEXT_PUBLIC_COGNITO_REGION,
    userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID,
    userPoolWebClientId: process.env.NEXT_PUBLIC_SPA_CLIENT_ID,
    mandatorySignIn: false,
    authenticationFlowType: 'USER_PASSWORD_AUTH',
    cookieStorage: {
      domain: process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN,
      path: '/',
      expires: 7,
      secure: false,
    },
  },
  oauth: {
    domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
    scope: ['profile', 'email', 'openid'],
    redirectSignIn: `${String(
      process.env.NEXT_PUBLIC_APP_URL,
    )}/cognito/callback`,
    redirectSignOut: `${String(
      process.env.NEXT_PUBLIC_APP_URL,
    )}/cognito/logout`,
    responseType: 'code',
  },
});

const CustomApp = ({ Component, pageProps }: AppProps): ReactElement => {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Component {...pageProps} />;
};

export default CustomApp;
