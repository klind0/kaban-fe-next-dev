export const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
      user {
        id
        full_name
        email
      }
    }
  }
`;

export const SIGNUP_MUTATION = `
  mutation SignUp($input: JSONObject!) {
    signup(input: $input) {
      accessToken
      user {
        id
        full_name
        email
        role
      }
      realtor {
        id
      }
    }
  }
`;

export const LOGIN_WITH_GOOGLE_MUTATION = `
  mutation LoginWithGoogle($idToken: String!) {
    loginWithGoogle(idToken: $idToken) {
      accessToken
      user {
        id
        full_name
      }
    }
  }
`;