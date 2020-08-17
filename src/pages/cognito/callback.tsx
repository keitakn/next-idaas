import React from 'react';
import { GetServerSideProps } from 'next';

export const CallbackPage: React.FC = (): JSX.Element => {
  return <div>Cognito Callback URL</div>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  context.res.writeHead(302, { Location: '/cognito/authorized' });
  context.res.end();

  return { props: {} };
};

export default CallbackPage;
