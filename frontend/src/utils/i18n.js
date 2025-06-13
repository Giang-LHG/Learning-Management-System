// src/utils/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          login: "Login",
          email: "Email",
          password: "Password",
          // ... other translations
        }
      },
      vi: {
        translation: {
          login: "Đăng nhập",
          email: "Email",
          password: "Mật khẩu",
          // ... other translations
        }
      }
    },
    lng: "vi",
    fallbackLng: "vi",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;