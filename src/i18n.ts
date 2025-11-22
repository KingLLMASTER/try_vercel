import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "login": "Login",
      "register": "Register",
      "email": "Email",
      "password": "Password",
      "forgot_password": "Forgot password?",
      "submit": "Submit",
      "loading": "Loading...",
      "welcome_back": "Welcome back",
      "create_account": "Create an account",
      "enter_credentials": "Enter your credentials to access your account",
      "enter_details": "Enter your details to create your account",
      "password_reset": "Password Reset",
      "enter_email_reset": "Enter your email to receive a password reset link.",
      "send_link": "Send Link",
      "back_to_login": "Back to Login",
      "email_sent": "Email sent! Check your inbox.",
      "error_generic": "An error occurred.",
      "passwords_match_error": "Passwords do not match",
      "confirm_password": "Confirm Password",
      "verify_email": "Verify Email",
      "enter_code": "Enter the code sent to your email",
      "verify": "Verify",
      "code_sent": "Verification code sent!"
    }
  },
  fr: {
    translation: {
      "login": "Connexion",
      "register": "Inscription",
      "email": "Email",
      "password": "Mot de passe",
      "forgot_password": "Mot de passe oublié ?",
      "submit": "Valider",
      "loading": "Chargement...",
      "welcome_back": "Bon retour",
      "create_account": "Créer un compte",
      "enter_credentials": "Entrez vos identifiants pour accéder à votre compte",
      "enter_details": "Entrez vos détails pour créer votre compte",
      "password_reset": "Réinitialisation du mot de passe",
      "enter_email_reset": "Entrez votre email pour recevoir un lien de réinitialisation.",
      "send_link": "Envoyer le lien",
      "back_to_login": "Retour à la connexion",
      "email_sent": "Email envoyé ! Vérifiez votre boîte de réception.",
      "error_generic": "Une erreur est survenue.",
      "passwords_match_error": "Les mots de passe ne correspondent pas",
      "confirm_password": "Confirmer le mot de passe",
      "verify_email": "Vérifier l'email",
      "enter_code": "Entrez le code envoyé à votre email",
      "verify": "Vérifier",
      "code_sent": "Code de vérification envoyé !"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "fr", // Default language
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
