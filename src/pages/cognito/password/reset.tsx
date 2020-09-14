import { Auth } from 'aws-amplify';
import React from 'react';

const PasswordResetForm = () => {
  const [email, setEmail] = React.useState<string>('');
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const [sendVerificationCode, setSendVerificationCode] = React.useState<
    boolean
  >(false);
  const [sentEmail, setSentEmail] = React.useState<string>('');

  const changedEmailHandler = (event: React.ChangeEvent<HTMLInputElement>) =>
    setEmail(event.target.value.trim());

  const handlePasswordResetSubmit = async () => {
    if (!email) {
      return;
    }

    setSendVerificationCode(false);

    try {
      await Auth.forgotPassword(email);

      setSendVerificationCode(true);
      setSentEmail(email);
    } catch (e) {
      setErrorMessage(e.message);
    }
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
      <h1>Cognito パスワードリセット</h1>
      <form method="post">
        <input
          style={inputStyle}
          type="text"
          placeholder="email"
          onChange={changedEmailHandler}
        />
        <button type="button" onClick={handlePasswordResetSubmit}>
          パスワードリセット用のメールを送信する
        </button>
      </form>
      {sendVerificationCode ? (
        <div>
          {sentEmail}{' '}
          にパスワードリセット用の認証メールを送信しました。メールをご確認下さい。
        </div>
      ) : (
        ''
      )}
      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : ''}
    </>
  );
};

export const ResetPage: React.FC = (): JSX.Element => {
  return (
    <>
      <PasswordResetForm />
    </>
  );
};

export default ResetPage;
