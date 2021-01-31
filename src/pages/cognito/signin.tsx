import { Auth } from 'aws-amplify';
import React from 'react';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import { useRouter } from 'next/router';
import Link from 'next/link';

export const SignInPage: React.FC = (): JSX.Element => {
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [errorCode, setErrorCode] = React.useState<string>();
  const [errorMessage, setErrorMessage] = React.useState<string>();
  const [resendSignUp, setResendSignUp] = React.useState<boolean>(false);

  const router = useRouter();

  const changedEmailHandler = (event: React.ChangeEvent<HTMLInputElement>) =>
    setEmail(event.target.value.trim());
  const changedPasswordHandler = (event: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(event.target.value.trim());

  const handleSignIpSubmit = async () => {
    if (!email || !password) {
      return;
    }

    setResendSignUp(false);

    try {
      await Auth.signIn(email, password);

      setErrorCode('');
      setErrorMessage('');

      await router.replace('/cognito/authorized');
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      setErrorCode(e.code);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      setErrorMessage(e.message);
    }
  };

  const handleResendSignUp = async () => {
    setResendSignUp(false);

    try {
      if (!email) {
        return;
      }

      await Auth.resendSignUp(email);
      setErrorMessage('');
      setErrorCode('');
      setResendSignUp(true);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      setErrorCode(e.code);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      setErrorMessage(e.message);
    }
  };

  const handleLineLoginClick = async () => {
    await Auth.federatedSignIn({
      customProvider: 'LINE',
    });
  };

  const handleFacebookLoginClick = async () => {
    await Auth.federatedSignIn({
      provider: CognitoHostedUIIdentityProvider.Facebook,
    });
  };

  const inputStyle = {
    width: 250,
    height: 25,
  };

  const errorStyle = {
    color: 'red',
  };

  return (
    <>
      <h1>CognitoでSignIn</h1>
      <form method="post">
        <input
          style={inputStyle}
          type="text"
          placeholder="email"
          onChange={changedEmailHandler}
        />
        <input
          style={inputStyle}
          type="password"
          placeholder="password"
          onChange={changedPasswordHandler}
        />
        <button type="button" onClick={handleSignIpSubmit}>
          サインイン
        </button>
        {errorCode === 'UserNotConfirmedException' ? (
          <button type="button" onClick={handleResendSignUp}>
            認証メールを再送する
          </button>
        ) : (
          ''
        )}
      </form>
      {resendSignUp ? (
        <div>{email} に認証メールを送信しました。メールをご確認下さい。</div>
      ) : (
        ''
      )}
      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : ''}
      <button type="button" onClick={handleLineLoginClick}>
        LINEでログイン
      </button>
      <button type="button" onClick={handleFacebookLoginClick}>
        Facebookでログイン
      </button>
      <Link href="/cognito/password/reset">パスワードを忘れた方はこちら</Link>
    </>
  );
};

export default SignInPage;
