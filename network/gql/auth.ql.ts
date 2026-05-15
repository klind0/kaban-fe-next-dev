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