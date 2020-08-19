import React from 'react';
import Link from 'next/link';

const IndexPage: React.FC = () => {
  return (
    <>
      <h1>Next.js + IDaaS(Identity as a Service)</h1>
      <div>
        <ul>
          <li>
            <Link href="/cognito/signup">Cognitoでサインアップ</Link>
          </li>
          <li>
            <Link href="/cognito/signin">Cognitoでサインイン</Link>
          </li>
          <li>
            <Link href="/cognito/authorized">
              Cognitoでサインイン済じゃないと見れないページ
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default IndexPage;
