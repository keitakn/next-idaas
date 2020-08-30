import React from 'react';
import { GetServerSideProps } from 'next';
import { findCookies } from '../../infrastructure/Cookie';
import { verifyIdToken } from '../../domain/cognito';

type Props = {
  user?: { sub: string };
};

export const AuthorizedPage: React.FC<Props> = ({
  user,
}: Props): JSX.Element => {
  return (
    <>
      {user ? (
        <div>
          Cognitoで認証済のユーザーです。 ユーザーIDは {user.sub} です！
        </div>
      ) : (
        ''
      )}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = findCookies<{ [key: string]: string }>(context);

  const keyPrefix = `CognitoIdentityServiceProvider.${process.env.NEXT_PUBLIC_SPA_CLIENT_ID}`;
  const userNameKey = `${keyPrefix}.LastAuthUser`;

  const userName = cookies[userNameKey];

  const idTokenKey = `${keyPrefix}.${encodeURIComponent(userName)}.idToken`;

  const idToken = cookies[idTokenKey];

  const cognitoIdToken = await verifyIdToken(idToken);

  return { props: { user: { sub: cognitoIdToken.sub } } };
};

export default AuthorizedPage;
