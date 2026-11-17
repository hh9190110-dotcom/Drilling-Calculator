import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  Shield,
  Key,
  Lock,
  Power,
  AlertTriangle,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  LogOut,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Wrench,
  Megaphone,
  Calendar,
  Clock,
  Crown,
  Sparkles,
  Phone,
  Check,
  Smartphone,
  Mail,
  Link2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { secureGetLocal, secureSetLocal, secureRemoveLocal, verifySignedResponse } from '../services/crypto';
import { googleSignIn, googleLogout, getAccessToken, initAuth } from '../services/googleAuth';

export type SubscriptionPlan = 'TRIAL' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'LIFETIME' | 'CUSTOM';

export interface License {
  key: string;
  name: string;
  email?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  plan?: SubscriptionPlan;
  expiresAt?: string | null;
  phone?: string;
  allowMultipleDevices?: boolean;
  createdAt: string;
  lastVerified: string;
  activeDeviceId?: string;
  deviceInfo?: string;
  deviceBoundAt?: string;
  blockedAttempts?: number;
  lastBlockedDevice?: string;
  lastBlockedAt?: string;
}

interface AppVersion {
  version: string;
  releaseDate: string;
  features: string[];
  downloadUrl: string;
  isActive: boolean;
}

interface LicenseContextValue {
  licenseKey: string;
  licenseName: string;
  plan: SubscriptionPlan;
  expiresAt: string | null;
  isAppFree: boolean;
  openAdminPanel: () => void;
  logoutLicense: () => void;
}

const LicenseContext = createContext<LicenseContextValue>({
  licenseKey: '',
  licenseName: '',
  plan: 'LIFETIME',
  expiresAt: null,
  isAppFree: false,
  openAdminPanel: () => {},
  logoutLicense: () => {},
});

export const useLicense = () => useContext(LicenseContext);

