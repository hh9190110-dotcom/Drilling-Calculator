
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { signResponse } from "./services/crypto";

dotenv.config();

const LICENSES_FILE = path.join(process.cwd(), "licenses.json");

// Ensure licenses.json exists and load it
function loadLicensesData() {
  if (!fs.existsSync(LICENSES_FILE)) {
    const defaultData = {
      globalKillSwitch: false,
      globalMessage: "النسخة متوقفة للصيانة أو انتهاء فترة الترخيص. يرجى التواصل مع الإدارة للتفعيل.",
      maintenanceMode: false,
      maintenanceMessage: "التطبيق يخضع حالياً لأعمال صيانة وتحديثات دورية لتحسين الأداء وإضافة ميزات هندسية جديدة. سيعود للعمل قريباً.",
      maintenanceEta: "",
      announcementActive: false,
      announcementText: "",
      contactInfo: "للاشتراك أو تجديد الباقة يرجى التواصل مع إدارة التطبيق",
      adminPassword: process.env.ADMIN_PASSWORD || "cementAdmin2026",
      recoveryGmail: process.env.RECOVERY_GMAIL || "hh9190110@gmail.com",
      isAppFree: false,
      latestRequiredVersion: "1.0.0",
      updateUrl: "",
      licenses: [
        {
          key: "CEMENT-DEMO-1111",
          name: "نسخة المهندس جبريل",
          status: "ACTIVE",
          plan: "LIFETIME",
          expiresAt: null,
          phone: "",
          createdAt: new Date().toISOString(),
          lastVerified: "",
          activeDeviceId: ""
        },
        {
          key: "CEMENT-DEMO-2222",
          name: "نسخة المهندس فرج",
          status: "ACTIVE",
          plan: "LIFETIME",
          expiresAt: null,
          phone: "",
          createdAt: new Date().toISOString(),
          lastVerified: "",
          activeDeviceId: ""
        }
      ]
    };
    fs.writeFileSync(LICENSES_FILE, JSON.stringify(defaultData, null, 2), "utf8");
    return defaultData;
  }
  
  try {
    const content = fs.readFileSync(LICENSES_FILE, "utf8");
    const data = JSON.parse(content);
    
    // Fill in defaults if missing (for backward compatibility)
    if (!data.adminPassword) data.adminPassword = process.env.ADMIN_PASSWORD || "cementAdmin2026";
    if (!data.recoveryGmail) data.recoveryGmail = process.env.RECOVERY_GMAIL || "hh9190110@gmail.com";
    if (data.isAppFree === undefined) data.isAppFree = false;
    if (data.maintenanceMode === undefined) data.maintenanceMode = false;
    if (data.maintenanceMessage === undefined) {
      data.maintenanceMessage = "التطبيق يخضع حالياً لأعمال صيانة وتحديثات دورية لتحسين الأداء وإضافة ميزات هندسية جديدة. سيعود للعمل قريباً.";
    }
    if (data.maintenanceEta === undefined) data.maintenanceEta = "";
    if (data.announcementActive === undefined) data.announcementActive = false;
    if (data.announcementText === undefined) data.announcementText = "";
    if (data.contactInfo === undefined) data.contactInfo = "للاشتراك أو تجديد الباقة يرجى التواصل مع إدارة التطبيق";
    if (data.latestRequiredVersion === undefined) data.latestRequiredVersion = "1.0.0";
    if (data.updateUrl === undefined) data.updateUrl = "";
    if (data.appVersions === undefined || !Array.isArray(data.appVersions)) {
      data.appVersions = [
        {
          version: "1.0.0",
          releaseDate: "2026-06-29",
          features: [
            "الإصدار الأساسي لتطبيق حسابات هندسة الأسمنت المتقدمة (Cementing Master)",
            "أدوات حسابات هيدروليكية كاملة وحجم الحلقي وإزاحة السوائل وضخ الأسمنت وحجم Shoe Track",
            "أداة المسح الذكي لصور العمليات وطباعة التقارير بنظام PDF ومشاركتها"
          ],
          downloadUrl: "/APK_DOWNLOAD/app-debug.apk",
          isActive: true
        }
      ];
    }
    if (data.licenses) {
      data.licenses.forEach((lic: any) => {
        if (lic.activeDeviceId === undefined) lic.activeDeviceId = "";
        if (lic.plan === undefined) lic.plan = "LIFETIME";
        if (lic.expiresAt === undefined) lic.expiresAt = null;
        if (lic.phone === undefined) lic.phone = "";
      });
    }
    return data;
  } catch (error) {
    console.error("Error reading licenses file, resetting to default", error);
    return {
      globalKillSwitch: false,
      globalMessage: "النسخة متوقفة للصيانة أو انتهاء فترة الترخيص.",
      maintenanceMode: false,
      maintenanceMessage: "التطبيق يخضع حالياً لأعمال صيانة وتحديثات دورية.",
      maintenanceEta: "",
      announcementActive: false,
      announcementText: "",
      contactInfo: "للاشتراك أو تجديد الباقة يرجى التواصل مع إدارة التطبيق",
      adminPassword: process.env.ADMIN_PASSWORD || "cementAdmin2026",
      recoveryGmail: process.env.RECOVERY_GMAIL || "hh9190110@gmail.com",
      isAppFree: false,
      latestRequiredVersion: "1.0.0",
      updateUrl: "",
      appVersions: [
        {
          version: "1.0.0",
          releaseDate: "2026-06-29",
          features: [
            "الإصدار الأساسي لتطبيق حسابات هندسة الأسمنت المتقدمة (Cementing Master)",
            "أدوات حسابات هيدروليكية كاملة وحجم الحلقي وإزاحة السوائل وضخ الأسمنت وحجم Shoe Track",
            "أداة المسح الذكي لصور العمليات وطباعة التقارير بنظام PDF ومشاركتها"
          ],
          downloadUrl: "/APK_DOWNLOAD/app-debug.apk",
          isActive: true
        }
      ],
      licenses: []
    };
  }
}

