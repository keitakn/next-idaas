import React from 'react';
import { GetServerSideProps } from 'next';
import {
  cognitoDomain,
  CognitoTokenResponse,
  cognitoUserPoolClientId,
} from '../../../domain/cognito';

type Props = {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  errorMessage: string;
};

export const CallbackPage: React.FC<Props> = ({
  idToken,
  accessToken,
  refreshToken,
  errorMessage,
}: Props): JSX.Element => {
  return (
    <>
      {errorMessage !== '' ? (
        <h1>{errorMessage}</h1>
      ) : (
        <>
          <h1>
            <a href="https://jwt.io" target="_blank" rel="noreferrer">
              このツール
            </a>
            でトークンの中身を確認出来る🐱（リフレッシュトークン以外）
          </h1>
          <h2>IDトークン</h2>
          <pre>{idToken}</pre>

          <h2>アクセストークン</h2>
          <pre>{accessToken}</pre>

          <h2>リフレッシュトークン</h2>
          <pre>{refreshToken}</pre>
        </>
      )}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { code } = context.query;

  if (!code) {
    return {
      props: {
        idToken: '',
        accessToken: '',
        refreshToken: '',
        errorMessage: '認可コードが設定されていません。',
      },
    };
  }

  const tokenEndpoint = `https://${cognitoDomain()}/oauth2/token`;

  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append(
    'redirect_uri',
    `${String(process.env.NEXT_PUBLIC_APP_URL)}/cognito/idp/callback`,
  );
  params.append('code', String(code));
  params.append('client_id', cognitoUserPoolClientId());

  const response = await fetch(`${tokenEndpoint}?${params.toString()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!response.ok) {
    return {
      props: {
        idToken: '',
        accessToken: '',
        refreshToken: '',
        errorMessage: 'トークンの発行に失敗しました。',
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const tokenResponseBody: CognitoTokenResponse = await response.json();

  return {
    props: {
      idToken: tokenResponseBody.id_token,
      accessToken: tokenResponseBody.access_token,
      refreshToken: tokenResponseBody.refresh_token,
      errorMessage: '',
    },
  };
};

export default CallbackPage;
