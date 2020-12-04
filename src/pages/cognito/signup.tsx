import React from 'react';
import { Auth } from 'aws-amplify';

const SignupPage: React.FC = () => {
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [errorCode, setErrorCode] = React.useState<string>();
  const [errorMessage, setErrorMessage] = React.useState<string>();
  const [sendSignUp, setSendSignUp] = React.useState<boolean>(false);
  const [resendSignUp, setResendSignUp] = React.useState<boolean>(false);

  const changedEmailHandler = (event: React.ChangeEvent<HTMLInputElement>) =>
    setEmail(event.target.value.trim());
  const changedPasswordHandler = (event: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(event.target.value.trim());

  const handleSignUpSubmit = async () => {
    setSendSignUp(false);

    try {
      if (!email || !password) {
        return;
      }

      await Auth.signUp({
        username: email,
        password,
        // clientMetadataがCognitoのカスタムLambdaでどのように送信されるかテスト、'0' or '1' が格納される
        clientMetadata: {
          subscribeNews: String(Math.floor(Math.random() * 2)),
        },
      });

      setSendSignUp(true);
      setErrorMessage('');
    } catch (e) {
      setErrorCode(e.code);
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
      setResendSignUp(true);
    } catch (e) {
      setErrorCode(e.code);
      setErrorMessage(e.message);
    }
  };

  const inputStyle = {
    width: 300,
    height: 25,
  };

  const errorStyle = {
    color: 'red',
  };

  return (
    <>
      <h1>CognitoでSignUp</h1>
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
        <button type="button" onClick={handleSignUpSubmit}>
          登録する
        </button>
        {errorCode === 'UsernameExistsException' ? (
          <button type="button" onClick={handleResendSignUp}>
            認証メールを再送する
          </button>
        ) : (
          ''
        )}
      </form>
      {sendSignUp || resendSignUp ? (
        <div>{email} に認証メールを送信しました。メールをご確認下さい。</div>
      ) : (
        ''
      )}
      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : ''}
    </>
  );
};

export default SignupPage;