function saveLicensesData(data: any) {
  try {
    fs.writeFileSync(LICENSES_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error saving licenses file", error);
  }
}

// Helper to check admin password
function isPasswordValid(inputPassword: any, data: any): boolean {
  const cleanInput = (inputPassword || "").toString().trim();
  if (!cleanInput) return false;

  const filePassword = (data?.adminPassword || "").toString().trim();
  const envPassword = (process.env.ADMIN_PASSWORD || "").toString().trim();
  const fallbackPassword = "cementAdmin2026";

  if (filePassword) {
    if (cleanInput === filePassword) return true;
  } else if (cleanInput === fallbackPassword) {
    return true;
  }

  if (envPassword && cleanInput === envPassword) {
    return true;
  }

  return false;
}

function isAdminEmail(email: any, data: any): boolean {
  const clean = (email || "").toString().trim().toLowerCase();
  if (!clean) return false;
  const configured = (data?.recoveryGmail || "hh9190110@gmail.com").toString().trim().toLowerCase();
  return clean === "hh9190110@gmail.com" || clean === configured;
}

const pendingRecoveryOtps = new Map<string, { code: string; email: string; expiresAt: number }>();

function encodeBase64Url(input: string): string {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function fetchGoogleUserEmail(authHeader?: string): Promise<{ email: string; name?: string; verified: boolean } | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const resp = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: authHeader },
    });
    if (!resp.ok) return null;
    const info: any = await resp.json();
    if (!info?.email) return null;
    return {
      email: String(info.email).trim().toLowerCase(),
      name: info.name ? String(info.name).trim() : undefined,
      verified: info.email_verified !== false,
    };
  } catch {
    return null;
  }
}

