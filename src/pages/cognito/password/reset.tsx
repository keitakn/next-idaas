import { Auth } from 'aws-amplify';
import React, { useReducer } from 'react';
import { createAction } from '@reduxjs/toolkit';

type State = {
  email: string;
  errorMessage: string;
  sendVerificationCode: boolean;
};

const defaultState = {
  email: '',
  errorMessage: '',
  sendVerificationCode: false,
};

const actions = {
  postPasswordResetStart: createAction(
    'Cognito/postPasswordResetStart',
    (email: string) => ({
      payload: { email },
    }),
  ),
  postPasswordResetSuccess: createAction(
    'Cognito/postPasswordResetSuccess',
    (email: string) => ({
      payload: { email },
    }),
  ),
  postPasswordResetError: createAction(
    'Cognito/postPasswordResetError',
    (err: { message: string }, email: string) => ({
      payload: { email, err },
    }),
  ),
};

const reducer = (
  state: State,
  action:
    | ReturnType<typeof actions.postPasswordResetStart>
    | ReturnType<typeof actions.postPasswordResetError>,
) => {
  switch (action.type) {
    case 'Cognito/postPasswordResetStart':
      return { ...state, email: action.payload.email };
    case 'Cognito/postPasswordResetSuccess':
      return {
        ...state,
        email: action.payload.email,
        sendVerificationCode: true,
      };
    case 'Cognito/postPasswordResetError':
      return {
        ...state,
        email: action.payload.email,
        errorMessage: action.payload.err.message,
      };
    default:
      return state;
  }
};

const PasswordResetForm = () => {
  const [email, setEmail] = React.useState<string>('');
  const [state, dispatch] = useReducer(reducer, defaultState);

  const changedEmailHandler = (event: React.ChangeEvent<HTMLInputElement>) =>
    setEmail(event.target.value.trim());

  const handlePasswordResetSubmit = async () => {
    if (!email) {
      return;
    }

    dispatch({
      type: 'Cognito/postPasswordResetStart',
      payload: { email },
    });

    try {
      await Auth.forgotPassword(email);

      dispatch({
        type: 'Cognito/postPasswordResetSuccess',
        payload: { email },
      });
    } catch (e) {
      dispatch({
        type: 'Cognito/postPasswordResetError',
        payload: { err: e, email },
      });
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
      {state.sendVerificationCode ? (
        <div>
          {state.email}{' '}
          にパスワードリセット用の認証メールを送信しました。メールをご確認下さい。
        </div>
      ) : (
        ''
      )}
      {state.errorMessage ? (
        <div style={errorStyle}>{state.errorMessage}</div>
      ) : (
        ''
      )}
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
