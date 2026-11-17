import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

export const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/gmail.send',
];

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({ prompt: 'select_account' });

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export type GoogleSignInResult =
  | { success: true; user: User; accessToken: string }
  | { success: false; cancelled?: boolean; message: string };

function mapGoogleAuthError(error: unknown): { cancelled?: boolean; message: string } {
  const errObj = error as { code?: string; message?: string } | null;
  const code = errObj?.code || '';

  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return {
      cancelled: true,
      message: 'تم إغلاق نافذة تسجيل الدخول عبر Google قبل إتمام العملية. يمكنك المحاولة مجدداً أو إدخال بريد Gmail مباشرة في الخانة أعلاه.',
    };
  }
  if (code === 'auth/popup-blocked') {
    return {
      message: 'قام المتصفح بحظر النافذة المنبثقة لتسجيل الدخول. يرجى السماح بالنوافذ المنبثقة أو استخدام خانة إدخال Gmail المباشر أعلاه.',
    };
  }
  if (code === 'auth/unauthorized-domain' || code === 'auth/operation-not-allowed') {
    return {
      message: 'تسجيل الدخول عبر نافذة Google غير مفعّل لهذا النطاق. يرجى استخدام تسجيل الدخول المباشر عبر إدخال بريد Gmail أعلاه.',
    };
  }
  if (code === 'auth/network-request-failed') {
    return {
      message: 'تعذر الاتصال بخدمة Google بسبب ضعف الإنترنت. يرجى المحاولة مجدداً أو استخدام الدخول المباشر.',
    };
  }
  return {
    message: 'تعذر إتمام تسجيل الدخول عبر نافذة Google. يمكنك استخدام خانة إدخال بريد Gmail المباشر أعلاه مجاناً.',
  };
}

export const googleSignIn = async (): Promise<GoogleSignInResult> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      return {
        success: false,
        message: 'تعذر الحصول على رمز الوصول من Google. يرجى استخدام الدخول المباشر.',
      };
    }
    cachedAccessToken = credential.accessToken;
    return { success: true, user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    const mapped = mapGoogleAuthError(error);
    return { success: false, ...mapped };
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleLogout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};
