import jwkToPem from 'jwk-to-pem';
import jwt from 'jsonwebtoken';

type Jwk = {
  alg: 'RS256';
  e: 'AQAB';
  kid: string;
  kty: 'RSA';
  n: string;
  use: 'sig';
};

type Jwks = {
  keys: Jwk[];
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
  identities: {
    userId: string;
    providerName: string;
    providerType: string;
    issuer: string | null;
    primary: string;
    dateCreated: string;
  }[];
  // eslint-disable-next-line camelcase
  token_use: 'id';
  // eslint-disable-next-line camelcase
  auth_time: number;
  exp: number;
  iat: number;
};

export const cognitoRegion = (): string => {
  return process.env.NEXT_PUBLIC_COGNITO_REGION
    ? process.env.NEXT_PUBLIC_COGNITO_REGION
    : '';
};

export const cognitoUserPoolId = (): string => {
  return process.env.NEXT_PUBLIC_USER_POOL_ID
    ? process.env.NEXT_PUBLIC_USER_POOL_ID
    : '';
};

export const cognitoUserPoolClientId = (): string => {
  return process.env.NEXT_PUBLIC_SPA_CLIENT_ID
    ? process.env.NEXT_PUBLIC_SPA_CLIENT_ID
    : '';
};

export const cognitoJwksUrl = (): string => {
  return `https://cognito-idp.${cognitoRegion()}.amazonaws.com/${cognitoUserPoolId()}/.well-known/jwks.json`;
};

const fetchCognitoJwks = async (): Promise<Jwks> => {
  const jwksResponse = await fetch(cognitoJwksUrl());

  const jwks = await jwksResponse.json();

  return jwks;
};

const createPublicPems = (jwks: Jwks) => {
  const region = cognitoRegion();
  const userPoolId = cognitoUserPoolId();

  return jwks.keys.reduce((cognitoPublicPems: CognitoPublicPems, key: Jwk) => {
    if (!cognitoPublicPems[region])
      // eslint-disable-next-line no-param-reassign
      cognitoPublicPems[region] = { [userPoolId]: {} };
    if (!cognitoPublicPems[region][userPoolId])
      // eslint-disable-next-line no-param-reassign
      cognitoPublicPems[region][userPoolId] = {};
    // eslint-disable-next-line no-param-reassign
    cognitoPublicPems[region][userPoolId][key.kid] = jwkToPem(key);

    return cognitoPublicPems;
  }, {});
};

const extractPem = (
  cognitoPublicPems: CognitoPublicPems,
  token: string,
): CognitoPublicPem => {
  const jwtTokenList = token.split('.');

  const header = JSON.parse(Buffer.from(jwtTokenList[0], 'base64').toString());

  const region = cognitoRegion();
  const userPoolId = cognitoUserPoolId();

  return cognitoPublicPems[region][userPoolId][header.kid];
};

export const verifyIdToken = async (
  idToken: string,
): Promise<CognitoIdToken> => {
  // .well-known/jwks.json からJWKセットを取得
  // ここはCache出来るかも
  const jwks = await fetchCognitoJwks();

  // PEM形式のRSA鍵を生成する
  const publicPems = createPublicPems(jwks);

  // トークンに使われているPEM形式のRSA鍵を取り出す
  const pem = extractPem(publicPems, idToken);

  // IDトークンの検証を行う
  const cognitoIdToken = jwt.verify(idToken, pem, {
    algorithms: ['RS256'],
  }) as CognitoIdToken;

  // トークンの発行元を確認
  if (
    cognitoIdToken.iss !==
    `https://cognito-idp.${cognitoRegion()}.amazonaws.com/${cognitoUserPoolId()}`
  ) {
    return Promise.reject(new Error('トークンの発行元が違います。'));
  }

  // トークンが自身のClientIDに対して発行されているか確認する
  if (cognitoIdToken.aud !== cognitoUserPoolClientId()) {
    return Promise.reject(
      new Error('自身のClientIDに対して発行されたトークンではありません。'),
    );
  }

  return cognitoIdToken;
};

export const extractFacebookSubFromCognitoIdToken = (
  cognitoIdToken: CognitoIdToken,
): string => {
  if (!cognitoIdToken.identities) {
    return '';
  }

  if (
    !cognitoIdToken.identities[0].providerName ||
    !cognitoIdToken.identities[0].userId
  ) {
    return '';
  }

  if (cognitoIdToken.identities[0].providerName !== 'Facebook') {
    return '';
  }

  return cognitoIdToken.identities[0].userId;
};
