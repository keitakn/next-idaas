import React, { useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { Amplify, Auth } from 'aws-amplify';
import { CognitoUser } from 'amazon-cognito-identity-js';

type Props = {
  user: { sub: string; authenticationToken: string };
  error: Error;
};

const Confirm: React.FC<Props> = ({ user, error }: Props) => {
  useEffect(() => {
    let unmounted = false;

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      if (!unmounted) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const cognitoUser: CognitoUser = await Auth.signIn(String(user?.sub));

        await Auth.sendCustomChallengeAnswer(
          cognitoUser,
          String(user?.authenticationToken),
        );

        // eslint-disable-next-line no-restricted-globals
        location.href = 'http://localhost:3900/cognito/authorized';
      }
    })();

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      unmounted = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {error ? <div>エラーが発生しました。 {error.message}</div> : ''}
      {user ? <div>{user.sub} の登録が完了しました！</div> : ''}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  Amplify.configure({
    Auth: {
      region: process.env.NEXT_PUBLIC_COGNITO_REGION,
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID,
      userPoolWebClientId: process.env.NEXT_PUBLIC_SPA_CLIENT_ID,
      mandatorySignIn: false,
      authenticationFlowType: 'CUSTOM_AUTH',
      cookieStorage: {
        domain: process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN,
        path: '/',
        expires: 7,
        secure: false,
      },
    },
  });

  try {
    const { sub, code, authenticationToken } = context.query;

    if (
      sub === undefined ||
      code === undefined ||
      authenticationToken === undefined
    ) {
      return {
        props: {},
      };
    }

    // 返り値はSUCCESSという文字列が返ってくるだけ
    await Auth.confirmSignUp(String(sub), String(code));

    return { props: { user: { sub, authenticationToken } } };
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { props: { error: e } };
  }
};

export default Confirm;
