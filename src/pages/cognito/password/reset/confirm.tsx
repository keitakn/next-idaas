import React from 'react';
import { GetServerSideProps } from 'next';
import { Auth } from 'aws-amplify';
import Link from 'next/link';

type Props = {
  user?: {
    sub: string;
  };
  code?: string;
  error?: Error;
};

const ConfirmPage: React.FC<Props> = ({ user, code, error }: Props) => {
  const [newPassword, setNewPassword] = React.useState<string>('');
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const [passwordResetCompleted, setPasswordResetCompleted] = React.useState<
    boolean
  >(false);

  const changedNewPasswordHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => setNewPassword(event.target.value.trim());

  const handleNewPasswordSubmit = async () => {
    if (!user || !code) {
      return;
    }

    try {
      await Auth.forgotPasswordSubmit(user.sub, code, newPassword);

      setPasswordResetCompleted(true);
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
      <h1>Cognito パスワードリセットを完了させる</h1>
      <form method="post">
        <input
          style={inputStyle}
          type="password"
          placeholder="新しいパスワード"
          onChange={changedNewPasswordHandler}
        />
        <button type="button" onClick={handleNewPasswordSubmit}>
          パスワードリセットを完了させる
        </button>
      </form>
      {error ? <div style={errorStyle}>{error.message}</div> : ''}
      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : ''}
      {error || errorMessage ? (
        <Link href="/cognito/password/reset">
          パスワードリセットを最初からやり直す
        </Link>
      ) : (
        ''
      )}
      {passwordResetCompleted ? (
        <div>
          新しいパスワードに変更しました。{' '}
          <Link href="/cognito/signin">Cognitoでサインイン</Link>{' '}
          からサインインを行って下さい。
        </div>
      ) : (
        ''
      )}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { sub, code } = context.query;

    if (sub === undefined || code === undefined) {
      return {
        props: {},
      };
    }

    return {
      props: {
        code: String(code),
        user: { sub: String(sub) },
      },
    };
  } catch (e) {
    return { props: { error: e } };
  }
};

export default ConfirmPage;
