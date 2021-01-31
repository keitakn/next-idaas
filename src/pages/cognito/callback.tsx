import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

export const CallbackPage: React.FC = (): JSX.Element => {
  const router = useRouter();
  useEffect(() => {
    let unmounted = false;

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      if (!unmounted) {
        await router.replace('/cognito/authorized');
      }
    })();

    const cleanup = () => {
      unmounted = true;
    };

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>認証後のページにリダイレクトします。少々お待ち下さい。</div>;
};

export default CallbackPage;
