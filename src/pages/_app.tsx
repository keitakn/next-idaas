import React, { ReactElement } from 'react';
import { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import Amplify from 'aws-amplify';
import createStore from '../ducks/createStore';

Amplify.configure({
  Auth: {
    region: 'ap-northeast-1',
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
    redirectSignIn: `${process.env.NEXT_PUBLIC_APP_URL}/cognito/callback`,
    redirectSignOut: `${process.env.NEXT_PUBLIC_APP_URL}/cognito/logout`,
    responseType: 'code',
  },
});

const CustomApp = ({ Component, pageProps }: AppProps): ReactElement => {
  return (
    <Provider store={createStore()}>
      <Component {...pageProps} />
    </Provider>
  );
};

export default CustomApp;