export const PLAN_LABELS: Record<string, { ar: string; badge: string; days: string }> = {
  TRIAL: { ar: 'تجريبي (7 أيام)', badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30', days: '7 أيام' },
  MONTHLY: { ar: 'شهري (30 يوم)', badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30', days: '30 يوم' },
  QUARTERLY: { ar: 'ربع سنوي (90 يوم)', badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', days: '90 يوم' },
  YEARLY: { ar: 'سنوي (365 يوم)', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', days: '365 يوم' },
  LIFETIME: { ar: 'مدى الحياة (مفتوح)', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', days: 'غير محدود' },
  CUSTOM: { ar: 'مدة مخصصة', badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', days: 'مخصص' },
};

export function getRemainingDaysInfo(expiresAt?: string | null): {
  isExpired: boolean;
  isLifetime: boolean;
  daysLeft: number;
  label: string;
  colorClass: string;
} {
  if (!expiresAt) {
    return {
      isExpired: false,
      isLifetime: true,
      daysLeft: 9999,
      label: 'مدى الحياة ∞',
      colorClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    };
  }
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffMs <= 0) {
    return {
      isExpired: true,
      isLifetime: false,
      daysLeft: 0,
      label: 'منتهي الصلاحية',
      colorClass: 'bg-red-500/15 text-red-400 border-red-500/30',
    };
  }
  if (daysLeft <= 5) {
    return {
      isExpired: false,
      isLifetime: false,
      daysLeft,
      label: `متبقي ${daysLeft} يوم`,
      colorClass: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    };
  }
  return {
    isExpired: false,
    isLifetime: false,
    daysLeft,
    label: `متبقي ${daysLeft} يوم`,
    colorClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  };
}

interface LicenseGuardProps {
  children: React.ReactNode;
}

export const LicenseGuard: React.FC<LicenseGuardProps> = ({ children }) => {
  const CURRENT_APP_VERSION = '1.0.0';

  const [licenseKey, setLicenseKey] = useState<string>('');
  const [licenseEmail, setLicenseEmail] = useState<string>('');
  const [status, setStatus] = useState<
    | 'LOADING'
    | 'ACTIVE'
    | 'REQUIRED'
    | 'PENDING_APPROVAL'
    | 'SUSPENDED'
    | 'EXPIRED'
    | 'MAINTENANCE'
    | 'GLOBAL_SUSPENDED'
    | 'DEVICE_LOCKED'
    | 'UPDATE_REQUIRED'
  >('LOADING');
  const [licenseName, setLicenseName] = useState<string>('');
  const [licensePlan, setLicensePlan] = useState<SubscriptionPlan>('LIFETIME');
  const [licenseExpiresAt, setLicenseExpiresAt] = useState<string | null>(null);
  const [globalMessage, setGlobalMessage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [inputKey, setInputKey] = useState<string>('');
  const [inputDirectGmail, setInputDirectGmail] = useState<string>('');
  const [inputDirectName, setInputDirectName] = useState<string>('');
  const [gmailAuthBusy, setGmailAuthBusy] = useState<boolean>(false);

  // Public App States
  const [isAppFree, setIsAppFree] = useState<boolean>(false);
  const [latestVersion, setLatestVersion] = useState<string>('');
  const [updateUrl, setUpdateUrl] = useState<string>('');
  const [maintenanceEta, setMaintenanceEta] = useState<string>('');
  const [announcementActive, setAnnouncementActive] = useState<boolean>(false);
  const [announcementText, setAnnouncementText] = useState<string>('');
  const [dismissedAnnouncement, setDismissedAnnouncement] = useState<boolean>(false);
  const [contactInfo, setContactInfo] = useState<string>('');

  // Admin State
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [adminBypassApp, setAdminBypassApp] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<'SUBSCRIBERS' | 'MAINTENANCE' | 'VERSIONS'>('SUBSCRIBERS');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showAdminPassword, setShowAdminPassword] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string>('');
  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [adminRecoveryGmail, setAdminRecoveryGmail] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);
  const [confirmDeleteVer, setConfirmDeleteVer] = useState<string | null>(null);

  // Admin Gmail Recovery States
  const [recoveryMode, setRecoveryMode] = useState<'LOGIN' | 'GOOGLE_AUTH' | 'CONFIRM_SEND' | 'OTP_RESET'>('LOGIN');
  const [recoveryVerifiedEmail, setRecoveryVerifiedEmail] = useState<string>('');
  const [recoveryOtp, setRecoveryOtp] = useState<string>('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState<string>('');
  const [recoveryBusy, setRecoveryBusy] = useState<boolean>(false);
  const [recoveryError, setRecoveryError] = useState<string>('');

  // Admin Panel Data
  const [globalKillSwitch, setGlobalKillSwitch] = useState<boolean>(false);
  const [adminGlobalMessage, setAdminGlobalMessage] = useState<string>('');
  const [adminMaintenanceMode, setAdminMaintenanceMode] = useState<boolean>(false);
  const [adminMaintenanceMessage, setAdminMaintenanceMessage] = useState<string>('');
  const [adminMaintenanceEta, setAdminMaintenanceEta] = useState<string>('');
  const [adminAnnouncementActive, setAdminAnnouncementActive] = useState<boolean>(false);
  const [adminAnnouncementText, setAdminAnnouncementText] = useState<string>('');
  const [adminContactInfo, setAdminContactInfo] = useState<string>('');

  const [licensesList, setLicensesList] = useState<License[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserPhone, setNewUserPhone] = useState<string>('');
  const [newCustomKey, setNewCustomKey] = useState<string>('');
  const [newPlan, setNewPlan] = useState<SubscriptionPlan>('MONTHLY');
  const [newCustomDays, setNewCustomDays] = useState<string>('30');
  const [newAllowMultiDevice, setNewAllowMultiDevice] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Admin Config Panel States
  const [adminIsAppFree, setAdminIsAppFree] = useState<boolean>(false);
  const [adminLatestRequiredVersion, setAdminLatestRequiredVersion] = useState<string>('1.0.0');
  const [adminUpdateUrl, setAdminUpdateUrl] = useState<string>('');

  // App Versions States
  const [appVersionsList, setAppVersionsList] = useState<AppVersion[]>([]);
  const [newVersionNum, setNewVersionNum] = useState<string>('');
  const [newVersionFeatures, setNewVersionFeatures] = useState<string>('');
  const [newVersionDate, setNewVersionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newVersionUrl, setNewVersionUrl] = useState<string>('/APK_DOWNLOAD/app-debug.apk');

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  const getDeviceId = () => {
    let devId = secureGetLocal('total_cement_device_id');
    // Fallback to long-lived cookie if localStorage was cleared
    if (!devId && typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|;\s*)tc_dev_id=([^;]*)/);
      if (match && match[1]) {
        devId = decodeURIComponent(match[1]);
        secureSetLocal('total_cement_device_id', devId);
      }
    }
    if (!devId) {
      const randPart =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID().replace(/-/g, '').toUpperCase().slice(0, 16)
          : Math.random().toString(36).substring(2, 10).toUpperCase() +
            Math.random().toString(36).substring(2, 10).toUpperCase();
      devId = `DEV-${randPart}`;
      secureSetLocal('total_cement_device_id', devId);
    }
    if (typeof document !== 'undefined') {
      document.cookie = `tc_dev_id=${encodeURIComponent(devId)}; max-age=315360000; path=/; SameSite=Lax`;
    }
    return devId;
  };

  const getDeviceInfo = () => {
    if (typeof navigator === 'undefined') return 'Unknown Device';
    const ua = navigator.userAgent || '';
    let os = 'جهاز غير معروف';
    if (/android/i.test(ua)) {
      const match = ua.match(/Android\s([0-9.]+);\s([^;)]+)/i);
      os = match ? `Android ${match[1]} (${match[2].trim()})` : 'هاتف Android';
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      os = /iPad/i.test(ua) ? 'جهاز iPad (iOS)' : 'هاتف iPhone (iOS)';
    } else if (/Windows/i.test(ua)) {
      os = 'كمبيوتر Windows';
    } else if (/Macintosh|Mac OS/i.test(ua)) {
      os = 'جهاز Mac';
    }
    const screenRes = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '';
    return screenRes ? `${os} [${screenRes}]` : os;
  };

  const isVersionOlder = (current: string, required: string) => {
    if (!required || current === required) return false;
    const curParts = current.split('.').map(Number);
    const reqParts = required.split('.').map(Number);
    for (let i = 0; i < Math.max(curParts.length, reqParts.length); i++) {
      const curVal = curParts[i] || 0;
      const reqVal = reqParts[i] || 0;
      if (curVal < reqVal) return true;
      if (curVal > reqVal) return false;
    }
    return false;
  };

  useEffect(() => {
    const unsubAuth = initAuth();

    const isUrlAdmin =
      window.location.pathname.includes('/admin') ||
      window.location.search.includes('admin') ||
      window.location.hash.includes('admin');

    if (isUrlAdmin) {
      setIsAdminMode(true);
      setStatus('ACTIVE');
      return () => {
        unsubAuth();
      };
    } else {
      checkCurrentLicense();

      const interval = setInterval(() => {
        checkCurrentLicense();
      }, 6000);

      const handleFocus = () => {
        checkCurrentLicense();
      };
      window.addEventListener('focus', handleFocus);

      return () => {
        unsubAuth();
        clearInterval(interval);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, []);

  const applyCommonMeta = (data: any) => {
    if (data.maintenanceEta !== undefined) setMaintenanceEta(data.maintenanceEta || '');
    if (data.announcementActive !== undefined) setAnnouncementActive(!!data.announcementActive);
    if (data.announcementText !== undefined) setAnnouncementText(data.announcementText || '');
    if (data.contactInfo !== undefined) setContactInfo(data.contactInfo || '');
    if (data.isAppFree !== undefined) setIsAppFree(!!data.isAppFree);
  };

  const checkCurrentLicense = async () => {
    const savedKey = secureGetLocal('active_license_key') || '';
    const savedEmail = secureGetLocal('active_license_email') || '';
    const devId = getDeviceId();
    const devInfo = getDeviceInfo();

    try {
      const res = await fetch('/api/license/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: savedKey, email: savedEmail, deviceId: devId, deviceInfo: devInfo }),
      });

      if (!res.ok) return;
      const data = await res.json();
      if (!data || typeof data !== 'object') return;

      if (data._sig && !verifySignedResponse(data)) {
        setStatus('GLOBAL_SUSPENDED');
        setGlobalMessage('تنبيّه أمني: تم كشف تلاعب بالشبكة أو محاولة التفاف على نظام الترخيص! تم حظر الوصول لحماية التطبيق.');
        return;
      }

      applyCommonMeta(data);

      // If admin explicitly chose to bypass into the app while authenticated, keep ACTIVE
      if (adminBypassApp && isAdminAuthenticated) {
        setStatus('ACTIVE');
        return;
      }

      if (data.latestRequiredVersion && isVersionOlder(CURRENT_APP_VERSION, data.latestRequiredVersion)) {
        setStatus('UPDATE_REQUIRED');
        setLatestVersion(data.latestRequiredVersion);
        setUpdateUrl(data.updateUrl || '');
        return;
      }

      if (data.globalKillSwitch || data.status === 'GLOBAL_SUSPENDED') {
        setStatus('GLOBAL_SUSPENDED');
        setGlobalMessage(data.globalMessage || data.message || 'النسخة متوقفة حالياً بقرار من الإدارة.');
      } else if (data.status === 'MAINTENANCE' || data.maintenanceMode) {
        setStatus('MAINTENANCE');
        setGlobalMessage(data.maintenanceMessage || data.message || 'التطبيق يخضع حالياً لأعمال صيانة وتحديثات دورية.');
      } else if (data.success && (data.status === 'ACTIVE' || data.isAppFree)) {
        setStatus('ACTIVE');
        setIsAppFree(!!data.isAppFree);
        setLicenseName(data.name || (data.isAppFree ? 'نسخة مجانية مفعّلة' : 'ترخيص مفعّل'));
        setLicensePlan(data.plan || 'LIFETIME');
        setLicenseExpiresAt(data.expiresAt || null);
        if (data.key || savedKey) {
          const finalKey = data.key || savedKey;
          setLicenseKey(finalKey);
          secureSetLocal('active_license_key', finalKey);
        }
        if (data.email || savedEmail) {
          const finalEmail = data.email || savedEmail;
          setLicenseEmail(finalEmail);
          secureSetLocal('active_license_email', finalEmail);
        }
      } else if (data.status === 'PENDING_APPROVAL') {
        setStatus('PENDING_APPROVAL');
        setLicenseName(data.name || '');
        setLicenseEmail(data.email || savedEmail);
        if (data.key) {
          setLicenseKey(data.key);
          secureSetLocal('active_license_key', data.key);
        }
        setGlobalMessage(
          data.message ||
            'تم إرسال طلبك بنجاح! حساب Gmail الخاص بك بانتظار منح تصريح الدخول من قِبل المسؤول (Engineer Faraj Meftah).'
        );
      } else if (data.status === 'EXPIRED') {
        setStatus('EXPIRED');
        setLicenseName(data.name || '');
        setLicenseEmail(data.email || savedEmail);
        setLicensePlan(data.plan || 'MONTHLY');
        setLicenseExpiresAt(data.expiresAt || null);
        setGlobalMessage(data.message || 'انتهت فترة صلاحية اشتراكك.');
      } else if (data.status === 'DEVICE_LOCKED') {
        setStatus('DEVICE_LOCKED');
        setLicenseName(data.name || '');
        setLicenseEmail(data.email || savedEmail);
        setGlobalMessage(data.message || 'هذا الاشتراك مفعّل ومغلق على جهاز آخر!');
      } else if (data.status === 'SUSPENDED') {
        setStatus('SUSPENDED');
        setLicenseName(data.name || '');
        setLicenseEmail(data.email || savedEmail);
        setGlobalMessage(data.message || 'تم إيقاف هذا الاشتراك مؤقتاً.');
      } else {
        if (data.isAppFree) {
          setStatus('ACTIVE');
          setIsAppFree(true);
          setLicenseName('نسخة مجانية مفعّلة');
        } else {
          secureRemoveLocal('active_license_key');
          secureRemoveLocal('active_license_email');
          setIsAppFree(false);
          setStatus('REQUIRED');
        }
      }
    } catch (err) {
      console.warn('License verification fetch error:', err);
    }
  };

  const handleSubscriberGmailSignIn = async () => {
    setErrorMsg('');
    setGmailAuthBusy(true);
    try {
      const result = await googleSignIn();
      if (!result.success) {
        setErrorMsg(result.message);
        return;
      }

      const devId = getDeviceId();
      const devInfo = getDeviceInfo();

      const res = await fetch('/api/license/register-gmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${result.accessToken}`,
        },
        body: JSON.stringify({
          deviceId: devId,
          deviceInfo: devInfo,
          displayName: result.user.displayName || '',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || 'تعذر التحقق من حساب Gmail');
        return;
      }

      if (data._sig && !verifySignedResponse(data)) {
        setStatus('GLOBAL_SUSPENDED');
        setGlobalMessage('تنبيّه أمني: تم كشف تلاعب بالشبكة!');
        return;
      }

      applyCommonMeta(data);

      const userEmail = (data.email || result.user.email || '').toLowerCase();
      if (userEmail) {
        secureSetLocal('active_license_email', userEmail);
        setLicenseEmail(userEmail);
      }
      if (data.key) {
        secureSetLocal('active_license_key', data.key);
        setLicenseKey(data.key);
      }

      if (data.success && (data.status === 'ACTIVE' || data.isAppFree)) {
        setLicenseName(data.name || result.user.displayName || userEmail);
        setLicensePlan(data.plan || 'MONTHLY');
        setLicenseExpiresAt(data.expiresAt || null);
        setIsAppFree(!!data.isAppFree);
        setStatus('ACTIVE');
      } else if (data.status === 'PENDING_APPROVAL') {
        setLicenseName(data.name || result.user.displayName || userEmail);
        setGlobalMessage(
          data.message ||
            'تم تسجيل حساب Gmail الخاص بك بنجاح! طلبك الآن في لوحة تحكم المسؤول بانتظار منحك تصريح الدخول.'
        );
        setStatus('PENDING_APPROVAL');
      } else if (data.status === 'DEVICE_LOCKED') {
        setLicenseName(data.name || userEmail);
        setGlobalMessage(data.message || 'حساب Gmail هذا مفعّل ومقفل على هاتف آخر!');
        setStatus('DEVICE_LOCKED');
      } else if (data.status === 'EXPIRED') {
        setLicenseName(data.name || userEmail);
        setLicenseExpiresAt(data.expiresAt || null);
        setGlobalMessage(data.message || 'انتهت صلاحية اشتراك حساب Gmail هذا.');
        setStatus('EXPIRED');
      } else if (data.status === 'SUSPENDED') {
        setLicenseName(data.name || userEmail);
        setGlobalMessage(data.message || 'تم إيقاف تصريح الدخول لهذا الحساب مؤقتاً.');
        setStatus('SUSPENDED');
      } else {
        setErrorMsg(data.message || 'تعذر تفعيل الدخول عبر Gmail');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'تم إلغاء نافذة تسجيل الدخول عبر Google أو حدث خطأ.');
    } finally {
      setGmailAuthBusy(false);
    }
  };

  const handleDirectGmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanEmail = inputDirectGmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('يرجى إدخال بريد Gmail صحيح (مثال: name@gmail.com)');
      return;
    }
    setGmailAuthBusy(true);
    try {
      const devId = getDeviceId();
      const devInfo = getDeviceInfo();
      const res = await fetch('/api/license/register-gmail-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          displayName: inputDirectName.trim(),
          deviceId: devId,
          deviceInfo: devInfo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || 'تعذر تسجيل حساب Gmail');
        return;
      }

      if (data._sig && !verifySignedResponse(data)) {
        setStatus('GLOBAL_SUSPENDED');
        setGlobalMessage('تنبيّه أمني: تم كشف تلاعب بالشبكة!');
        return;
      }

      applyCommonMeta(data);

      const userEmail = (data.email || cleanEmail).toLowerCase();
      if (userEmail) {
        secureSetLocal('active_license_email', userEmail);
        setLicenseEmail(userEmail);
      }
      if (data.key) {
        secureSetLocal('active_license_key', data.key);
        setLicenseKey(data.key);
      }

      if (data.success && (data.status === 'ACTIVE' || data.isAppFree)) {
        setLicenseName(data.name || inputDirectName.trim() || userEmail);
        setLicensePlan(data.plan || 'MONTHLY');
        setLicenseExpiresAt(data.expiresAt || null);
        setIsAppFree(!!data.isAppFree);
        setStatus('ACTIVE');
      } else if (data.status === 'PENDING_APPROVAL') {
        setLicenseName(data.name || inputDirectName.trim() || userEmail);
        setGlobalMessage(
          data.message ||
            'تم تسجيل حساب Gmail الخاص بك بنجاح! طلبك الآن في لوحة تحكم المسؤول بانتظار منحك تصريح الدخول.'
        );
        setStatus('PENDING_APPROVAL');
      } else if (data.status === 'DEVICE_LOCKED') {
        setLicenseName(data.name || userEmail);
        setGlobalMessage(data.message || 'حساب Gmail هذا مفعّل ومقفل على هاتف آخر!');
        setStatus('DEVICE_LOCKED');
      } else if (data.status === 'EXPIRED') {
        setLicenseName(data.name || userEmail);
        setLicenseExpiresAt(data.expiresAt || null);
        setGlobalMessage(data.message || 'انتهت صلاحية اشتراك حساب Gmail هذا.');
        setStatus('EXPIRED');
      } else if (data.status === 'SUSPENDED') {
        setLicenseName(data.name || userEmail);
        setGlobalMessage(data.message || 'تم إيقاف تصريح الدخول لهذا الحساب مؤقتاً.');
        setStatus('SUSPENDED');
      } else {
        setErrorMsg(data.message || 'تعذر تفعيل الدخول عبر Gmail');
      }
    } catch (err: any) {
      setErrorMsg('حدث خطأ في الاتصال بالخادم، يرجى المحاولة مرة أخرى.');
    } finally {
      setGmailAuthBusy(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStatus('LOADING');
    const devId = getDeviceId();
    const devInfo = getDeviceInfo();

    try {
      const res = await fetch('/api/license/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: inputKey.trim().replace(/\s+/g, '').toUpperCase(),
          deviceId: devId,
          deviceInfo: devInfo,
        }),
      });

      if (!res.ok) {
        setStatus('REQUIRED');
        setErrorMsg('حدث خطأ في الاتصال بالخادم، يرجى المحاولة لاحقاً');
        return;
      }

      const data = await res.json();

      if (data._sig && !verifySignedResponse(data)) {
        setStatus('GLOBAL_SUSPENDED');
        setGlobalMessage('تنبيّه أمني: تم كشف تلاعب بالشبكة أو محاولة التفاف على نظام الترخيص!');
        return;
      }

      applyCommonMeta(data);

      if (data.latestRequiredVersion && isVersionOlder(CURRENT_APP_VERSION, data.latestRequiredVersion)) {
        setStatus('UPDATE_REQUIRED');
        setLatestVersion(data.latestRequiredVersion);
        setUpdateUrl(data.updateUrl || '');
        return;
      }

      if (data.globalKillSwitch) {
        setStatus('GLOBAL_SUSPENDED');
        setGlobalMessage(data.globalMessage || 'النسخة متوقفة حالياً بقرار من الإدارة.');
      } else if (data.status === 'MAINTENANCE' || data.maintenanceMode) {
        setStatus('MAINTENANCE');
        setGlobalMessage(data.maintenanceMessage || data.message || 'التطبيق في وضع الصيانة والتحديث حالياً.');
      } else if (data.success && (data.status === 'ACTIVE' || data.isAppFree)) {
        if (inputKey.trim()) {
          secureSetLocal('active_license_key', inputKey.trim().toUpperCase());
          setLicenseKey(inputKey.trim().toUpperCase());
        }
        setLicenseName(data.name || (data.isAppFree ? 'نسخة مجانية مفعّلة' : 'مشترك مفعّل'));
        setLicensePlan(data.plan || 'LIFETIME');
        setLicenseExpiresAt(data.expiresAt || null);
        setIsAppFree(!!data.isAppFree);
        setStatus('ACTIVE');
      } else if (data.status === 'EXPIRED') {
        setStatus('EXPIRED');
        setLicenseName(data.name || '');
        setLicensePlan(data.plan || 'MONTHLY');
        setLicenseExpiresAt(data.expiresAt || null);
        setGlobalMessage(data.message || 'انتهت صلاحية هذا الاشتراك.');
      } else if (data.status === 'DEVICE_LOCKED') {
        setStatus('DEVICE_LOCKED');
        setLicenseName(data.name || '');
        setGlobalMessage(data.message || 'هذا الاشتراك مفعّل ومغلق على جهاز آخر!');
      } else if (data.status === 'SUSPENDED') {
        setStatus('SUSPENDED');
        setLicenseName(data.name || '');
        setGlobalMessage(data.message || 'تم إيقاف هذا الاشتراك.');
      } else {
        setIsAppFree(!!data.isAppFree);
        if (data.isAppFree) {
          setStatus('ACTIVE');
          setLicenseName('نسخة مجانية مفعّلة');
        } else {
          setStatus('REQUIRED');
          if (!inputKey.trim()) {
            setErrorMsg('يرجى إدخال رمز الاشتراك الشخصي');
          } else {
            setErrorMsg(data.message || 'رمز الاشتراك غير صحيح أو تم إيقافه!');
          }
        }
      }
    } catch {
      setStatus('REQUIRED');
      setErrorMsg('تعذر الاتصال بالخادم، يرجى التأكد من اتصال الإنترنت والمحاولة مجدداً');
    }
  };

  const syncAdminStateFromResponse = (data: any) => {
    setGlobalKillSwitch(!!data.globalKillSwitch);
    setAdminGlobalMessage(data.globalMessage || '');
    setAdminMaintenanceMode(!!data.maintenanceMode);
    setAdminMaintenanceMessage(
      data.maintenanceMessage ||
        'التطبيق يخضع حالياً لأعمال صيانة وتحديثات دورية لتحسين الأداء وإضافة ميزات هندسية جديدة. سيعود للعمل قريباً.'
    );
    setAdminMaintenanceEta(data.maintenanceEta || '');
    setAdminAnnouncementActive(!!data.announcementActive);
    setAdminAnnouncementText(data.announcementText || '');
    setAdminContactInfo(data.contactInfo || '');
    setAdminRecoveryGmail(data.recoveryGmail || '');
    setAdminIsAppFree(!!data.isAppFree);
    setAdminLatestRequiredVersion(data.latestRequiredVersion || '1.0.0');
    setAdminUpdateUrl(data.updateUrl || '');
    setLicensesList(data.licenses || []);
    setAppVersionsList(data.appVersions || []);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    try {
      const trimmedPass = adminPassword.trim();
      const res = await fetch('/api/license/admin/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: trimmedPass }),
      });
      const data = await res.json();

      if (data.success) {
        setIsAdminAuthenticated(true);
        syncAdminStateFromResponse(data);
        showToast('تم تسجيل دخول المسؤول بنجاح');
      } else {
        setAdminError(data.message || 'كلمة المرور غير صحيحة!');
      }
    } catch {
      setAdminError('خطأ في الاتصال بالخادم');
    }
  };

  const handleAdminGoogleDirectLogin = async () => {
    setAdminError('');
    setRecoveryBusy(true);
    try {
      const result = await googleSignIn();
      if (!result.success) {
        setAdminError(result.message);
        return;
      }

      const res = await fetch('/api/license/admin/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${result.accessToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        if (data.adminPassword) {
          setAdminPassword(data.adminPassword);
        }
        setIsAdminAuthenticated(true);
        syncAdminStateFromResponse(data);
        showToast(`مرحباً بك م. فرج مفتاح (${data.verifiedEmail})`);
      } else {
        await googleLogout();
        setAdminError(data.message || 'هذا البريد غير مصرح له بالدخول كمسؤول.');
      }
    } catch (err: any) {
      setAdminError(err?.message || 'حدث خطأ أثناء تسجيل الدخول بحساب Gmail.');
    } finally {
      setRecoveryBusy(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput.trim()) return;
    try {
      const res = await fetch('/api/license/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPassword: adminPassword.trim(),
          newPassword: newPasswordInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminPassword(newPasswordInput.trim());
        setNewPasswordInput('');
        setShowChangePasswordModal(false);
        showToast('تم تغيير كلمة مرور المسؤول بنجاح!');
      } else {
        showToast(data.message || 'فشل تغيير كلمة المرور', 'error');
      }
    } catch {
      showToast('خطأ في الاتصال بالخادم لتغيير كلمة المرور', 'error');
    }
  };

  const refreshAdminData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/license/admin/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });
      const data = await res.json();
      if (data.success) {
        syncAdminStateFromResponse(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveGlobalConfig = async (overrides: Partial<{
    globalKillSwitch: boolean;
    globalMessage: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
    maintenanceEta: string;
    announcementActive: boolean;
    announcementText: string;
    contactInfo: string;
    recoveryGmail: string;
    isAppFree: boolean;
    latestRequiredVersion: string;
    updateUrl: string;
  }> = {}) => {
    try {
      const payload = {
        password: adminPassword,
        globalKillSwitch: overrides.globalKillSwitch !== undefined ? overrides.globalKillSwitch : globalKillSwitch,
        globalMessage: overrides.globalMessage !== undefined ? overrides.globalMessage : adminGlobalMessage,
        maintenanceMode: overrides.maintenanceMode !== undefined ? overrides.maintenanceMode : adminMaintenanceMode,
        maintenanceMessage: overrides.maintenanceMessage !== undefined ? overrides.maintenanceMessage : adminMaintenanceMessage,
        maintenanceEta: overrides.maintenanceEta !== undefined ? overrides.maintenanceEta : adminMaintenanceEta,
        announcementActive: overrides.announcementActive !== undefined ? overrides.announcementActive : adminAnnouncementActive,
        announcementText: overrides.announcementText !== undefined ? overrides.announcementText : adminAnnouncementText,
        contactInfo: overrides.contactInfo !== undefined ? overrides.contactInfo : adminContactInfo,
        recoveryGmail: overrides.recoveryGmail !== undefined ? overrides.recoveryGmail : adminRecoveryGmail,
        isAppFree: overrides.isAppFree !== undefined ? overrides.isAppFree : adminIsAppFree,
        latestRequiredVersion:
          overrides.latestRequiredVersion !== undefined ? overrides.latestRequiredVersion : adminLatestRequiredVersion,
        updateUrl: overrides.updateUrl !== undefined ? overrides.updateUrl : adminUpdateUrl,
      };

      const res = await fetch('/api/license/admin/update-global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setGlobalKillSwitch(!!data.globalKillSwitch);
        setAdminGlobalMessage(data.globalMessage || '');
        setAdminMaintenanceMode(!!data.maintenanceMode);
        setAdminMaintenanceMessage(data.maintenanceMessage || '');
        setAdminMaintenanceEta(data.maintenanceEta || '');
        setAdminAnnouncementActive(!!data.announcementActive);
        setAdminAnnouncementText(data.announcementText || '');
        setAdminContactInfo(data.contactInfo || '');
        if (data.recoveryGmail !== undefined) setAdminRecoveryGmail(data.recoveryGmail || '');
        setAdminIsAppFree(!!data.isAppFree);
        setAdminLatestRequiredVersion(data.latestRequiredVersion || '1.0.0');
        setAdminUpdateUrl(data.updateUrl || '');
        showToast('تم حفظ وتطبيق الإعدادات بنجاح');
        checkCurrentLicense();
      } else {
        showToast(data.message || 'فشل حفظ الإعدادات', 'error');
      }
    } catch {
      showToast('خطأ في تعديل الإعدادات العامة', 'error');
    }
  };

  // Gmail Recovery Handlers
  const handleGoogleRecoverySignIn = async () => {
    setRecoveryError('');
    setRecoveryBusy(true);
    try {
      const result = await googleSignIn();
      if (!result.success) {
        setRecoveryError(result.message);
        return;
      }

      const res = await fetch('/api/license/admin/recovery/verify-google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${result.accessToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setRecoveryVerifiedEmail(data.verifiedEmail || result.user.email || '');
        setRecoveryMode('CONFIRM_SEND');
      } else {
        await googleLogout();
        setRecoveryError(data.message || 'حساب Gmail هذا غير مصرح له باسترداد كلمة المرور.');
      }
    } catch (err: any) {
      setRecoveryError(err?.message || 'حدث خطأ أثناء تسجيل الدخول عبر Google.');
    } finally {
      setRecoveryBusy(false);
    }
  };

  const handleConfirmSendOtpEmail = async () => {
    setRecoveryError('');
    setRecoveryBusy(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setRecoveryMode('GOOGLE_AUTH');
        setRecoveryError('انتهت جلسة التحقق، يرجى تسجيل الدخول بحساب Google مجدداً.');
        return;
      }

      const res = await fetch('/api/license/admin/recovery/send-otp-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setRecoveryMode('OTP_RESET');
        showToast('تم إرسال رمز التحقق إلى بريد Gmail الخاص بك');
      } else {
        setRecoveryError(data.message || 'فشل إرسال رسالة رمز التحقق عبر Gmail.');
      }
    } catch {
      setRecoveryError('خطأ في الاتصال بالخادم أثناء إرسال البريد.');
    } finally {
      setRecoveryBusy(false);
    }
  };

  const handleCompletePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoveryBusy(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setRecoveryMode('GOOGLE_AUTH');
        setRecoveryError('انتهت جلسة Google، يرجى إعادة المحاولة.');
        return;
      }

      const res = await fetch('/api/license/admin/recovery/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          otpCode: recoveryOtp.trim(),
          newPassword: recoveryNewPassword.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        await googleLogout();
        setAdminPassword(recoveryNewPassword.trim());
        setRecoveryOtp('');
        setRecoveryNewPassword('');
        setRecoveryVerifiedEmail('');
        setRecoveryMode('LOGIN');
        showToast('تم استرداد وتعيين كلمة مرور المسؤول بنجاح!');
      } else {
        setRecoveryError(data.message || 'تعذر التحقق من الرمز.');
      }
    } catch {
      setRecoveryError('خطأ في الاتصال بالخادم.');
    } finally {
      setRecoveryBusy(false);
    }
  };

  const handleResetDevice = async (key: string) => {
    try {
      const res = await fetch('/api/license/admin/reset-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword, key }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم إلغاء قفل الجهاز بنجاح! يمكن الآن التفعيل على جهاز جديد.');
        refreshAdminData();
      } else {
        showToast(data.message || 'حدث خطأ أثناء إلغاء قفل الجهاز', 'error');
      }
    } catch {
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  const handleToggleMultiDevice = async (key: string, currentVal?: boolean) => {
    try {
      const res = await fetch('/api/license/admin/toggle-multi-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminPassword,
          key,
          allowMultipleDevices: !currentVal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'تم تحديث صلاحية تعدد الأجهزة بنجاح');
        refreshAdminData();
      } else {
        showToast(data.message || 'تعذر تحديث صلاحية الأجهزة', 'error');
      }
    } catch {
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() && !newUserEmail.trim()) return;

    try {
      const res = await fetch('/api/license/admin/add-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminPassword,
          name: newUserName.trim(),
          email: newUserEmail.trim().toLowerCase(),
          phone: newUserPhone.trim(),
          customKey: newCustomKey.trim() || undefined,
          plan: newPlan,
          customDays: newPlan === 'CUSTOM' ? Number(newCustomDays) || 30 : undefined,
          allowMultipleDevices: newAllowMultiDevice,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPhone('');
        setNewCustomKey('');
        setNewAllowMultiDevice(false);
        refreshAdminData();
        showToast(
          data.license.email
            ? `تم منح تصريح الدخول لحساب (${data.license.email}) بنجاح!`
            : `تم إنشاء اشتراك جديد (${data.license.key}) بنجاح!`
        );
      } else {
        showToast(data.message || 'خطأ في إنشاء الاشتراك', 'error');
      }
    } catch {
      showToast('خطأ في خادم الاشتراكات', 'error');
    }
  };

  const handleRenewLicense = async (key: string, plan: SubscriptionPlan, customDays?: number) => {
    try {
      const res = await fetch('/api/license/admin/renew-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminPassword,
          key,
          plan,
          customDays,
        }),
      });
      const data = await res.json();
      if (data.success) {
        refreshAdminData();
        checkCurrentLicense();
        showToast(`تم تجديد وتمديد اشتراك (${key}) بنجاح!`);
      } else {
        showToast(data.message || 'فشل تجديد الاشتراك', 'error');
      }
    } catch {
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  const handleToggleLicenseStatus = async (key: string, currentStatus: 'ACTIVE' | 'SUSPENDED' | 'PENDING') => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch('/api/license/admin/update-key-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminPassword,
          key,
          status: nextStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        refreshAdminData();
        showToast(nextStatus === 'ACTIVE' ? 'تم منح التصريح وتنشيط الحساب' : 'تم تجميد الاشتراك مؤقتاً');
        if (key === licenseKey) {
          checkCurrentLicense();
        }
      }
    } catch {
      showToast('خطأ في تعديل حالة الاشتراك', 'error');
    }
  };

  const handleDeleteLicense = async (key: string) => {
    try {
      const res = await fetch('/api/license/admin/delete-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword, key }),
      });
      const data = await res.json();
      if (data.success) {
        setConfirmDeleteKey(null);
        refreshAdminData();
        showToast('تم حذف الاشتراك نهائياً');
        if (key === licenseKey) {
          secureRemoveLocal('active_license_key');
          setStatus('REQUIRED');
        }
      }
    } catch {
      showToast('خطأ في حذف الاشتراك', 'error');
    }
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    showToast('تم النسخ إلى الحافظة');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copySubscriberCard = (lic: License) => {
    const planLabel = PLAN_LABELS[lic.plan || 'LIFETIME']?.ar || 'مفتوح';
    const expStr = lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString('ar-EG') : 'مدى الحياة (غير محدود)';
    const emailLine = lic.email ? `\n📧 البريد المعتمد (Gmail): ${lic.email}` : '';
    const msg = `مرحباً بك في تطبيق Total Cement Pro 🛢️\n👤 المشترك: ${lic.name}${emailLine}\n🔑 كود التفعيل: ${lic.key}\n📦 الباقة: ${planLabel}\n📅 الصلاحية حتى: ${expStr}`;
    copyToClipboard(msg, `card-${lic.key}`);
  };

  const handleAddAppVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionNum) {
      showToast('يرجى تحديد رقم الإصدار', 'error');
      return;
    }
    try {
      const featuresArr = newVersionFeatures
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const res = await fetch('/api/license/admin/add-version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminPassword,
          version: newVersionNum.trim(),
          releaseDate: newVersionDate,
          features: featuresArr,
          downloadUrl: newVersionUrl.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewVersionNum('');
        setNewVersionFeatures('');
        refreshAdminData();
        showToast('تم إضافة الإصدار الجديد بنجاح!');
      } else {
        showToast(data.message || 'فشلت إضافة الإصدار', 'error');
      }
    } catch {
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  const handleDeleteAppVersion = async (versionStr: string) => {
    try {
      const res = await fetch('/api/license/admin/delete-version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword, version: versionStr }),
      });
      const data = await res.json();
      if (data.success) {
        setConfirmDeleteVer(null);
        refreshAdminData();
        showToast(`تم حذف الإصدار ${versionStr}`);
      } else {
        showToast(data.message || 'فشل حذف الإصدار', 'error');
      }
    } catch {
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  const handleActivateAppVersion = async (versionStr: string) => {
    try {
      const res = await fetch('/api/license/admin/activate-version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword, version: versionStr }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminLatestRequiredVersion(data.version);
        setAdminUpdateUrl(data.updateUrl);
        refreshAdminData();
        showToast(`تم تفعيل الإصدار ${data.version} واعتماده للمستخدمين!`);
      } else {
        showToast(data.message || 'فشل تفعيل الإصدار', 'error');
      }
    } catch {
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  const handleLogoutLicense = async () => {
    secureRemoveLocal('active_license_key');
    secureRemoveLocal('active_license_email');
    try {
      await googleLogout();
    } catch {
      // ignore
    }
    setLicenseKey('');
    setLicenseEmail('');
    setAdminBypassApp(false);
    setStatus('REQUIRED');
  };

  const openAdminPanel = () => {
    setIsAdminMode(true);
    if (isAdminAuthenticated) {
      refreshAdminData();
    }
  };

  const closeAdminPanelAndEnterApp = () => {
    setIsAdminMode(false);
    if (window.location.pathname.includes('/admin') || window.location.search.includes('admin') || window.location.hash.includes('admin')) {
      window.history.replaceState({}, '', '/');
    }
    if (isAdminAuthenticated) {
      setAdminBypassApp(true);
      setStatus('ACTIVE');
    } else {
      checkCurrentLicense();
    }
  };

  // Compute Admin Stats
  const totalSubs = licensesList.length;
  const pendingApprovalList = licensesList.filter((l) => l.status === 'PENDING');
  const activeSubs = licensesList.filter((l) => {
    const exp = getRemainingDaysInfo(l.expiresAt);
    return l.status === 'ACTIVE' && !exp.isExpired;
  }).length;
  const expiredOrSuspendedSubs = totalSubs - activeSubs - pendingApprovalList.length;
  const lockedDevicesCount = licensesList.filter((l) => !!l.activeDeviceId).length;

  const filteredLicenses = licensesList.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.key.toLowerCase().includes(q) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.phone && l.phone.toLowerCase().includes(q))
    );
  });

  // Loading Screen
  if (status === 'LOADING') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center font-tajawal text-white">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
          />
          <h2 className="text-xl font-bold italic tracking-wide text-blue-400">Total Cement</h2>
          <p className="text-slate-400 text-sm">جاري التحقق من حالة الاشتراك وصلاحية النسخة...</p>
        </div>
      </div>
    );
  }

  // Admin Mode Portal Overlay/Screen
  if (isAdminMode) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 font-tajawal p-4 sm:p-6 flex flex-col justify-between overflow-x-hidden">
        {/* Toast Notification */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl border shadow-2xl text-xs font-black flex items-center gap-2 ${
                toastMsg.type === 'success'
                  ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/95 border-rose-500/40 text-rose-300'
              }`}
            >
              {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{toastMsg.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="flex flex-wrap justify-between items-center max-w-5xl mx-auto w-full mb-6 gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={closeAdminPanelAndEnterApp}
              className="px-4 py-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-2xl border border-slate-700/60 flex items-center gap-2 text-xs sm:text-sm font-black text-slate-200 transition-all"
            >
              <ArrowRight className="w-4 h-4 text-blue-400" />
              <span>{isAdminAuthenticated ? 'معاينة ودخول التطبيق' : 'العودة للتطبيق'}</span>
            </button>
            {isAdminAuthenticated && (
              <>
                <button
                  onClick={() => setShowChangePasswordModal(!showChangePasswordModal)}
                  className="px-3.5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 flex items-center gap-1.5 text-xs font-black transition-all"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>كلمة المرور وبريد الاسترداد</span>
                </button>
                <button
                  onClick={refreshAdminData}
                  className="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-2xl border border-slate-700/50 text-slate-300 hover:text-white transition-all"
                  title="تحديث البيانات"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
                </button>
              </>
            )}
          </div>
          <div className="text-right">
            <h1 className="text-lg sm:text-xl font-black text-amber-400 flex items-center gap-2 justify-end">
              <span>لوحة تحكم المسؤول ونظام الاشتراكات</span>
              <Shield className="w-5 h-5" />
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
              ADMIN SUBSCRIPTION & MAINTENANCE CENTER
            </p>
          </div>
        </header>

        {/* Change Password & Recovery Gmail Modal */}
        {isAdminAuthenticated && showChangePasswordModal && (
          <div className="max-w-lg w-full mx-auto mb-6 bg-amber-950/25 border border-amber-500/40 p-6 rounded-3xl shadow-xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-amber-500/20">
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ إغلاق
              </button>
              <h3 className="text-sm font-black text-amber-400 flex items-center gap-1.5">
                إعدادات الأمان، كلمة المرور، وبريد الاسترداد <KeyRound className="w-4 h-4" />
              </h3>
            </div>

            {/* Admin Direct URL */}
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-right">
              <span className="text-[11px] font-black text-slate-300 flex items-center justify-end gap-1.5">
                <span>رابط لوحة التحكم المباشر (احفظه لديك — مخفي عن المستخدمين)</span>
                <Link2 className="w-3.5 h-3.5 text-blue-400" />
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(`${window.location.origin}/?admin`, 'admin-url')}
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-[11px] font-black shrink-0"
                >
                  {copiedKey === 'admin-url' ? 'تم النسخ!' : 'نسخ الرابط'}
                </button>
                <span className="text-[11px] font-mono text-amber-300 truncate block w-full text-left" dir="ltr">
                  {window.location.origin}/?admin
                </span>
              </div>
            </div>

            {/* Update Recovery Gmail */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <label className="block text-xs font-bold text-slate-300 text-right flex items-center justify-end gap-1.5">
                <span>حساب Gmail لاسترداد كلمة المرور عند نسيانها</span>
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveGlobalConfig({ recoveryGmail: adminRecoveryGmail })}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shrink-0 transition-all"
                >
                  حفظ البريد
                </button>
                <input
                  type="email"
                  value={adminRecoveryGmail}
                  onChange={(e) => setAdminRecoveryGmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-left text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Change Password */}
            <form onSubmit={handleChangePassword} className="space-y-3 pt-2 border-t border-slate-800/60">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 text-right">تغيير كلمة مرور المسؤول</label>
                <input
                  type="password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة (4 أحرف على الأقل)..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-center text-white focus:outline-none focus:border-amber-500 font-mono text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-2.5 rounded-xl transition-all text-xs"
              >
                حفظ كلمة المرور الجديدة
              </button>
            </form>
          </div>
        )}

        {/* Auth Mode */}
        {!isAdminAuthenticated ? (
          <main className="max-w-md w-full mx-auto my-auto bg-slate-900/60 backdrop-blur-md border border-slate-800 p-8 rounded-[2rem] shadow-2xl">
            {recoveryMode === 'LOGIN' ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h2 className="text-lg font-black text-white">تسجيل دخول المسؤول (Admin)</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    أدخل كلمة مرور الإدارة للتحكم بالاشتراكات ووضع الصيانة والتحديثات
                  </p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 text-right">كلمة المرور الإدارية</label>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => {
                          setAdminPassword(e.target.value);
                          if (adminError) setAdminError('');
                        }}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-center text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600 font-mono text-sm"
                        placeholder="أدخل كلمة المرور..."
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                      >
                        {showAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {adminError && (
                    <p className="text-red-500 text-xs font-bold text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                      {adminError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-amber-600/20 active:scale-[0.98] text-sm"
                  >
                    فتح لوحة التحكم بكلمة المرور
                  </button>
                </form>

                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3 text-center">
                  <button
                    type="button"
                    disabled={recoveryBusy}
                    onClick={handleAdminGoogleDirectLogin}
                    className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-black py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>
                      {recoveryBusy
                        ? 'جاري التحقق من بريد المسؤول...'
                        : 'الدخول المباشر بحساب المسؤول (hh9190110@gmail.com)'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryError('');
                      setRecoveryMode('GOOGLE_AUTH');
                    }}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>نسيت كلمة المرور؟ استرداد عبر حساب Gmail</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-7 h-7" />
                  </div>
                  <h2 className="text-lg font-black text-white">استرداد كلمة المرور عبر Gmail</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {recoveryMode === 'GOOGLE_AUTH' && 'سجّل الدخول بحساب Gmail المعتمد للمسؤول للتحقق من هويتك'}
                    {recoveryMode === 'CONFIRM_SEND' && 'تم التحقق من حساب Gmail! أكّد إرسال رمز التحقق لبريدك'}
                    {recoveryMode === 'OTP_RESET' && 'أدخل رمز التحقق المرسل إلى بريدك وكلمة المرور الجديدة'}
                  </p>
                </div>

                {recoveryError && (
                  <p className="text-red-400 text-xs font-bold text-center bg-red-500/10 py-2.5 px-3 rounded-xl border border-red-500/20">
                    {recoveryError}
                  </p>
                )}

                {recoveryMode === 'GOOGLE_AUTH' && (
                  <div className="space-y-4">
                    <button
                      type="button"
                      disabled={recoveryBusy}
                      onClick={handleGoogleRecoverySignIn}
                      className="w-full bg-white hover:bg-slate-100 text-slate-800 font-bold py-3 px-4 rounded-xl border border-slate-300 shadow-md flex items-center justify-center gap-3 transition-all disabled:opacity-60"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      </svg>
                      <span className="text-sm">{recoveryBusy ? 'جاري التحقق...' : 'Sign in with Google'}</span>
                    </button>
                  </div>
                )}

                {recoveryMode === 'CONFIRM_SEND' && (
                  <div className="bg-slate-950/70 border border-blue-500/30 p-4 rounded-2xl space-y-4 text-right">
                    <p className="text-xs text-slate-200 leading-relaxed">
                      تم التحقق بنجاح من الحساب:{' '}
                      <strong className="text-blue-400 font-mono" dir="ltr">
                        {recoveryVerifiedEmail}
                      </strong>
                      .
                      <br />
                      سيتم إرسال رسالة بريد إلكتروني عبر <strong>Gmail</strong> تحتوي على رمز استرداد مكون من 6 أرقام إلى هذا العنوان. هل تريد المتابعة؟
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={recoveryBusy}
                        onClick={() => {
                          googleLogout();
                          setRecoveryMode('LOGIN');
                        }}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        disabled={recoveryBusy}
                        onClick={handleConfirmSendOtpEmail}
                        className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-black py-2.5 rounded-xl text-xs disabled:opacity-60"
                      >
                        {recoveryBusy ? 'جاري الإرسال...' : 'نعم، أرسل الرمز إلى Gmail'}
                      </button>
                    </div>
                  </div>
                )}

                {recoveryMode === 'OTP_RESET' && (
                  <form onSubmit={handleCompletePasswordReset} className="space-y-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-center text-xs text-emerald-300 font-bold">
                      تم إرسال رمز التحقق إلى بريدك ({recoveryVerifiedEmail})
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 text-right">
                        رمز التحقق (6 أرقام من بريد Gmail)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={recoveryOtp}
                        onChange={(e) => setRecoveryOtp(e.target.value)}
                        placeholder="XXXXXX"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-white font-mono tracking-[0.4em] text-base focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 text-right">
                        كلمة مرور المسؤول الجديدة
                      </label>
                      <input
                        type="password"
                        value={recoveryNewPassword}
                        onChange={(e) => setRecoveryNewPassword(e.target.value)}
                        placeholder="4 أحرف أو أرقام على الأقل..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={recoveryBusy}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-sm transition-all disabled:opacity-60"
                    >
                      {recoveryBusy ? 'جاري الحفظ...' : 'تأكيد الرمز وتعيين كلمة المرور'}
                    </button>
                  </form>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setRecoveryError('');
                    setRecoveryMode('LOGIN');
                  }}
                  className="w-full text-slate-400 hover:text-white text-xs font-bold pt-2"
                >
                  العودة لتسجيل الدخول بكلمة المرور
                </button>
              </div>
            )}
          </main>
        ) : (
          // Admin Panel Dashboard
          <main className="max-w-5xl w-full mx-auto my-auto space-y-6">
            {/* Top Summary Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl text-right">
                <div className="flex items-center justify-between mb-1">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-[10px] font-black text-slate-400">إجمالي المشتركين</span>
                </div>
                <p className="text-2xl font-black text-white font-mono">{totalSubs}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">أجهزة مرتبطة: {lockedDevicesCount}</p>
              </div>

              <div className="bg-slate-900/70 border border-emerald-500/20 p-4 rounded-2xl text-right">
                <div className="flex items-center justify-between mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-black text-emerald-400">اشتراكات نشطة</span>
                </div>
                <p className="text-2xl font-black text-emerald-400 font-mono">{activeSubs}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">مفعّلة وسارية الصلاحية</p>
              </div>

              <div className="bg-slate-900/70 border border-rose-500/20 p-4 rounded-2xl text-right">
                <div className="flex items-center justify-between mb-1">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span className="text-[10px] font-black text-rose-400">منتهية أو مجمدة</span>
                </div>
                <p className="text-2xl font-black text-rose-400 font-mono">{expiredOrSuspendedSubs}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">تحتاج لتجديد أو تنشيط</p>
              </div>

              <div className="bg-slate-900/70 border border-amber-500/20 p-4 rounded-2xl text-right">
                <div className="flex items-center justify-between mb-1">
                  <Power className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-black text-amber-400">حالة التطبيق الحالية</span>
                </div>
                <p className="text-sm font-black mt-1">
                  {globalKillSwitch ? (
                    <span className="text-red-400">● متوقف بالكامل (طوارئ)</span>
                  ) : adminMaintenanceMode ? (
                    <span className="text-amber-400">● في وضع الصيانة والتحديث</span>
                  ) : adminIsAppFree ? (
                    <span className="text-emerald-400">● مفتوح مجاناً للجميع</span>
                  ) : (
                    <span className="text-blue-400">● يعمل بنظام الاشتراكات</span>
                  )}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">الإصدار المعتمد: V{adminLatestRequiredVersion}</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setAdminTab('VERSIONS')}
                className={`py-3 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                  adminTab === 'VERSIONS'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>التحديثات والإصدارات</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('MAINTENANCE')}
                className={`py-3 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                  adminTab === 'MAINTENANCE'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>وضع الصيانة والتحكم العام</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('SUBSCRIBERS')}
                className={`py-3 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                  adminTab === 'SUBSCRIBERS'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>إدارة المشتركين والباقات ({totalSubs})</span>
              </button>
            </div>

            {/* TAB 1: SUBSCRIBERS & PLANS */}
            {adminTab === 'SUBSCRIBERS' && (
              <div className="space-y-6">
                {/* Pending Gmail Authorization Requests */}
                {pendingApprovalList.length > 0 && (
                  <div className="bg-amber-950/30 border-2 border-amber-500/40 p-6 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                      <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/40 animate-pulse">
                        {pendingApprovalList.length} طلب بانتظار الموافقة
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-2">
                        <span>طلبات تصريح الدخول عبر Gmail (بانتظار موافقتك)</span>
                        <Mail className="w-5 h-5 text-amber-400" />
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {pendingApprovalList.map((req) => (
                        <div
                          key={req.key}
                          className="bg-slate-950/80 border border-amber-500/30 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                        >
                          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end md:justify-start order-2 md:order-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteLicense(req.key)}
                              className="px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-black transition-all flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>رفض الطلب</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRenewLicense(req.key, 'MONTHLY')}
                              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all shadow-md"
                            >
                              ✅ منح تصريح (شهر)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRenewLicense(req.key, 'QUARTERLY')}
                              className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black transition-all shadow-md"
                            >
                              ✅ تصريح (3 أشهر)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRenewLicense(req.key, 'YEARLY')}
                              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md"
                            >
                              ✅ تصريح (سنة)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRenewLicense(req.key, 'LIFETIME')}
                              className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black transition-all shadow-md"
                            >
                              ✅ تصريح (مدى الحياة ∞)
                            </button>
                          </div>

                          <div className="text-right w-full md:w-auto order-1 md:order-2 space-y-1">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black">
                                بانتظار تصريح الدخول
                              </span>
                              <span className="font-black text-white text-sm sm:text-base">{req.name}</span>
                            </div>
                            {req.email && (
                              <p className="text-xs font-mono text-emerald-400 font-bold">{req.email}</p>
                            )}
                            <p className="text-[11px] text-slate-400">
                              📱 الهاتف المسجل: <strong className="text-slate-300">{req.deviceInfo || 'هاتف المشترك'}</strong>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Create New Subscription / Pre-Authorize Gmail Form */}
                <form
                  onSubmit={handleCreateLicense}
                  className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      منح تصريح Gmail أو توليد كود
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                      <span>منح تصريح دخول لحساب Gmail أو إنشاء كود اشتراك</span>
                      <Plus className="w-4 h-4 text-emerald-400" />
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1 text-right">
                        كود مخصص (اختياري)
                      </label>
                      <input
                        type="text"
                        value={newCustomKey}
                        onChange={(e) => setNewCustomKey(e.target.value.toUpperCase())}
                        placeholder="يترك فارغاً للتوليد التلقائي"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-center text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1 text-right">
                        رقم الهاتف / ملاحظة (اختياري)
                      </label>
                      <input
                        type="text"
                        value={newUserPhone}
                        onChange={(e) => setNewUserPhone(e.target.value)}
                        placeholder="مثال: 091XXXXXXX"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-right text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-emerald-400 mb-1 text-right">
                        بريد المشترك (Gmail) لتصريح الدخول
                      </label>
                      <input
                        type="email"
                        dir="ltr"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="engineer@gmail.com"
                        className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-2.5 text-left text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1 text-right">
                        اسم المهندس / المشترك *
                      </label>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="مثال: م. محمد الفيتوري"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-right text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Plan Selection Pills */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 text-right">
                      اختر نوع ومدة باقة الاشتراك:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                      {(
                        [
                          { id: 'TRIAL', label: 'تجريبي (7 أيام)' },
                          { id: 'MONTHLY', label: 'شهري (30 يوم)' },
                          { id: 'QUARTERLY', label: '3 أشهر (90 يوم)' },
                          { id: 'YEARLY', label: 'سنوي (365 يوم)' },
                          { id: 'LIFETIME', label: 'مدى الحياة ∞' },
                          { id: 'CUSTOM', label: 'أيام مخصصة' },
                        ] as { id: SubscriptionPlan; label: string }[]
                      ).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setNewPlan(p.id)}
                          className={`py-2.5 px-2 rounded-xl text-[11px] font-black border transition-all ${
                            newPlan === p.id
                              ? 'bg-emerald-600/25 border-emerald-500 text-emerald-300 shadow-md'
                              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {newPlan === 'CUSTOM' && (
                    <div className="max-w-xs ml-auto">
                      <label className="block text-[11px] font-bold text-slate-400 mb-1 text-right">
                        عدد أيام الاشتراك المخصص:
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={3650}
                        value={newCustomDays}
                        onChange={(e) => setNewCustomDays(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center text-xs text-white font-mono"
                      />
                    </div>
                  )}

                  {/* Multi-Device Option Toggle when creating subscriber */}
                  <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setNewAllowMultiDevice(!newAllowMultiDevice)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                        newAllowMultiDevice
                          ? 'bg-purple-600/25 border-purple-500 text-purple-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      {newAllowMultiDevice ? '🌐 مسموح بأكثر من جهاز (مفعّل)' : '🔒 مقيد بهاتف واحد فقط (افتراضي)'}
                    </button>
                    <div className="text-right">
                      <p className="text-xs font-black text-white">السماح للحساب بالفتح على أكثر من هاتف/جهاز</p>
                      <p className="text-[10px] text-slate-400">
                        يمكنك تفعيل هذه الميزة الآن أو تغييرها لاحقاً لأي مشترك من القائمة بالأسفل
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>منح تصريح الدخول وتفعيل الاشتراك الآن</span>
                  </button>
                </form>

                {/* Subscribers List */}
                <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-slate-800 pb-4">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث باسم المشترك أو الكود أو الهاتف..."
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-right text-xs text-white focus:outline-none focus:border-blue-500 sm:w-72"
                    />
                    <div className="text-right">
                      <h3 className="text-base font-black text-white">قائمة المشتركين والتراخيص</h3>
                      <p className="text-[11px] text-slate-400">
                        تحكم في التجميد، التجديد السريع، وإلغاء قفل الأجهزة
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                    {filteredLicenses.length === 0 ? (
                      <p className="text-center text-xs text-slate-500 py-10">لا يوجد مشتركين مطابقين للبحث</p>
                    ) : (
                      filteredLicenses.map((lic) => {
                        const expInfo = getRemainingDaysInfo(lic.expiresAt);
                        const planInfo = PLAN_LABELS[lic.plan || 'LIFETIME'] || PLAN_LABELS.LIFETIME;
                        const isEffectivelyActive = lic.status === 'ACTIVE' && !expInfo.isExpired;

                        return (
                          <div
                            key={lic.key}
                            className={`p-4 rounded-2xl border transition-all space-y-3 ${
                              isEffectivelyActive
                                ? 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                                : 'bg-rose-950/15 border-rose-900/40'
                            }`}
                          >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                              {/* Left: Action Buttons */}
                              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto justify-end md:justify-start order-2 md:order-1">
                                {confirmDeleteKey === lic.key ? (
                                  <div className="flex items-center gap-1 bg-red-950/80 border border-red-500/40 px-2 py-1 rounded-xl">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteLicense(lic.key)}
                                      className="px-2 py-1 bg-red-600 text-white rounded-lg text-[10px] font-black"
                                    >
                                      تأكيد الحذف
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteKey(null)}
                                      className="px-2 py-1 text-slate-300 text-[10px] font-bold"
                                    >
                                      إلغاء
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteKey(lic.key)}
                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                                    title="حذف الاشتراك نهائياً"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleToggleLicenseStatus(lic.key, lic.status)}
                                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black border transition-colors ${
                                    lic.status === 'ACTIVE'
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                                  }`}
                                >
                                  {lic.status === 'ACTIVE' ? 'تجميد مؤقت' : 'تنشيط الاشتراك'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleMultiDevice(lic.key, lic.allowMultipleDevices)}
                                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black border transition-colors flex items-center gap-1 ${
                                    lic.allowMultipleDevices
                                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
                                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-purple-500/40 hover:text-purple-300'
                                  }`}
                                  title="تفعيل أو إلغاء ميزة السماح للحساب بالفتح على أكثر من جهاز"
                                >
                                  <Smartphone className="w-3.5 h-3.5" />
                                  <span>
                                    {lic.allowMultipleDevices ? '🌐 مسموح بأكثر من جهاز' : 'تفعيل أكثر من جهاز'}
                                  </span>
                                </button>

                                {lic.activeDeviceId && !lic.allowMultipleDevices && (
                                  <button
                                    type="button"
                                    onClick={() => handleResetDevice(lic.key)}
                                    className="px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-[11px] font-black transition-colors flex items-center gap-1"
                                    title="إلغاء ربط الجهاز الحالي للسماح بالتفعيل على هاتف آخر"
                                  >
                                    <Smartphone className="w-3.5 h-3.5" />
                                    <span>فك قفل الجهاز</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => copySubscriberCard(lic)}
                                  className="px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl text-[11px] font-black transition-colors flex items-center gap-1"
                                  title="نسخ بطاقة الاشتراك لإرسالها عبر واتساب"
                                >
                                  {copiedKey === `card-${lic.key}` ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>تم نسخ البطاقة</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>نسخ بطاقة المشترك</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Right: Subscriber Info */}
                              <div className="text-right w-full md:w-auto order-1 md:order-2">
                                <div className="flex flex-wrap items-center justify-end gap-2">
                                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black border ${expInfo.colorClass}`}>
                                    {expInfo.label}
                                  </span>
                                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black border ${planInfo.badge}`}>
                                    {planInfo.ar}
                                  </span>
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                                      lic.status === 'ACTIVE'
                                        ? 'bg-emerald-500/15 text-emerald-400'
                                        : lic.status === 'PENDING'
                                        ? 'bg-amber-500/20 text-amber-300'
                                        : 'bg-red-500/15 text-red-400'
                                    }`}
                                  >
                                    {lic.status === 'ACTIVE'
                                      ? 'مصرح له (نشط)'
                                      : lic.status === 'PENDING'
                                      ? 'بانتظار التصريح'
                                      : 'موقوف'}
                                  </span>
                                  <span className="font-black text-sm sm:text-base text-white">{lic.name}</span>
                                </div>

                                <div className="flex flex-wrap items-center justify-end gap-3 mt-1.5 text-xs">
                                  {lic.email && (
                                    <span className="text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-lg text-[11px] font-mono flex items-center gap-1">
                                      <span>{lic.email}</span>
                                      <Mail className="w-3 h-3 text-emerald-400" />
                                    </span>
                                  )}
                                  {lic.phone && (
                                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                                      <span>{lic.phone}</span>
                                      <Phone className="w-3 h-3 text-slate-500" />
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(lic.key, lic.key)}
                                    className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20 flex items-center gap-1.5 hover:bg-amber-500/20"
                                  >
                                    <span>{lic.key}</span>
                                    <Key className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Quick Renew Bar & Timestamps */}
                            <div className="pt-2.5 border-t border-slate-800/70 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-2 text-[10px] text-slate-500">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-slate-400 font-bold ml-1">تجديد / تمديد سريع:</span>
                                <button
                                  type="button"
                                  onClick={() => handleRenewLicense(lic.key, 'MONTHLY')}
                                  className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-blue-600/20 text-blue-300 border border-slate-800 hover:border-blue-500/40 font-black transition-all"
                                >
                                  +30 يوم (شهر)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRenewLicense(lic.key, 'QUARTERLY')}
                                  className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-cyan-600/20 text-cyan-300 border border-slate-800 hover:border-cyan-500/40 font-black transition-all"
                                >
                                  +90 يوم
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRenewLicense(lic.key, 'YEARLY')}
                                  className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-emerald-600/20 text-emerald-300 border border-slate-800 hover:border-emerald-500/40 font-black transition-all"
                                >
                                  +سنة كاملة
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRenewLicense(lic.key, 'LIFETIME')}
                                  className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-amber-600/20 text-amber-300 border border-slate-800 hover:border-amber-500/40 font-black transition-all"
                                >
                                  مدى الحياة ∞
                                </button>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-right">
                                {lic.expiresAt && (
                                  <span>
                                    ينتهي في: <strong className="text-slate-300">{new Date(lic.expiresAt).toLocaleDateString('ar-EG')}</strong>
                                  </span>
                                )}
                                {lic.lastVerified && (
                                  <span>آخر ظهور: {new Date(lic.lastVerified).toLocaleString('ar-EG')}</span>
                                )}
                                <span
                                  className={
                                    lic.allowMultipleDevices
                                      ? 'text-purple-400 font-bold'
                                      : lic.activeDeviceId
                                      ? 'text-amber-400 font-bold'
                                      : 'text-slate-500'
                                  }
                                >
                                  {lic.allowMultipleDevices
                                    ? '🌐 مسموح بالفتح على عدة أجهزة'
                                    : lic.activeDeviceId
                                    ? `🔒 مقفل على هاتف: ${lic.deviceInfo || lic.activeDeviceId.slice(0, 12)}`
                                    : '🔓 غير مرتبط بجهاز بعد (ينتظر أول تفعيل)'}
                                </span>
                                {!!lic.blockedAttempts && lic.blockedAttempts > 0 && (
                                  <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 font-black">
                                    ⚠️ محاولات مشاركة مرفوضة: {lic.blockedAttempts} {lic.lastBlockedDevice ? `(${lic.lastBlockedDevice})` : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MAINTENANCE MODE, BROADCAST & GLOBAL CONTROLS */}
            {adminTab === 'MAINTENANCE' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1: Maintenance Mode */}
                <div className="bg-slate-900/60 border border-amber-500/30 p-6 rounded-3xl space-y-5 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <button
                      type="button"
                      onClick={() => handleSaveGlobalConfig({ maintenanceMode: !adminMaintenanceMode })}
                      className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors duration-300 ${
                        adminMaintenanceMode ? 'bg-amber-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                          adminMaintenanceMode ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <h3 className="text-base font-black text-white">وضع الصيانة والتحديث (Maintenance)</h3>
                        <p className="text-[11px] text-slate-400">
                          إظهار شاشة صيانة احترافية للمستخدمين أثناء تحديث التطبيق
                        </p>
                      </div>
                      <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Wrench className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-2xl border text-xs font-black text-right ${
                      adminMaintenanceMode
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    {adminMaintenanceMode
                      ? '● وضع الصيانة مفعّل حالياً — يظهر للمستخدمين إشعار الصيانة والوقت المتوقع للعودة.'
                      : '● وضع الصيانة غير مفعّل — التطبيق يعمل بشكل طبيعي للمشتركين.'}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1 text-right">
                        رسالة الصيانة التي تظهر للمستخدمين
                      </label>
                      <textarea
                        value={adminMaintenanceMessage}
                        onChange={(e) => setAdminMaintenanceMessage(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-right text-xs text-white focus:outline-none focus:border-amber-500 h-24"
                        placeholder="اكتب رسالة الصيانة أو التحديث الجاري..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1 text-right">
                        الوقت المتوقع لانتهاء الصيانة (اختياري)
                      </label>
                      <input
                        type="text"
                        value={adminMaintenanceEta}
                        onChange={(e) => setAdminMaintenanceEta(e.target.value)}
                        placeholder="مثال: خلال 30 دقيقة / الساعة 10:00 مساءً"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-right text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleSaveGlobalConfig({
                          maintenanceMode: adminMaintenanceMode,
                          maintenanceMessage: adminMaintenanceMessage,
                          maintenanceEta: adminMaintenanceEta,
                        })
                      }
                      className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-2.5 rounded-xl text-xs transition-all"
                    >
                      حفظ إعدادات وضع الصيانة
                    </button>
                  </div>
                </div>

                {/* Card 2: Live In-App Announcement Banner & Contact Info */}
                <div className="bg-slate-900/60 border border-blue-500/30 p-6 rounded-3xl space-y-5 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <button
                      type="button"
                      onClick={() => handleSaveGlobalConfig({ announcementActive: !adminAnnouncementActive })}
                      className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors duration-300 ${
                        adminAnnouncementActive ? 'bg-blue-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                          adminAnnouncementActive ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <h3 className="text-base font-black text-white">شريط الإشعارات العام للمشتركين</h3>
                        <p className="text-[11px] text-slate-400">
                          إرسال تنبيه أو خبر يظهر أعلى التطبيق لجميع المشتركين النشطين
                        </p>
                      </div>
                      <div className="w-11 h-11 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                        <Megaphone className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1 text-right">
                        نص الإشعار / التنبيه العام داخل التطبيق
                      </label>
                      <textarea
                        value={adminAnnouncementText}
                        onChange={(e) => setAdminAnnouncementText(e.target.value)}
                        placeholder="مثال: تم إضافة حاسبة حجم البئر الكلي مع الرسم التفاعلي وجدول سعة الكيسينق!"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-right text-xs text-white focus:outline-none focus:border-blue-500 h-20"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <label className="block text-xs font-bold text-slate-300 mb-1 text-right">
                        بيانات التواصل للاشتراك أو التجديد (تظهر في شاشة التفعيل والانتهاء)
                      </label>
                      <input
                        type="text"
                        value={adminContactInfo}
                        onChange={(e) => setAdminContactInfo(e.target.value)}
                        placeholder="مثال: للتجديد أو الاشتراك تواصل عبر واتساب: 091XXXXXXX"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-right text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleSaveGlobalConfig({
                          announcementActive: adminAnnouncementActive,
                          announcementText: adminAnnouncementText,
                          contactInfo: adminContactInfo,
                        })
                      }
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-2.5 rounded-xl text-xs transition-all"
                    >
                      حفظ الإشعار وبيانات التواصل
                    </button>
                  </div>
                </div>

                {/* Card 3: Free Mode & Emergency Stop */}
                <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Free Mode */}
                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => handleSaveGlobalConfig({ isAppFree: !adminIsAppFree })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                          adminIsAppFree ? 'bg-emerald-600' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                            adminIsAppFree ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-xs font-black text-white">فتح التطبيق مجاناً للجميع (بدون كود اشتراك)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 text-right leading-relaxed">
                      عند تفعيل هذا الخيار، سيتمكن أي مستخدم من فتح التطبيق مباشرة دون الحاجة لإدخال كود اشتراك.
                    </p>
                  </div>

                  {/* Kill Switch */}
                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-red-900/30 space-y-3">
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => handleSaveGlobalConfig({ globalKillSwitch: !globalKillSwitch })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                          globalKillSwitch ? 'bg-red-600' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                            globalKillSwitch ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-xs font-black text-red-400">إيقاف الطوارئ الشامل (Kill Switch)</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveGlobalConfig({ globalMessage: adminGlobalMessage })}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[11px] font-bold shrink-0"
                      >
                        حفظ الرسالة
                      </button>
                      <input
                        type="text"
                        value={adminGlobalMessage}
                        onChange={(e) => setAdminGlobalMessage(e.target.value)}
                        placeholder="رسالة الإيقاف الشامل..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-right text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: APP VERSIONS & MANDATORY UPDATES */}
            {adminTab === 'VERSIONS' && (
              <div className="space-y-6">
                {/* Mandatory Update Controls */}
                <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                      نسخة التطبيق الحالية في الكود: V{CURRENT_APP_VERSION}
                    </span>
                    <h3 className="text-base font-black text-white">إعدادات التحديث الإجباري المباشر</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <button
                      type="button"
                      onClick={() =>
                        handleSaveGlobalConfig({
                          latestRequiredVersion: adminLatestRequiredVersion,
                          updateUrl: adminUpdateUrl,
                        })
                      }
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-2.5 rounded-xl text-xs transition-all"
                    >
                      حفظ وتطبيق التحديث الإجباري
                    </button>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1 text-right">
                        رابط تحميل التحديث الجديد (APK أو موقع)
                      </label>
                      <input
                        type="text"
                        value={adminUpdateUrl}
                        onChange={(e) => setAdminUpdateUrl(e.target.value)}
                        placeholder="https://example.com/app.apk"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-right text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1 text-right">
                        الحد الأدنى للإصدار المطلوب (مثال: 1.0.0 أو 1.1.0)
                      </label>
                      <input
                        type="text"
                        value={adminLatestRequiredVersion}
                        onChange={(e) => setAdminLatestRequiredVersion(e.target.value)}
                        placeholder="1.0.0"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Full-width App Versions Management Section */}
                <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form to Add New Version */}
                    <form
                      onSubmit={handleAddAppVersion}
                      className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4"
                    >
                      <span className="block text-xs font-black text-blue-400 text-right mb-2">
                        إضافة إصدار جديد في سجل التحديثات
                      </span>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] text-slate-400 text-right mb-1 font-bold">
                            رقم الإصدار الجديد (مثال: 1.1.0)
                          </label>
                          <input
                            type="text"
                            value={newVersionNum}
                            onChange={(e) => setNewVersionNum(e.target.value)}
                            placeholder="1.1.0"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-center text-xs text-white font-mono"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 text-right mb-1 font-bold">
                            تاريخ إطلاق الإصدار
                          </label>
                          <input
                            type="date"
                            value={newVersionDate}
                            onChange={(e) => setNewVersionDate(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-center text-xs text-white"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 text-right mb-1 font-bold">
                            رابط تحميل الـ APK لهذا الإصدار
                          </label>
                          <input
                            type="text"
                            value={newVersionUrl}
                            onChange={(e) => setNewVersionUrl(e.target.value)}
                            placeholder="/APK_DOWNLOAD/app-debug.apk"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-right text-xs text-white font-mono"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 text-right mb-1 font-bold">
                            الميزات والتغييرات الجديدة (كل ميزة في سطر)
                          </label>
                          <textarea
                            value={newVersionFeatures}
                            onChange={(e) => setNewVersionFeatures(e.target.value)}
                            placeholder="إضافة حاسبة حجم البئر الكلي&#10;إضافة جدول سعات الكيسينق"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-right text-xs text-white h-24"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> تسجيل وحفظ هذا الإصدار
                      </button>
                    </form>

                    {/* List of Registered Versions */}
                    <div className="lg:col-span-2 space-y-4">
                      <span className="block text-xs font-black text-slate-400 text-right mb-2">
                        الإصدارات المسجلة حالياً وإمكانية الاعتماد الفوري
                      </span>

                      <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1 custom-scrollbar">
                        {appVersionsList.length === 0 ? (
                          <p className="text-center text-xs text-slate-500 py-12">لا توجد إصدارات مسجلة حالياً</p>
                        ) : (
                          appVersionsList.map((ver) => (
                            <div
                              key={ver.version}
                              className={`p-4 rounded-2xl border transition-all ${
                                ver.isActive
                                  ? 'bg-blue-950/20 border-blue-500/40 shadow-lg'
                                  : 'bg-slate-950/20 border-slate-800/80'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="flex items-center gap-2">
                                  {confirmDeleteVer === ver.version ? (
                                    <div className="flex items-center gap-1 bg-red-950/80 border border-red-500/40 px-2 py-1 rounded-xl">
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteAppVersion(ver.version)}
                                        className="px-2 py-1 bg-red-600 text-white rounded-lg text-[10px] font-black"
                                      >
                                        تأكيد
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteVer(null)}
                                        className="px-2 py-1 text-slate-300 text-[10px]"
                                      >
                                        إلغاء
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteVer(ver.version)}
                                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}

                                  {!ver.isActive ? (
                                    <button
                                      type="button"
                                      onClick={() => handleActivateAppVersion(ver.version)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                                    >
                                      <CheckCircle2 className="w-4 h-4" /> اعتماد وتفعيل هذا الإصدار للمستخدمين
                                    </button>
                                  ) : (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> الإصدار النشط حالياً
                                    </div>
                                  )}
                                </div>

                                <div className="text-right">
                                  <span className="font-bold text-md text-white font-mono">V {ver.version}</span>
                                  <p className="text-[10px] text-slate-500 mt-0.5">تاريخ الإصدار: {ver.releaseDate}</p>
                                </div>
                              </div>

                              <div className="mt-3 pt-3 border-t border-slate-800/60 text-right">
                                <ul className="space-y-1">
                                  {ver.features &&
                                    ver.features.map((feat, idx) => (
                                      <li key={idx} className="text-xs text-slate-300 flex items-start justify-end gap-1.5">
                                        <span>{feat}</span>
                                        <span className="text-blue-500">•</span>
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        )}

        <footer className="text-center text-slate-600 text-xs mt-8">
          Total Cement Pro Subscription & Admin System © {new Date().getFullYear()}
        </footer>
      </div>
    );
  }

  // MAINTENANCE MODE VIEW
  if (status === 'MAINTENANCE') {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center font-tajawal text-slate-100 p-6">
        <div className="max-w-md w-full bg-slate-900/70 backdrop-blur-md border border-amber-500/30 p-8 rounded-[2.5rem] shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

          <div className="w-20 h-20 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-3xl flex items-center justify-center mx-auto">
            <Wrench className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-white">التطبيق في وضع الصيانة والتحديث</h2>
            <p className="text-[10px] text-amber-400 uppercase tracking-widest font-black">
              SCHEDULED MAINTENANCE & UPGRADE
            </p>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
            {globalMessage ||
              'التطبيق يخضع حالياً لأعمال صيانة وتحديثات دورية لتحسين الأداء وإضافة ميزات هندسية جديدة. سيعود للعمل قريباً.'}
          </p>

          {maintenanceEta && (
            <div className="bg-amber-500/10 border border-amber-500/25 px-4 py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-black text-amber-300">
              <Clock className="w-4 h-4" />
              <span>الوقت المتوقع للعودة: {maintenanceEta}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={checkCurrentLicense}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة التحقق من انتهاء الصيانة</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // GLOBAL SUSPENDED VIEW (Kill Switch Triggered)
  if (status === 'GLOBAL_SUSPENDED') {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center font-tajawal text-slate-100 p-6">
        <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-md border border-red-500/20 p-8 rounded-[2.5rem] shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto relative animate-pulse">
            <AlertTriangle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">النسخة متوقفة مؤقتاً</h2>
            <p className="text-[10px] text-red-400 uppercase tracking-widest font-black">TEMPORARY SUSPENSION</p>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
            {globalMessage || 'النسخة متوقفة للصيانة أو انتهاء فترة الترخيص. يرجى التواصل مع الإدارة للتفعيل.'}
          </p>
        </div>
      </div>
    );
  }

  // EXPIRED SUBSCRIPTION VIEW
  if (status === 'EXPIRED') {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center font-tajawal text-slate-100 p-6">
        <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-md border border-orange-500/30 p-8 rounded-[2.5rem] shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

          <div className="w-20 h-20 bg-orange-500/10 border border-orange-500/25 text-orange-400 rounded-3xl flex items-center justify-center mx-auto">
            <Calendar className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">انتهت فترة الاشتراك</h2>
            <p className="text-xs text-slate-400">
              المشترك: <strong className="text-amber-400 font-bold">{licenseName}</strong>
            </p>
            {licenseExpiresAt && (
              <p className="text-[11px] text-rose-400 font-bold">
                تاريخ الانتهاء: {new Date(licenseExpiresAt).toLocaleDateString('ar-EG')}
              </p>
            )}
          </div>

          <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
            {globalMessage || 'انتهت صلاحية باقة اشتراكك الحالية. يرجى التواصل مع الإدارة لتجديد الاشتراك ومواصلة استخدام التطبيق.'}
          </p>

          {contactInfo && (
            <div className="bg-blue-500/10 border border-blue-500/20 p-3.5 rounded-2xl text-xs text-blue-300 font-bold">
              {contactInfo}
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={checkCurrentLicense}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>تم التجديد؟ اضغط للتحقق والدخول</span>
            </button>
            <button
              type="button"
              onClick={() => {
                secureRemoveLocal('active_license_key');
                setStatus('REQUIRED');
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-xs font-bold transition-colors"
            >
              إدخال كود اشتراك آخر
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SPECIFIC LICENSE SUSPENDED VIEW
  if (status === 'SUSPENDED') {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center font-tajawal text-slate-100 p-6">
        <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-md border border-red-500/20 p-8 rounded-[2.5rem] shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white italic">تم تجميد الاشتراك</h2>
            <p className="text-xs text-slate-400">
              الخاص بالمهندس/المشترك: <strong className="text-amber-400 font-bold">{licenseName}</strong>
            </p>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
            {globalMessage || 'تم إيقاف تفعيل هذا الاشتراك مؤقتاً من قبل المسؤول. يرجى التواصل مع الإدارة.'}
          </p>

          {contactInfo && (
            <div className="bg-blue-500/10 border border-blue-500/20 p-3.5 rounded-2xl text-xs text-blue-300 font-bold">
              {contactInfo}
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                secureRemoveLocal('active_license_key');
                setStatus('REQUIRED');
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-xs font-bold transition-colors"
            >
              إدخال رمز اشتراك آخر
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DEVICE_LOCKED VIEW
  if (status === 'DEVICE_LOCKED') {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center font-tajawal text-slate-100 p-6">
        <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-md border border-amber-500/20 p-8 rounded-[2.5rem] shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-3xl flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white italic">الاشتراك مقفل على جهاز آخر</h2>
            <p className="text-xs text-slate-400">
              المشترك: <strong className="text-amber-400 font-bold">{licenseName}</strong>
            </p>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
            {globalMessage ||
              'هذا الاشتراك مفعّل ومرتبط بجهاز آخر! لا يمكن استخدام نفس الكود على أكثر من جهاز في نفس الوقت. تواصل مع المسؤول لإعادة تعيين قفل الجهاز.'}
          </p>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                secureRemoveLocal('active_license_key');
                setStatus('REQUIRED');
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-xs font-bold transition-colors"
            >
              إدخال رمز اشتراك آخر
            </button>
          </div>
        </div>
      </div>
    );
  }

  // UPDATE_REQUIRED VIEW
  if (status === 'UPDATE_REQUIRED') {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center font-tajawal text-slate-100 p-6">
        <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-md border border-blue-500/20 p-8 rounded-[2.5rem] shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-3xl flex items-center justify-center mx-auto">
            <RefreshCw className="w-10 h-10 animate-spin" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white italic">تحديث إجباري مطلوب</h2>
            <p className="text-[10px] text-blue-400 uppercase tracking-widest font-black">MANDATORY UPDATE REQUIRED</p>
          </div>

          <div className="space-y-3 bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
            <p className="text-slate-300 text-sm leading-relaxed">
              يرجى تثبيت التحديث الجديد للتطبيق للمتابعة والحصول على كافة الميزات الهندسية الجديدة.
            </p>
            <div className="flex justify-around text-xs text-slate-500 border-t border-slate-800/80 pt-3">
              <div>
                النسخة الجديدة: <strong className="text-emerald-400">{latestVersion}</strong>
              </div>
              <div>
                نسختك الحالية: <strong className="text-red-400">{CURRENT_APP_VERSION}</strong>
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-2.5 w-full">
            {updateUrl ? (
              <a
                href={updateUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-black py-3.5 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                تحميل التحديث الجديد الآن <ArrowRight className="w-4 h-4" />
              </a>
            ) : (
              <div className="bg-slate-950/80 p-3 rounded-xl text-xs text-slate-400 border border-slate-800">
                يرجى التواصل مع الإدارة للحصول على رابط التحديث الجديد للنسخة {latestVersion}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // PENDING_APPROVAL VIEW (Waiting for Admin to authorize Gmail)
  if (status === 'PENDING_APPROVAL') {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center font-tajawal text-slate-100 p-6">
        <div className="max-w-md w-full bg-slate-900/70 backdrop-blur-md border border-amber-500/30 p-8 rounded-[2.5rem] shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

          <div className="w-20 h-20 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-3xl flex items-center justify-center mx-auto">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-white">بانتظار تصريح الدخول</h2>
            <p className="text-[10px] text-amber-400 uppercase tracking-widest font-black">
              AWAITING ADMIN AUTHORIZATION
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-1.5">
            {licenseName && (
              <p className="text-xs text-slate-300">
                المهندس: <strong className="text-white font-black">{licenseName}</strong>
              </p>
            )}
            {licenseEmail && (
              <p className="text-xs font-mono text-emerald-400 font-bold">{licenseEmail}</p>
            )}
          </div>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
            {globalMessage ||
              'تم تسجيل حساب Gmail الخاص بك وربطه بهاتفك بنجاح! طلبك الآن لدى المسؤول (Engineer Faraj Meftah) لمنحك تصريح الدخول. سيفتح التطبيق تلقائياً فور الموافقة.'}
          </p>

          {contactInfo && (
            <div className="bg-blue-500/10 border border-blue-500/20 p-3.5 rounded-2xl text-xs text-blue-300 font-bold">
              {contactInfo}
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={checkCurrentLicense}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>تم منحك التصريح؟ اضغط للدخول الآن</span>
            </button>
            <button
              type="button"
              onClick={handleLogoutLicense}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-xs font-bold transition-colors"
            >
              تسجيل الدخول بحساب آخر
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LICENSE ACTIVATION REQUIRED VIEW
  if (status === 'REQUIRED') {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col justify-between font-tajawal text-slate-100 p-6">
        <div></div>

        <main className="max-w-md w-full mx-auto bg-slate-900/60 backdrop-blur-md border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-3xl flex items-center justify-center mx-auto">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic">التسجيل وتفعيل الدخول</h2>
              <p className="text-[10px] text-blue-400 tracking-widest font-black mt-1 uppercase">
                TOTAL CEMENT PRO ACCESS
              </p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed px-2">
              {isAppFree
                ? 'التطبيق متاح حالياً مجاناً لجميع المهندسين بقرار من الإدارة. يمكنك الدخول فوراً.'
                : 'سجّل الدخول بحساب Gmail الخاص بك للحصول على تصريح الدخول من المسؤول، أو أدخل كود الاشتراك المباشر.'}
            </p>
          </div>

          {isAppFree && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-center space-y-2">
              <p className="text-xs font-bold text-emerald-400">● النسخة مجانية ومتاحة للجميع حالياً</p>
              <button
                type="button"
                onClick={() => setStatus('ACTIVE')}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg"
              >
                الدخول المباشر إلى التطبيق الآن
              </button>
            </div>
          )}

          {/* Primary Direct Gmail Registration / Login Form (100% Free, No External Cloud API Required) */}
          <form onSubmit={handleDirectGmailRegister} className="space-y-3 bg-slate-950/60 border border-emerald-500/30 p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                مجاني 100% • قفل جهاز ذكي
              </span>
              <label className="text-xs font-black text-white flex items-center gap-1.5">
                <span>التسجيل والدخول عبر حساب Gmail</span>
                <Mail className="w-4 h-4 text-emerald-400" />
              </label>
            </div>

            <div className="space-y-2.5">
              <input
                type="text"
                value={inputDirectName}
                onChange={(e) => setInputDirectName(e.target.value)}
                placeholder="اسم المهندس (اختياري عند الدخول المسبق)"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-right text-white text-xs focus:outline-none focus:border-emerald-500"
              />
              <input
                type="email"
                required
                dir="ltr"
                value={inputDirectGmail}
                onChange={(e) => setInputDirectGmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-center text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={gmailAuthBusy}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black py-3.5 px-5 rounded-xl transition-all shadow-lg shadow-emerald-600/25 active:scale-[0.98] text-xs flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>
                {gmailAuthBusy
                  ? 'جاري التحقق من حساب Gmail...'
                  : 'تسجيل / دخول بحساب Gmail (طلب تصريح)'}
              </span>
            </button>

            <button
              type="button"
              disabled={gmailAuthBusy}
              onClick={handleSubscriberGmailSignIn}
              className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-2.5 px-4 rounded-xl border border-slate-800 text-[11px] transition-all flex items-center justify-center gap-2"
            >
              <span>أو اختيار حساب Gmail تلقائياً عبر نافذة Google</span>
            </button>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              عند إدخال بريد Gmail، يصل طلبك مباشرة للوحة تحكم المسؤول لمنحك تصريح الدخول على هذا الهاتف فقط.
            </p>
          </form>

          {errorMsg && (
            <p className="text-red-400 text-xs font-bold text-center bg-red-500/10 py-2.5 px-3 rounded-xl border border-red-500/20 leading-relaxed">
              {errorMsg}
            </p>
          )}

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-500 font-bold">أو عبر كود التفعيل</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <form onSubmit={handleActivate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 text-right">
                كود الاشتراك الشخصي (Subscription Key)
              </label>
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value.toUpperCase())}
                placeholder="CEMENT-XXXX-XXXX"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-center text-white focus:outline-none focus:border-blue-500 font-mono transition-colors tracking-widest text-base uppercase placeholder-slate-700"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white font-black py-3 rounded-xl transition-all border border-slate-700 hover:border-blue-500 active:scale-[0.98] text-xs"
            >
              تفعيل عبر الكود والدخول
            </button>
          </form>

          {contactInfo && (
            <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl text-center">
              <p className="text-[11px] text-slate-400 font-bold">{contactInfo}</p>
            </div>
          )}
        </main>

        <footer className="text-center text-slate-600 text-xs">
          التطبيق محمي بحقوق الملكية البرمجية للمطورين.
        </footer>
      </div>
    );
  }

  // Active State - Wrap the app with Context & optional Broadcast Banner
  return (
    <LicenseContext.Provider
      value={{
        licenseKey,
        licenseName,
        plan: licensePlan,
        expiresAt: licenseExpiresAt,
        isAppFree,
        openAdminPanel,
        logoutLicense: handleLogoutLicense,
      }}
    >
      {/* Admin Bypass Bar if Maintenance or KillSwitch is on while Admin is previewing */}
      {adminBypassApp && (adminMaintenanceMode || globalKillSwitch) && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 px-4 py-2 text-center font-tajawal flex items-center justify-between max-w-xl mx-auto rounded-b-2xl">
          <button
            type="button"
            onClick={openAdminPanel}
            className="px-3 py-1 bg-amber-500 text-slate-950 rounded-lg text-[10px] font-black"
          >
            العودة للوحة التحكم
          </button>
          <span className="text-[11px] font-black text-amber-300">
            ⚠️ أنت تتصفح التطبيق بصلاحية المسؤول (التطبيق حالياً في وضع الصيانة/التوقف للمستخدمين)
          </span>
        </div>
      )}

      {/* Live Announcement Banner for Subscribers */}
      {announcementActive && announcementText && !dismissedAnnouncement && (
        <div className="bg-gradient-to-r from-blue-900/80 via-indigo-900/80 to-blue-900/80 border-b border-blue-500/30 px-4 py-2.5 font-tajawal">
          <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setDismissedAnnouncement(true)}
              className="text-slate-400 hover:text-white text-xs font-bold shrink-0 px-1.5"
              title="إخفاء الإشعار"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 text-right">
              <p className="text-xs font-bold text-blue-100 leading-relaxed">{announcementText}</p>
              <Megaphone className="w-4 h-4 text-amber-400 shrink-0" />
            </div>
          </div>
        </div>
      )}

      {children}
    </LicenseContext.Provider>
  );
};