function computeExpiryDate(plan: string, customDays?: number, baseDate?: Date): string | null {
  const start = baseDate && baseDate.getTime() > Date.now() ? new Date(baseDate) : new Date();
  switch (plan) {
    case "TRIAL":
      start.setDate(start.getDate() + 7);
      return start.toISOString();
    case "MONTHLY":
      start.setDate(start.getDate() + 30);
      return start.toISOString();
    case "QUARTERLY":
      start.setDate(start.getDate() + 90);
      return start.toISOString();
    case "YEARLY":
      start.setDate(start.getDate() + 365);
      return start.toISOString();
    case "CUSTOM": {
      const days = Math.max(1, Number(customDays) || 30);
      start.setDate(start.getDate() + days);
      return start.toISOString();
    }
    case "LIFETIME":
    default:
      return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes

  // 1. Verify License Key or Authorized Gmail
  app.post("/api/license/verify", (req, res) => {
    try {
      const { key, email, deviceId, deviceInfo } = req.body;
      const data = loadLicensesData();

      const commonMeta = {
        isAppFree: data.isAppFree,
        latestRequiredVersion: data.latestRequiredVersion,
        updateUrl: data.updateUrl,
        maintenanceMode: !!data.maintenanceMode,
        maintenanceMessage: data.maintenanceMessage || "",
        maintenanceEta: data.maintenanceEta || "",
        announcementActive: !!data.announcementActive,
        announcementText: data.announcementText || "",
        contactInfo: data.contactInfo || ""
      };
      
      // If global kill switch is ON, block immediately regardless of key
      if (data.globalKillSwitch) {
        return res.json(signResponse({
          success: false,
          globalKillSwitch: true,
          globalMessage: data.globalMessage,
          status: "GLOBAL_SUSPENDED",
          message: data.globalMessage,
          ...commonMeta
        }));
      }

      // If Maintenance Mode is ON, put app in maintenance screen for users
      if (data.maintenanceMode) {
        return res.json(signResponse({
          success: false,
          status: "MAINTENANCE",
          message: data.maintenanceMessage || "التطبيق في وضع الصيانة والتحديث حالياً.",
          ...commonMeta
        }));
      }

      // If app is free, immediately tell client it's active and bypass license checks
      if (data.isAppFree) {
        return res.json(signResponse({
          success: true,
          status: "ACTIVE",
          name: "نسخة مجانية مفعّلة",
          plan: "LIFETIME",
          expiresAt: null,
          ...commonMeta
        }));
      }

      const cleanEmail = (email || "").toString().trim().toLowerCase();
      const normalizeKey = (k: string) => (k || "").toString().replace(/\s+/g, "").toUpperCase();
      const cleanKey = normalizeKey(key);

      // If this is the Admin's official Gmail (hh9190110@gmail.com), always grant full lifetime multi-device access
      if (cleanEmail && isAdminEmail(cleanEmail, data)) {
        return res.json(signResponse({
          success: true,
          status: "ACTIVE",
          key: "ADMIN-MASTER-KEY",
          email: cleanEmail,
          name: "Engineer Faraj Meftah (المسؤول)",
          plan: "LIFETIME",
          expiresAt: null,
          allowMultipleDevices: true,
          isAdminAccount: true,
          globalKillSwitch: false,
          ...commonMeta
        }));
      }

      if (!cleanKey && !cleanEmail) {
        return res.json(signResponse({ 
          success: false, 
          status: "MISSING_KEY", 
          message: "يرجى تسجيل الدخول بحساب Gmail أو إدخال رمز التفعيل",
          ...commonMeta
        }));
      }

      const license = data.licenses.find((l: any) => {
        if (cleanEmail && l.email && String(l.email).trim().toLowerCase() === cleanEmail) return true;
        if (cleanKey && normalizeKey(l.key) === cleanKey) return true;
        return false;
      });
      
      if (!license) {
        return res.json(signResponse({ 
          success: false, 
          status: "INVALID", 
          message: cleanEmail ? "حساب Gmail هذا غير مسجل حالياً. يرجى الضغط على زر التسجيل عبر Gmail لطلب التصريح." : "رمز التفعيل غير صحيح!",
          ...commonMeta
        }));
      }

      // Strict single-device anti-sharing lock
      const cleanDeviceId = (deviceId || "").toString().trim();
      if (!cleanDeviceId) {
        return res.json(signResponse({
          success: false,
          status: "INVALID",
          message: "تعذر التحقق من بصمة الجهاز الفريدة. يرجى إعادة المحاولة.",
          ...commonMeta
        }));
      }

      // If PENDING admin authorization
      if (license.status === "PENDING") {
        if (!license.activeDeviceId) {
          license.activeDeviceId = cleanDeviceId;
          license.deviceInfo = (deviceInfo || "هاتف / متصفح").toString().slice(0, 120);
          license.deviceBoundAt = new Date().toISOString();
        }
        license.lastVerified = new Date().toISOString();
        saveLicensesData(data);

        return res.json(signResponse({
          success: false,
          status: "PENDING_APPROVAL",
          key: license.key,
          email: license.email || cleanEmail,
          name: license.name,
          plan: license.plan || "MONTHLY",
          message: "تم إرسال طلبك بنجاح! حساب Gmail الخاص بك بانتظار منح تصريح الدخول من قِبل المسؤول (Engineer Faraj Meftah). سيفتح التطبيق تلقائياً فور التفعيل.",
          ...commonMeta
        }));
      }

      // Check subscription expiration date
      if (license.expiresAt) {
        const expTime = new Date(license.expiresAt).getTime();
        if (!isNaN(expTime) && expTime < Date.now()) {
          return res.json(signResponse({
            success: false,
            status: "EXPIRED",
            key: license.key,
            email: license.email || "",
            name: license.name,
            plan: license.plan || "MONTHLY",
            expiresAt: license.expiresAt,
            message: "انتهت فترة صلاحية اشتراكك! يرجى التواصل مع الإدارة لتجديد الباقة.",
            ...commonMeta
          }));
        }
      }

      if (license.status !== "ACTIVE") {
        return res.json(signResponse({ 
          success: false, 
          status: "SUSPENDED", 
          key: license.key,
          email: license.email || "",
          name: license.name,
          plan: license.plan || "LIFETIME",
          expiresAt: license.expiresAt || null,
          message: "تم إيقاف تصريح الدخول لهذا الحساب مؤقتاً من قبل المسؤول!",
          ...commonMeta
        }));
      }

      if (!license.allowMultipleDevices) {
        if (!license.activeDeviceId) {
          // First activation: permanently bind this subscription key/Gmail to this phone/device
          license.activeDeviceId = cleanDeviceId;
          license.deviceInfo = (deviceInfo || "هاتف / متصفح معتمد").toString().slice(0, 120);
          license.deviceBoundAt = new Date().toISOString();
        } else if (license.activeDeviceId !== cleanDeviceId) {
          // Another device tried to use the same key/Gmail -> Block & log sharing attempt for Admin
          license.blockedAttempts = (Number(license.blockedAttempts) || 0) + 1;
          license.lastBlockedDevice = (deviceInfo || cleanDeviceId).toString().slice(0, 120);
          license.lastBlockedAt = new Date().toISOString();
          saveLicensesData(data);

          return res.json(signResponse({
            success: false,
            status: "DEVICE_LOCKED",
            key: license.key,
            email: license.email || "",
            name: license.name,
            plan: license.plan || "LIFETIME",
            expiresAt: license.expiresAt || null,
            message: "هذا الحساب/الاشتراك مفعّل ومرتبط بهاتف آخر! لا يمكن فتح نفس الحساب على أكثر من جهاز واحد. يرجى التواصل مع المسؤول في حال تغيير هاتفك.",
            ...commonMeta
          }));
        }
      } else {
        // Multi-device is enabled by Admin for this subscriber
        if (!license.activeDeviceId) {
          license.activeDeviceId = cleanDeviceId;
        }
        if (deviceInfo) {
          license.deviceInfo = deviceInfo.toString().slice(0, 120);
        }
      }

      // Keep deviceInfo updated if not set yet
      if (deviceInfo && !license.deviceInfo) {
        license.deviceInfo = deviceInfo.toString().slice(0, 120);
      }

      // Update lastVerified timestamp
      license.lastVerified = new Date().toISOString();
      saveLicensesData(data);

      return res.json(signResponse({
        success: true,
        status: "ACTIVE",
        key: license.key,
        email: license.email || "",
        name: license.name,
        plan: license.plan || "LIFETIME",
        expiresAt: license.expiresAt || null,
        globalKillSwitch: false,
        ...commonMeta
      }));
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // 1b. Register / Sign-In Subscriber via Google Gmail OAuth
  app.post("/api/license/register-gmail", async (req, res) => {
    try {
      const googleUser = await fetchGoogleUserEmail(req.headers.authorization);
      if (!googleUser || !googleUser.verified) {
        return res.status(401).json({
          success: false,
          message: "تعذر التحقق من حساب Gmail من خوادم Google. يرجى إعادة المحاولة."
        });
      }

      const { deviceId, deviceInfo, displayName, phone } = req.body;
      const cleanDeviceId = (deviceId || "").toString().trim();
      if (!cleanDeviceId) {
        return res.status(400).json({
          success: false,
          message: "تعذر تحديد بصمة الجهاز الفريدة."
        });
      }

      const data = loadLicensesData();
      const commonMeta = {
        isAppFree: data.isAppFree,
        latestRequiredVersion: data.latestRequiredVersion,
        updateUrl: data.updateUrl,
        maintenanceMode: !!data.maintenanceMode,
        maintenanceMessage: data.maintenanceMessage || "",
        maintenanceEta: data.maintenanceEta || "",
        announcementActive: !!data.announcementActive,
        announcementText: data.announcementText || "",
        contactInfo: data.contactInfo || ""
      };

      const userEmail = googleUser.email;
      const userName = (displayName || googleUser.name || userEmail.split("@")[0]).toString().trim();

      // If the signed-in Gmail is the Admin's Gmail (hh9190110@gmail.com), grant immediate Admin + Lifetime Multi-Device access
      if (isAdminEmail(userEmail, data)) {
        return res.json(signResponse({
          success: true,
          status: "ACTIVE",
          key: "ADMIN-MASTER-KEY",
          email: userEmail,
          name: "Engineer Faraj Meftah (المسؤول)",
          plan: "LIFETIME",
          expiresAt: null,
          allowMultipleDevices: true,
          isAdminAccount: true,
          adminAuthPass: data.adminPassword || process.env.ADMIN_PASSWORD || "cementAdmin2026",
          globalKillSwitch: false,
          ...commonMeta
        }));
      }

      let license = data.licenses.find(
        (l: any) => l.email && String(l.email).trim().toLowerCase() === userEmail
      );

      if (!license) {
        // Create new PENDING authorization request for this Gmail
        const rand = () => Math.floor(1000 + Math.random() * 9000);
        let key = `GMAIL-${rand()}-${rand()}`;
        while (data.licenses.some((l: any) => l.key === key)) {
          key = `GMAIL-${rand()}-${rand()}`;
        }

        license = {
          key,
          name: userName,
          email: userEmail,
          status: "PENDING",
          plan: "MONTHLY",
          expiresAt: null,
          phone: (phone || "").toString().trim(),
          createdAt: new Date().toISOString(),
          lastVerified: new Date().toISOString(),
          activeDeviceId: cleanDeviceId,
          deviceInfo: (deviceInfo || "هاتف / متصفح").toString().slice(0, 120),
          deviceBoundAt: new Date().toISOString()
        };

        data.licenses.unshift(license);
        saveLicensesData(data);

        return res.json(signResponse({
          success: false,
          status: "PENDING_APPROVAL",
          key: license.key,
          email: license.email,
          name: license.name,
          plan: license.plan,
          message: "تم تسجيل حساب Gmail الخاص بك بنجاح! طلبك الآن في لوحة تحكم المسؤول بانتظار منحك تصريح الدخول. سيفتح التطبيق تلقائياً فور الموافقة.",
          ...commonMeta
        }));
      }

      // Existing Gmail account found!
      if (userName && (!license.name || license.name === userEmail.split("@")[0])) {
        license.name = userName;
      }

      if (license.status === "PENDING") {
        if (!license.activeDeviceId) {
          license.activeDeviceId = cleanDeviceId;
          license.deviceInfo = (deviceInfo || "هاتف / متصفح").toString().slice(0, 120);
          license.deviceBoundAt = new Date().toISOString();
        }
        license.lastVerified = new Date().toISOString();
        saveLicensesData(data);

        return res.json(signResponse({
          success: false,
          status: "PENDING_APPROVAL",
          key: license.key,
          email: license.email,
          name: license.name,
          plan: license.plan || "MONTHLY",
          message: "طلبك قيد المراجعة حالياً بانتظار منح تصريح الدخول من قِبل المسؤول.",
          ...commonMeta
        }));
      }

      if (license.expiresAt) {
        const expTime = new Date(license.expiresAt).getTime();
        if (!isNaN(expTime) && expTime < Date.now()) {
          return res.json(signResponse({
            success: false,
            status: "EXPIRED",
            key: license.key,
            email: license.email,
            name: license.name,
            plan: license.plan || "MONTHLY",
            expiresAt: license.expiresAt,
            message: "انتهت فترة صلاحية تصريح الدخول الخاص بحساب Gmail هذا. يرجى التواصل مع المسؤول للتجديد.",
            ...commonMeta
          }));
        }
      }

      if (license.status !== "ACTIVE") {
        return res.json(signResponse({
          success: false,
          status: "SUSPENDED",
          key: license.key,
          email: license.email,
          name: license.name,
          plan: license.plan || "LIFETIME",
          expiresAt: license.expiresAt || null,
          message: "تم إيقاف تصريح الدخول لهذا الحساب مؤقتاً من قبل المسؤول!",
          ...commonMeta
        }));
      }

      // Single-device check for Gmail account (unless Admin enabled allowMultipleDevices)
      if (!license.allowMultipleDevices) {
        if (!license.activeDeviceId) {
          license.activeDeviceId = cleanDeviceId;
          license.deviceInfo = (deviceInfo || "هاتف / متصفح معتمد").toString().slice(0, 120);
          license.deviceBoundAt = new Date().toISOString();
        } else if (license.activeDeviceId !== cleanDeviceId) {
          license.blockedAttempts = (Number(license.blockedAttempts) || 0) + 1;
          license.lastBlockedDevice = (deviceInfo || cleanDeviceId).toString().slice(0, 120);
          license.lastBlockedAt = new Date().toISOString();
          saveLicensesData(data);

          return res.json(signResponse({
            success: false,
            status: "DEVICE_LOCKED",
            key: license.key,
            email: license.email,
            name: license.name,
            plan: license.plan || "LIFETIME",
            expiresAt: license.expiresAt || null,
            message: "حساب Gmail هذا مفعّل ومقفل على هاتف آخر! لا يمكن فتح نفس الحساب على أكثر من جهاز واحد.",
            ...commonMeta
          }));
        }
      } else {
        if (!license.activeDeviceId) {
          license.activeDeviceId = cleanDeviceId;
        }
        if (deviceInfo) {
          license.deviceInfo = deviceInfo.toString().slice(0, 120);
        }
      }

      license.lastVerified = new Date().toISOString();
      saveLicensesData(data);

      return res.json(signResponse({
        success: true,
        status: "ACTIVE",
        key: license.key,
        email: license.email,
        name: license.name,
        plan: license.plan || "LIFETIME",
        expiresAt: license.expiresAt || null,
        globalKillSwitch: false,
        ...commonMeta
      }));
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // 2. Admin Check Status
  app.post("/api/license/admin/status", (req, res) => {
    try {
      const { password } = req.body;
      const data = loadLicensesData();

      if (!isPasswordValid(password, data)) {
        return res.json({ success: false, message: "كلمة مرور المسؤول غير صحيحة!" });
      }

      return res.json({
        success: true,
        globalKillSwitch: data.globalKillSwitch,
        globalMessage: data.globalMessage,
        maintenanceMode: !!data.maintenanceMode,
        maintenanceMessage: data.maintenanceMessage || "",
        maintenanceEta: data.maintenanceEta || "",
        announcementActive: !!data.announcementActive,
        announcementText: data.announcementText || "",
        contactInfo: data.contactInfo || "",
        recoveryGmail: data.recoveryGmail || "hh9190110@gmail.com",
        isAppFree: data.isAppFree,
        latestRequiredVersion: data.latestRequiredVersion,
        updateUrl: data.updateUrl,
        licenses: data.licenses,
        appVersions: data.appVersions || []
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // 2b. Admin Direct Login via Official Gmail (hh9190110@gmail.com)
  app.post("/api/license/admin/google-login", async (req, res) => {
    try {
      const googleUser = await fetchGoogleUserEmail(req.headers.authorization);
      if (!googleUser || !googleUser.verified) {
        return res.status(401).json({
          success: false,
          message: "تعذر التحقق من حساب Google."
        });
      }

      const data = loadLicensesData();
      if (!isAdminEmail(googleUser.email, data)) {
        return res.status(403).json({
          success: false,
          message: `عذراً، البريد (${googleUser.email}) ليس حساب المسؤول المعتمد (${data.recoveryGmail || "hh9190110@gmail.com"}).`
        });
      }

      return res.json({
        success: true,
        adminPassword: data.adminPassword || process.env.ADMIN_PASSWORD || "cementAdmin2026",
        verifiedEmail: googleUser.email,
        globalKillSwitch: data.globalKillSwitch,
        globalMessage: data.globalMessage,
        maintenanceMode: !!data.maintenanceMode,
        maintenanceMessage: data.maintenanceMessage || "",
        maintenanceEta: data.maintenanceEta || "",
        announcementActive: !!data.announcementActive,
        announcementText: data.announcementText || "",
        contactInfo: data.contactInfo || "",
        recoveryGmail: data.recoveryGmail || "hh9190110@gmail.com",
        isAppFree: data.isAppFree,
        latestRequiredVersion: data.latestRequiredVersion,
        updateUrl: data.updateUrl,
        licenses: data.licenses,
        appVersions: data.appVersions || []
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // 3. Admin Update Global Settings (Kill Switch, Maintenance Mode, Announcements, Free Mode, Version Updates)
  app.post("/api/license/admin/update-global", (req, res) => {
    try {
      const {
        password,
        globalKillSwitch,
        globalMessage,
        maintenanceMode,
        maintenanceMessage,
        maintenanceEta,
        announcementActive,
        announcementText,
        contactInfo,
        recoveryGmail,
        isAppFree,
        latestRequiredVersion,
        updateUrl
      } = req.body;
      const data = loadLicensesData();

      if (!isPasswordValid(password, data)) {
        return res.json({ success: false, message: "كلمة مرور المسؤول غير صحيحة!" });
      }

      if (globalKillSwitch !== undefined) data.globalKillSwitch = !!globalKillSwitch;
      if (globalMessage !== undefined) data.globalMessage = globalMessage;
      if (maintenanceMode !== undefined) data.maintenanceMode = !!maintenanceMode;
      if (maintenanceMessage !== undefined) data.maintenanceMessage = maintenanceMessage;
      if (maintenanceEta !== undefined) data.maintenanceEta = maintenanceEta;
      if (announcementActive !== undefined) data.announcementActive = !!announcementActive;
      if (announcementText !== undefined) data.announcementText = announcementText;
      if (contactInfo !== undefined) data.contactInfo = contactInfo;
      if (recoveryGmail !== undefined) {
        const cleanEmail = String(recoveryGmail).trim().toLowerCase();
        if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
          return res.json({ success: false, message: "يرجى إدخال بريد Gmail صحيح" });
        }
        data.recoveryGmail = cleanEmail;
      }
      if (isAppFree !== undefined) data.isAppFree = !!isAppFree;
      if (latestRequiredVersion !== undefined) data.latestRequiredVersion = latestRequiredVersion;
      if (updateUrl !== undefined) data.updateUrl = updateUrl;
      
      saveLicensesData(data);
      return res.json({ 
        success: true, 
        globalKillSwitch: data.globalKillSwitch, 
        globalMessage: data.globalMessage,
        maintenanceMode: data.maintenanceMode,
        maintenanceMessage: data.maintenanceMessage,
        maintenanceEta: data.maintenanceEta,
        announcementActive: data.announcementActive,
        announcementText: data.announcementText,
        contactInfo: data.contactInfo,
        recoveryGmail: data.recoveryGmail,
        isAppFree: data.isAppFree,
        latestRequiredVersion: data.latestRequiredVersion,
        updateUrl: data.updateUrl
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // 4. Admin Add License Key or Pre-Authorize Gmail (with Subscription Plan & Expiry)
  app.post("/api/license/admin/add-key", (req, res) => {
    try {
      const {
        password,
        name,
        email = "",
        customKey,
        plan = "MONTHLY",
        customDays,
        phone = "",
        allowMultipleDevices = false
      } = req.body;
      const data = loadLicensesData();

      if (!isPasswordValid(password, data)) {
        return res.json({ success: false, message: "كلمة مرور المسؤول غير صحيحة!" });
      }

      const cleanEmail = (email || "").toString().trim().toLowerCase();
      const cleanName = (name || (cleanEmail ? cleanEmail.split("@")[0] : "")).toString().trim();

      if (!cleanName && !cleanEmail) {
        return res.json({ success: false, message: "يرجى تحديد اسم المشترك أو بريده الإلكتروني (Gmail)" });
      }

      const expiresAt = computeExpiryDate(plan, customDays);

      // If this Gmail already exists (e.g., in PENDING state), upgrade & authorize it directly
      if (cleanEmail) {
        const existingByEmail = data.licenses.find(
          (l: any) => l.email && String(l.email).trim().toLowerCase() === cleanEmail
        );
        if (existingByEmail) {
          existingByEmail.name = cleanName || existingByEmail.name;
          existingByEmail.status = "ACTIVE";
          existingByEmail.plan = plan;
          existingByEmail.expiresAt = expiresAt;
          existingByEmail.allowMultipleDevices = !!allowMultipleDevices;
          if (phone) existingByEmail.phone = phone;
          saveLicensesData(data);
          return res.json({ success: true, license: existingByEmail, updatedExisting: true });
        }
      }

      // Generate a key if not provided
      let key = customKey;
      if (!key) {
        const rand = () => Math.floor(1000 + Math.random() * 9000);
        key = cleanEmail ? `GMAIL-${rand()}-${rand()}` : `CEMENT-${rand()}-${rand()}`;
      }
      key = key.toUpperCase();

      // Check if key already exists
      if (data.licenses.some((l: any) => l.key === key)) {
        return res.json({ success: false, message: "رمز الاشتراك هذا موجود بالفعل!" });
      }

      const newLicense = {
        key,
        name: cleanName,
        email: cleanEmail || undefined,
        status: "ACTIVE",
        plan,
        expiresAt,
        phone,
        allowMultipleDevices: !!allowMultipleDevices,
        createdAt: new Date().toISOString(),
        lastVerified: "",
        activeDeviceId: ""
      };

      data.licenses.unshift(newLicense);
      saveLicensesData(data);

      return res.json({ success: true, license: newLicense });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // 4b. Admin Renew / Extend / Approve Subscription Key
  app.post("/api/license/admin/renew-key", (req, res) => {
    try {
      const { password, key, plan = "MONTHLY", customDays } = req.body;
      const data = loadLicensesData();

      if (!isPasswordValid(password, data)) {
        return res.json({ success: false, message: "كلمة مرور المسؤول غير صحيحة!" });
      }

      const license = data.licenses.find((l: any) => l.key.toUpperCase() === (key || "").toUpperCase());
      if (!license) {
        return res.json({ success: false, message: "رمز الاشتراك غير موجود!" });
      }

      const currentExp = license.expiresAt ? new Date(license.expiresAt) : undefined;
      license.plan = plan;
      license.expiresAt = computeExpiryDate(plan, customDays, currentExp);
      license.status = "ACTIVE";

      saveLicensesData(data);
      return res.json({
        success: true,
        license,
        message: "تم منح التصريح وتفعيل صلاحية الاشتراك بنجاح!"
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // 5. Admin Update Key Status
  app.post("/api/license/admin/update-key-status", (req, res) => {
    try {
      const { password, key, status } = req.body;
      const data = loadLicensesData();

      if (!isPasswordValid(password, data)) {
        return res.json({ success: false, message: "كلمة مرور المسؤول غير صحيحة!" });
      }

      const license = data.licenses.find((l: any) => l.key.toUpperCase() === key.toUpperCase());
      if (!license) {
        return res.json({ success: false, message: "رمز التفعيل غير موجود!" });
      }

      license.status = status;
      saveLicensesData(data);

      return res.json({ success: true, key: license.key, status: license.status });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // 6. Admin Delete Key
  app.post("/api/license/admin/delete-key", (req, res) => {
    try {
      const { password, key } = req.body;
      const data = loadLicensesData();

      if (!isPasswordValid(password, data)) {
        return res.json({ success: false, message: "كلمة مرور المسؤول غير صحيحة!" });
      }

      const index = data.licenses.findIndex((l: any) => l.key.toUpperCase() === key.toUpperCase());
      if (index === -1) {
        return res.json({ success: false, message: "رمز التفعيل غير موجود!" });
      }

      data.licenses.splice(index, 1);
      saveLicensesData(data);

      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // 7. Admin Reset Device Lock
  app.post("/api/license/admin/reset-device", (req, res) => {
    try {
      const { password, key } = req.body;
      const data = loadLicensesData();

      if (!isPasswordValid(password, data)) {
        return res.json({ success: false, message: "كلمة مرور المسؤول غير صحيحة!" });
      }

      const license = data.licenses.find((l: any) => l.key.toUpperCase() === key.toUpperCase());
      if (!license) {
        return res.json({ success: false, message: "رمز التفعيل غير موجود!" });
      }

      license.activeDeviceId = "";
      license.deviceInfo = "";
      license.deviceBoundAt = "";
      license.blockedAttempts = 0;
      license.lastBlockedDevice = "";
      saveLicensesData(data);

      return res.json({ success: true, key: license.key, message: "تم إعادة تعيين قفل الجهاز بنجاح!" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // 7b. Admin Toggle Multi-Device Access for a Subscriber (Gmail / Key)
  app.post("/api/license/admin/toggle-multi-device", (req, res) => {
    try {
      const { password, key, allowMultipleDevices } = req.body;
      const data = loadLicensesData();

      if (!isPasswordValid(password, data)) {
        return res.json({ success: false, message: "كلمة مرور المسؤول غير صحيحة!" });
      }

      const license = data.licenses.find((l: any) => l.key.toUpperCase() === (key || "").toUpperCase());
      if (!license) {
        return res.json({ success: false, message: "الحساب / الاشتراك غير موجود!" });
      }

      license.allowMultipleDevices = !!allowMultipleDevices;
      if (license.allowMultipleDevices) {
        license.blockedAttempts = 0;
        license.lastBlockedDevice = "";
      }
      saveLicensesData(data);

      return res.json({
        success: true,
        key: license.key,
        allowMultipleDevices: license.allowMultipleDevices,
        message: license.allowMultipleDevices
          ? "تم السماح لهذا الحساب بالفتح على أكثر من جهاز!"
          : "تم تقييد هذا الحساب ليفتح على جهاز واحد فقط!"
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // 8. Admin Add App Version
  app.post("/api/license/admin/add-version", (req, res) => {
    try {
      const { password, version, releaseDate, features, downloadUrl } = req.body;
      const data = loadLicensesData();

      if (!isPasswordValid(password, data)) {
        return res.json({ success: false, message: "كلمة مرور المسؤول غير صحيحة!" });
      }

      if (!version) {
        return res.json({ success: false, message: "يرجى تحديد رقم الإصدار" });
      }

      // Check if version already exists
      if (data.appVersions && data.appVersions.some((v: any) => v.version === version)) {
        return res.json({ success: false, message: "هذا الإصدار موجود بالفعل!" });
      }

      const newVer = {
        version,
        releaseDate: releaseDate || new Date().toISOString().split('T')[0],
        features: Array.isArray(features) ? features : (features ? [features] : []),
        downloadUrl: downloadUrl || "/APK_DOWNLOAD/app-debug.apk",
        isActive: false
      };

      if (!data.appVersions) {
        data.appVersions = [];
      }
      data.appVersions.push(newVer);
      saveLicensesData(data);

      return res.json({ success: true, version: newVer });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // 9. Admin Delete App Version
  app.post("/api/license/admin/delete-version", (req, res) => {
    try {
      const { password, version } = req.body;
      const data = loadLicensesData();

      if (!isPasswordValid(password, data)) {
        return res.json({ success: false, message: "كلمة مرور المسؤول غير صحيحة!" });
      }

      if (!data.appVersions) {
        return res.json({ success: false, message: "لا توجد إصدارات مسجلة!" });
      }

      const index = data.appVersions.findIndex((v: any) => v.version === version);
      if (index === -1) {
        return res.json({ success: false, message: "الإصدار المطلوب غير موجود!" });
      }

      data.appVersions.splice(index, 1);
      saveLicensesData(data);

      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // 10. Admin Activate App Version (Transitions to that version)
  app.post("/api/license/admin/activate-version", (req, res) => {
    try {
      const { password, version } = req.body;
      const data = loadLicensesData();

      if (!isPasswordValid(password, data)) {
        return res.json({ success: false, message: "كلمة مرور المسؤول غير صحيحة!" });
      }

      if (!data.appVersions) {
        return res.json({ success: false, message: "لا توجد إصدارات مسجلة!" });
      }

      const targetVer = data.appVersions.find((v: any) => v.version === version);
      if (!targetVer) {
        return res.json({ success: false, message: "الإصدار المطلوب غير موجود لتنشيطه!" });
      }

      // Set all other versions to inactive, set target to active
      data.appVersions.forEach((v: any) => {
        v.isActive = (v.version === version);
      });

      // Automatically sync main config fields with this version
      data.latestRequiredVersion = targetVer.version;
      data.updateUrl = targetVer.downloadUrl;

      saveLicensesData(data);

      return res.json({ 
        success: true, 
        version: targetVer.version, 
        updateUrl: targetVer.downloadUrl,
        appVersions: data.appVersions 
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // 11. Admin Change Password
  app.post("/api/license/admin/change-password", (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const data = loadLicensesData();

      if (!isPasswordValid(oldPassword, data)) {
        return res.json({ success: false, message: "كلمة المرور القديمة غير صحيحة!" });
      }

      if (!newPassword || newPassword.trim().length < 4) {
        return res.json({ success: false, message: "كلمة المرور الجديدة يجب أن تكون 4 أحرف أو أرقام على الأقل" });
      }

      data.adminPassword = newPassword.trim();
      saveLicensesData(data);

      return res.json({ success: true, message: "تم تغيير كلمة مرور المسؤول بنجاح!" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // 12. Admin Password Recovery via Google / Gmail (Step 1: Verify Google Account matches recoveryGmail)
  app.post("/api/license/admin/recovery/verify-google", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const googleUser = await fetchGoogleUserEmail(authHeader);

      if (!googleUser || !googleUser.verified) {
        return res.status(401).json({
          success: false,
          message: "تعذر التحقق من حساب Google. يرجى تسجيل الدخول بحساب Gmail المعتمد."
        });
      }

      const data = loadLicensesData();
      const registeredEmail = (data.recoveryGmail || "").trim().toLowerCase();

      if (!registeredEmail) {
        return res.json({
          success: false,
          message: "لم يتم تعيين بريد Gmail للاسترداد في إعدادات المسؤول."
        });
      }

      if (googleUser.email !== registeredEmail) {
        return res.status(403).json({
          success: false,
          message: `حساب البريد (${googleUser.email}) غير مطابق لبريد الاسترداد المسجل للمسؤول!`
        });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      pendingRecoveryOtps.set(registeredEmail, {
        code,
        email: registeredEmail,
        expiresAt: Date.now() + 10 * 60 * 1000
      });

      return res.json({
        success: true,
        verifiedEmail: googleUser.email,
        message: "تم التحقق من ملكية حساب Gmail بنجاح."
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // 13. Admin Password Recovery via Gmail (Step 2: Send 6-digit OTP using Gmail API after user confirmation)
  app.post("/api/license/admin/recovery/send-otp-email", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const googleUser = await fetchGoogleUserEmail(authHeader);

      if (!googleUser || !googleUser.verified) {
        return res.status(401).json({
          success: false,
          message: "انتهت جلسة Google. يرجى إعادة تسجيل الدخول بحساب Gmail."
        });
      }

      const data = loadLicensesData();
      const registeredEmail = (data.recoveryGmail || "").trim().toLowerCase();

      if (googleUser.email !== registeredEmail) {
        return res.status(403).json({
          success: false,
          message: "هذا الحساب غير مخوّل لاسترداد كلمة مرور المسؤول."
        });
      }

      let entry = pendingRecoveryOtps.get(registeredEmail);
      if (!entry || entry.expiresAt < Date.now()) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        entry = {
          code,
          email: registeredEmail,
          expiresAt: Date.now() + 10 * 60 * 1000
        };
        pendingRecoveryOtps.set(registeredEmail, entry);
      }

      const subject = "=?UTF-8?B?" + Buffer.from("Total Cement Pro - رمز استرداد كلمة مرور المسؤول", "utf8").toString("base64") + "?=";
      const htmlBody = `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
          <h2 style="color: #f59e0b; margin-bottom: 8px;">استرداد كلمة مرور لوحة تحكم المسؤول</h2>
          <p style="color: #cbd5e1; font-size: 14px;">تم طلب رمز تحقق لاستعادة كلمة مرور لوحة التحكم لتطبيق <strong>Total Cement Pro</strong>.</p>
          <div style="background: #1e293b; border: 1px solid #334155; padding: 16px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <span style="display: block; color: #94a3b8; font-size: 12px; margin-bottom: 6px;">رمز التحقق الخاص بك (صالح لمدة 10 دقائق):</span>
            <strong style="font-size: 28px; letter-spacing: 6px; color: #38bdf8; font-family: monospace;">${entry.code}</strong>
          </div>
          <p style="color: #64748b; font-size: 12px;">إذا لم تطلب هذا الرمز يمكنك تجاهل هذه الرسالة بأمان.</p>
        </div>
      `;

      const mimeMessage = [
        `To: ${registeredEmail}`,
        `From: ${registeredEmail}`,
        `Subject: ${subject}`,
        "MIME-Version: 1.0",
        'Content-Type: text/html; charset="UTF-8"',
        "",
        htmlBody
      ].join("\r\n");

      const gmailResp = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          Authorization: authHeader!,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          raw: encodeBase64Url(mimeMessage)
        })
      });

      if (!gmailResp.ok) {
        const errBody = await gmailResp.text();
        console.error("Gmail API send error:", gmailResp.status, errBody);
        return res.status(502).json({
          success: false,
          message: "تعذر إرسال البريد عبر Gmail. تأكد من منح صلاحية إرسال البريد (Gmail Send) عند تسجيل الدخول."
        });
      }

      return res.json({
        success: true,
        message: `تم إرسال رمز التحقق بنجاح إلى ${registeredEmail}`
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // 14. Admin Password Recovery (Step 3: Verify OTP and Set New Password)
  app.post("/api/license/admin/recovery/reset-password", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const { otpCode, newPassword } = req.body;
      const googleUser = await fetchGoogleUserEmail(authHeader);

      if (!googleUser || !googleUser.verified) {
        return res.status(401).json({
          success: false,
          message: "انتهت جلسة التحقق من Google. يرجى المحاولة مجدداً."
        });
      }

      const data = loadLicensesData();
      const registeredEmail = (data.recoveryGmail || "").trim().toLowerCase();

      if (googleUser.email !== registeredEmail) {
        return res.status(403).json({
          success: false,
          message: "حساب البريد غير مطابق لبريد الاسترداد المسجل!"
        });
      }

      const entry = pendingRecoveryOtps.get(registeredEmail);
      if (!entry || entry.expiresAt < Date.now()) {
        return res.json({
          success: false,
          message: "انتهت صلاحية رمز التحقق. يرجى طلب إرسال رمز جديد."
        });
      }

      if ((otpCode || "").toString().trim() !== entry.code) {
        return res.json({
          success: false,
          message: "رمز التحقق المكون من 6 أرقام غير صحيح!"
        });
      }

      if (!newPassword || newPassword.trim().length < 4) {
        return res.json({
          success: false,
          message: "كلمة المرور الجديدة يجب أن تكون 4 أحرف أو أرقام على الأقل"
        });
      }

      data.adminPassword = newPassword.trim();
      saveLicensesData(data);
      pendingRecoveryOtps.delete(registeredEmail);

      return res.json({
        success: true,
        message: "تم تعيين كلمة مرور المسؤول الجديدة بنجاح! يمكنك الآن تسجيل الدخول."
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // 15. Direct Gmail Registration / Login (No Paid Cloud API required)
  app.post("/api/license/register-gmail-direct", (req, res) => {
    try {
      const { email, name, phone, deviceId, deviceInfo } = req.body;
      const cleanEmail = (email || "").toString().trim().toLowerCase();
      const cleanDeviceId = (deviceId || "").toString().trim();

      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.json({
          success: false,
          message: "يرجى إدخال عنوان بريد Gmail صحيح (مثال: name@gmail.com)"
        });
      }

      if (!cleanDeviceId) {
        return res.json({
          success: false,
          message: "تعذر تحديد بصمة الجهاز الفريدة."
        });
      }

      const data = loadLicensesData();
      const commonMeta = {
        isAppFree: data.isAppFree,
        latestRequiredVersion: data.latestRequiredVersion,
        updateUrl: data.updateUrl,
        maintenanceMode: !!data.maintenanceMode,
        maintenanceMessage: data.maintenanceMessage || "",
        maintenanceEta: data.maintenanceEta || "",
        announcementActive: !!data.announcementActive,
        announcementText: data.announcementText || "",
        contactInfo: data.contactInfo || ""
      };

      // If this is the Admin's official Gmail (hh9190110@gmail.com), grant full lifetime multi-device access
      if (isAdminEmail(cleanEmail, data)) {
        return res.json(signResponse({
          success: true,
          status: "ACTIVE",
          key: "ADMIN-MASTER-KEY",
          email: cleanEmail,
          name: "Engineer Faraj Meftah (المسؤول)",
          plan: "LIFETIME",
          expiresAt: null,
          allowMultipleDevices: true,
          isAdminAccount: true,
          globalKillSwitch: false,
          ...commonMeta
        }));
      }

      const userName = (name || cleanEmail.split("@")[0]).toString().trim();

      let license = data.licenses.find(
        (l: any) => l.email && String(l.email).trim().toLowerCase() === cleanEmail
      );

      if (!license) {
        const rand = () => Math.floor(1000 + Math.random() * 9000);
        let key = `GMAIL-${rand()}-${rand()}`;
        while (data.licenses.some((l: any) => l.key === key)) {
          key = `GMAIL-${rand()}-${rand()}`;
        }

        license = {
          key,
          name: userName,
          email: cleanEmail,
          status: "PENDING",
          plan: "MONTHLY",
          expiresAt: null,
          phone: (phone || "").toString().trim(),
          allowMultipleDevices: false,
          createdAt: new Date().toISOString(),
          lastVerified: new Date().toISOString(),
          activeDeviceId: cleanDeviceId,
          deviceInfo: (deviceInfo || "هاتف / متصفح").toString().slice(0, 120),
          deviceBoundAt: new Date().toISOString()
        };

        data.licenses.unshift(license);
        saveLicensesData(data);

        return res.json(signResponse({
          success: false,
          status: "PENDING_APPROVAL",
          key: license.key,
          email: license.email,
          name: license.name,
          plan: license.plan,
          message: "تم إرسال طلبك بنجاح! حساب Gmail الخاص بك بانتظار منحك تصريح الدخول من قِبل المسؤول (Engineer Faraj Meftah).",
          ...commonMeta
        }));
      }

      if (name && name.trim()) {
        license.name = name.trim();
      }

      if (license.status === "PENDING") {
        if (!license.activeDeviceId) {
          license.activeDeviceId = cleanDeviceId;
          license.deviceInfo = (deviceInfo || "هاتف / متصفح").toString().slice(0, 120);
          license.deviceBoundAt = new Date().toISOString();
        }
        license.lastVerified = new Date().toISOString();
        saveLicensesData(data);

        return res.json(signResponse({
          success: false,
          status: "PENDING_APPROVAL",
          key: license.key,
          email: license.email,
          name: license.name,
          plan: license.plan || "MONTHLY",
          message: "طلبك قيد المراجعة حالياً بانتظار منح تصريح الدخول من قِبل المسؤول.",
          ...commonMeta
        }));
      }

      if (license.expiresAt) {
        const expTime = new Date(license.expiresAt).getTime();
        if (!isNaN(expTime) && expTime < Date.now()) {
          return res.json(signResponse({
            success: false,
            status: "EXPIRED",
            key: license.key,
            email: license.email,
            name: license.name,
            plan: license.plan || "MONTHLY",
            expiresAt: license.expiresAt,
            message: "انتهت فترة صلاحية تصريح الدخول الخاص بحساب Gmail هذا. يرجى التواصل مع المسؤول للتجديد.",
            ...commonMeta
          }));
        }
      }

      if (license.status !== "ACTIVE") {
        return res.json(signResponse({
          success: false,
          status: "SUSPENDED",
          key: license.key,
          email: license.email,
          name: license.name,
          plan: license.plan || "LIFETIME",
          expiresAt: license.expiresAt || null,
          message: "تم إيقاف تصريح الدخول لهذا الحساب مؤقتاً من قبل المسؤول!",
          ...commonMeta
        }));
      }

      if (!license.allowMultipleDevices) {
        if (!license.activeDeviceId) {
          license.activeDeviceId = cleanDeviceId;
          license.deviceInfo = (deviceInfo || "هاتف / متصفح معتمد").toString().slice(0, 120);
          license.deviceBoundAt = new Date().toISOString();
        } else if (license.activeDeviceId !== cleanDeviceId) {
          license.blockedAttempts = (Number(license.blockedAttempts) || 0) + 1;
          license.lastBlockedDevice = (deviceInfo || cleanDeviceId).toString().slice(0, 120);
          license.lastBlockedAt = new Date().toISOString();
          saveLicensesData(data);

          return res.json(signResponse({
            success: false,
            status: "DEVICE_LOCKED",
            key: license.key,
            email: license.email,
            name: license.name,
            plan: license.plan || "LIFETIME",
            expiresAt: license.expiresAt || null,
            message: "حساب Gmail هذا مفعّل ومقفل على هاتف آخر! لا يمكن فتح نفس الحساب على أكثر من جهاز واحد.",
            ...commonMeta
          }));
        }
      } else {
        if (!license.activeDeviceId) {
          license.activeDeviceId = cleanDeviceId;
        }
        if (deviceInfo) {
          license.deviceInfo = deviceInfo.toString().slice(0, 120);
        }
      }

      license.lastVerified = new Date().toISOString();
      saveLicensesData(data);

      return res.json(signResponse({
        success: true,
        status: "ACTIVE",
        key: license.key,
        email: license.email,
        name: license.name,
        plan: license.plan || "LIFETIME",
        expiresAt: license.expiresAt || null,
        globalKillSwitch: false,
        ...commonMeta
      }));
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/analyze-reports", async (req, res) => {
    try {
      const { zipSummary } = req.body;
      res.json({
        summary: zipSummary ? String(zipSummary).slice(0, 500) : "تقرير الحفر المجمع",
        generatedAt: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/extract-drilling-data", async (_req, res) => {
    try {
      res.json({
        wellName: "Well-1",
        date: new Date().toISOString().split("T")[0],
        depth: 0,
        mudWeight: 0
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
