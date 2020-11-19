import React from 'react';
import { GetServerSideProps } from 'next';
import { findCookies } from '../../infrastructure/Cookie';
import {
  verifyIdToken,
  extractFacebookSubFromCognitoIdToken,
} from '../../domain/cognito';

type Props = {
  user: {
    sub: string;
    profileImageUrl: string;
  };
};

export const AuthorizedPage: React.FC<Props> = ({
  user,
}: Props): JSX.Element => {
  return (
    <>
      {user ? (
        <div>
          <p>Cognitoで認証済のユーザーです。 ユーザーIDは {user.sub} です！</p>
          <p>
            <img src={user.profileImageUrl} alt="ユーザープロフィール画像" />
          </p>
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

  // 単純なURLエンコードだとメールアドレス内の+も変換されてしまうので以下のように @ のみを置き換えるようにする
  const idTokenKey = `${keyPrefix}.${userName.replace('@', '%40')}.idToken`;

  const idToken = cookies[idTokenKey];

  const cognitoIdToken = await verifyIdToken(idToken);

  const facebookSub = extractFacebookSubFromCognitoIdToken(cognitoIdToken);

  const profileImageUrl = `https://graph.facebook.com/${facebookSub}/picture?type=large`;

  return { props: { user: { sub: cognitoIdToken.sub, profileImageUrl } } };
};

export default AuthorizedPage;
