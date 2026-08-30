export const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

export const SIGNUP_MUTATION = `
  mutation SignUp($input: SignupDto!) {
    signup(input: $input)
  }
`;

export const LOGIN_WITH_GOOGLE_MUTATION = `
  mutation LoginWithGoogle($idToken: String!) {
    loginWithGoogle(idToken: $idToken)
  }
`;

export const FORGOT_PASSWORD_MUTATION = `
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

export const RESET_PASSWORD_MUTATION = `
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;