import React from 'react';
import { GetServerSideProps } from 'next';
import { findCookies } from '../../infrastructure/Cookie';
import {
  verifyIdToken,
  extractFacebookSubFromCognitoIdToken,
  extractNameFromCognitoIdToken,
} from '../../domain/cognito';

type Props = {
  user: {
    sub: string;
    name: string;
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
          <p>名前は {user.name} です！</p>
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

  const defaultImageUrl =
    'https://avatars0.githubusercontent.com/u/42195274?s=200&v=4';
  const profileImageUrl =
    facebookSub === ''
      ? defaultImageUrl
      : `https://graph.facebook.com/${facebookSub}/picture?type=large`;

  // ログインIDとしても利用される、CognitoUserNameではないので注意、ここで取得するのは単なる名前なのでユニークではない
  const extractedName = extractNameFromCognitoIdToken(cognitoIdToken);
  const name = extractedName === '' ? '未設定' : extractedName;

  return {
    props: { user: { sub: cognitoIdToken.sub, name, profileImageUrl } },
  };
};

export default AuthorizedPage;
