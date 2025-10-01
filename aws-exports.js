// aws-exports.js
export default {
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_0BDYAb7NO",       // your pool ID
      userPoolClientId: "3jam1bhk1s2j1nfa3018n7ogdn", // your client ID
      loginWith: { email: true, username: false },
      signUpVerificationMethod: "code", // Cognito sends a code by email
    },
  },
};
