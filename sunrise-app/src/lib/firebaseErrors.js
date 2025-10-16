export function parseFirebaseError(error) {
  const code = error.code;

  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "This email is already in use.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many login attempts. Try again later.";
    default:
      return "An error occurred. Please try again.";
  }
}
