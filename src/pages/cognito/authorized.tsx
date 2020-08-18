import React from 'react';
import { GetServerSideProps } from 'next';
import jwkToPem from 'jwk-to-pem';
import jwt from 'jsonwebtoken';
import { findCookies } from '../../infrastructure/Cookie';

const extractPem = (
  cognitoPublicPems: CognitoPublicPems,
  token: string,
  region: string,
  userPoolId: string,
) => {
  const jwtTokenList = token.split('.');

  const header = JSON.parse(Buffer.from(jwtTokenList[0], 'base64').toString());

  return cognitoPublicPems[region][userPoolId][header.kid];
};

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

  const idTokenKey = `${keyPrefix}.${userName}.idToken`;

  const idToken = cookies[idTokenKey];

  const region = process.env.NEXT_PUBLIC_COGNITO_REGION
    ? process.env.NEXT_PUBLIC_COGNITO_REGION
    : '';
  const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID
    ? process.env.NEXT_PUBLIC_USER_POOL_ID
    : '';

  const jwksUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
  const jwksResponse = await fetch(jwksUrl);

  const jwks = await jwksResponse.json();

  const publicPems = jwks.keys.reduce(
    (cognitoPublicPems: CognitoPublicPems, key: Jwk) => {
      if (!cognitoPublicPems[region])
        // eslint-disable-next-line no-param-reassign
        cognitoPublicPems[region] = { [userPoolId]: {} };
      if (!cognitoPublicPems[region][userPoolId])
        // eslint-disable-next-line no-param-reassign
        cognitoPublicPems[region][userPoolId] = {};
      // eslint-disable-next-line no-param-reassign
      cognitoPublicPems[region][userPoolId][key.kid] = jwkToPem(key);

      return cognitoPublicPems;
    },
    {},
  );

  const pem = extractPem(publicPems, idToken, region, userPoolId);

  const cognitoIdToken = jwt.verify(idToken, pem, {
    algorithms: ['RS256'],
  }) as CognitoIdToken;

  return { props: { user: { sub: cognitoIdToken.sub } } };
};

type Jwk = {
  alg: 'RS256';
  e: 'AQAB';
  kid: string;
  kty: 'RSA';
  n: string;
  use: 'sig';
};

type CognitoPublicPem = string;

type CognitoPublicPems = {
  [region: string]: {
    [userPoolId: string]: {
      [kid: string]: CognitoPublicPem;
    };
  };
};

type CognitoIdToken = {
  // eslint-disable-next-line camelcase
  at_hash: string;
  sub: string;
  'cognito:groups': string[];
  email: string;
  // eslint-disable-next-line camelcase
  email_verified: false;
  iss: string;
  aud: string;
  identities: { [key: string]: string | number }[];
  // eslint-disable-next-line camelcase
  token_use: 'id';
  // eslint-disable-next-line camelcase
  auth_time: number;
  exp: number;
  iat: number;
};

export default AuthorizedPage;
