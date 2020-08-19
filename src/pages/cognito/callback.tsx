import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

export const CallbackPage: React.FC = (): JSX.Element => {
  const router = useRouter();
  useEffect(() => {
    router.replace('/cognito/authorized');
  });

  return <div>認証後のページにリダイレクトします。少々お待ち下さい。</div>;
};

export default CallbackPage;
