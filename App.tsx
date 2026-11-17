
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft,
  Droplet,
  ArrowRightLeft,
  Activity,
  Zap,
  Layers,
  Gauge,
  Box,
  History as HistoryIcon,
  BookOpen,
  Anchor,
  Wind,
  ShieldAlert,
  ShieldCheck,
  Thermometer,
  Calculator as CalcIcon,
  RotateCw,
  Clock,
  TrendingUp,
  FileText,
  FileCheck,
  Scan,
  Target,
  Settings,
  CheckCircle2,
  Sparkles,
  Code2,
  Eye,
  EyeOff,
  Table
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AnnularVolumeCalc from './pages/AnnularVolumeCalc';
import RatHoleCalc from './pages/RatHoleCalc';
import ShoeTrackCalc from './pages/ShoeTrackCalc';
import DisplacementCalc from './pages/DisplacementCalc';
import WellVolumeCalc from './pages/WellVolumeCalc';
import CasingCapacityTable from './pages/CasingCapacityTable';
import PumpOutputCalc from './pages/PumpOutputCalc';
import PumpOutputCalc2 from './pages/PumpOutputCalc2';
import PumpMasterPro from './pages/PumpMasterPro';
import GPMCalc from './pages/GPMCalc';
import SPMCalc from './pages/SPMCalc';
import CementingMaster from './pages/CementingMaster';
import HydrostaticCalc from './pages/HydrostaticCalc';
import ECDCalc from './pages/ECDCalc';
import LeakOffTestCalc from './pages/LeakOffTestCalc';
import DrillStringStrokes from './pages/DrillStringStrokes';
import ROPCalc from './pages/ROPCalc';
import FinalReportCalc from './pages/FinalReportCalc';
import DrillingReportPro from './pages/DrillingReportPro';
import FITCalc from './pages/FITCalc';
import AIScannerCalc from './pages/AIScannerCalc';
import SpotCalc from './pages/SpotCalc';
import HistoryView from './pages/HistoryView';
import LearningCenter from './pages/LearningCenter';
import { CalcType, CalculationRecord } from './types';
import { LicenseGuard, useLicense, PLAN_LABELS, getRemainingDaysInfo } from './components/LicenseGuard';
import MathFormula, { FormulaStyleProvider, useFormulaStyle } from './components/MathFormula';

interface CalcItemMeta {
  id: CalcType;
  name: string;
  en: string;
  icon: React.ReactNode;
  groupTitle: string;
  featured?: boolean;
}

interface AppSettingsViewProps {
  allCalculators: CalcItemMeta[];
  hiddenCalcs: CalcType[];
  onToggleCalc: (id: CalcType) => void;
  onSetHiddenCalcs: (ids: CalcType[]) => void;
}

const FOUR_SUB_CEMENT_CALCS: CalcType[] = [
  CalcType.ANNULAR_VOLUME,
  CalcType.DISPLACEMENT,
  CalcType.RAT_HOLE,
  CalcType.SHOE_TRACK,
];

const AppSettingsView: React.FC<AppSettingsViewProps> = ({
  allCalculators,
  hiddenCalcs,
  onToggleCalc,
  onSetHiddenCalcs,
}) => {
  const { style, setStyle } = useFormulaStyle();
  const { licenseKey, licenseName, plan, expiresAt, isAppFree, logoutLicense } = useLicense();
  const expInfo = getRemainingDaysInfo(expiresAt);
  const planInfo = PLAN_LABELS[plan || 'LIFETIME'] || PLAN_LABELS.LIFETIME;

  const areFourSubCalcsHidden = FOUR_SUB_CEMENT_CALCS.every((id) => hiddenCalcs.includes(id));

  const toggleFourSubCalcs = () => {
    if (areFourSubCalcsHidden) {
      onSetHiddenCalcs(hiddenCalcs.filter((id) => !FOUR_SUB_CEMENT_CALCS.includes(id)));
    } else {
      const merged = Array.from(new Set([...hiddenCalcs, ...FOUR_SUB_CEMENT_CALCS]));
      onSetHiddenCalcs(merged);
    }
  };

  const groups = Array.from(new Set(allCalculators.map((c) => c.groupTitle)));

  return (
    <div className="space-y-6 text-right pb-16 animate-in fade-in duration-500">
      <div className="text-center">
        <div className="w-14 h-14 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3 text-blue-400 shadow-lg shadow-blue-500/10">
          <Settings className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">إعدادات التطبيق</h1>
        <p className="text-blue-400 uppercase text-[10px] tracking-[0.25em] font-bold">Application Settings</p>
      </div>

      {/* User Subscription Status Card (User-facing only, no admin controls) */}
      <div className="bg-[#1e293b]/50 backdrop-blur-md p-5 rounded-[2rem] border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${expInfo.colorClass}`}>
            {isAppFree ? 'نسخة مجانية مفتوحة' : expInfo.label}
          </span>
          <div className="text-right">
            <h2 className="text-sm sm:text-base font-black text-white">حالة اشتراكك الحالي</h2>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              تفاصيل باقة التفعيل الخاصة بجهازك
            </p>
          </div>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/90 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start order-2 sm:order-1">
            {licenseKey && (
              <button
                type="button"
                onClick={logoutLicense}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-black transition-all"
              >
                تسجيل خروج الكود
              </button>
            )}
            <span className={`text-[10px] px-2.5 py-1 rounded-xl font-black border ${planInfo.badge}`}>
              الباقة: {planInfo.ar}
            </span>
          </div>

          <div className="text-right order-1 sm:order-2 w-full sm:w-auto">
            <p className="text-xs text-slate-400">
              المشترك: <strong className="text-white font-black">{licenseName || 'مهندس معتمد'}</strong>
            </p>
            {licenseKey && (
              <p className="text-[11px] font-mono text-blue-400 mt-0.5" dir="ltr">
                {licenseKey}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Formula Display Style Selector Card */}
      <div className="bg-[#1e293b]/50 backdrop-blur-md p-6 rounded-[2rem] border border-slate-800 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 uppercase">
            {style === 'modern' ? 'الوضع الحالي: جامعي' : 'الوضع الحالي: برمجي'}
          </span>
          <div className="text-right">
            <h2 className="text-base font-black text-white">طريقة كتابة وعرض المعادلات</h2>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              اختر شكل عرض القوانين والتعويض في جميع حاسبات التطبيق
            </p>
          </div>
        </div>

        {/* Two Selection Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Option 1: Modern (University) */}
          <button
            type="button"
            onClick={() => setStyle('modern')}
            className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-3 relative overflow-hidden ${
              style === 'modern'
                ? 'bg-gradient-to-br from-blue-600/25 to-indigo-600/20 border-blue-500 shadow-xl shadow-blue-500/15'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <CheckCircle2
                className={`w-5 h-5 transition-colors ${
                  style === 'modern' ? 'text-blue-400' : 'text-slate-700'
                }`}
              />
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">الشكل الحديث (جامعي)</span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              عرض القوانين بالصيغة الرياضية الجامعية والكتب الهندسية (كسور اعتيادية، أسس علوية ²، ورموز ضرب ×).
            </p>
          </button>

          {/* Option 2: Classic (Code) */}
          <button
            type="button"
            onClick={() => setStyle('classic')}
            className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-3 relative overflow-hidden ${
              style === 'classic'
                ? 'bg-gradient-to-br from-amber-600/25 to-orange-600/15 border-amber-500 shadow-xl shadow-amber-500/15'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <CheckCircle2
                className={`w-5 h-5 transition-colors ${
                  style === 'classic' ? 'text-amber-400' : 'text-slate-700'
                }`}
              />
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">&lt;/&gt; الشكل القديم (برمجي)</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Code2 className="w-4 h-4" />
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              عرض القوانين بالطريقة البرمجية السطرية السابقة كما كانت في النسخة القديمة (باستخدام ^2 و / و *).
            </p>
          </button>
        </div>

        {/* Live Preview Section */}
        <div className="pt-3 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider" dir="ltr">
              Live Preview
            </span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-xs font-black">معاينة حية لشكل المعادلات</span>
              <Eye className="w-4 h-4 text-blue-400" />
            </div>
          </div>

          <div className="bg-[#0a0f1e] p-5 rounded-3xl border border-slate-800 space-y-4 shadow-inner">
            <div>
              <span className="block text-xs text-white font-bold mb-2 tracking-wide text-left" dir="ltr">
                Formula <span className="text-slate-500 text-[10px]">(القانون)</span>
              </span>
              <MathFormula
                math="V = \frac{(Hole^2 - OD^2)}{1029.4} \times L \times Exc"
                classic="((Hole^2 - OD^2) / 1029.4) * L * Exc"
                className="text-white text-base sm:text-lg py-1"
              />
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <span className="block text-xs text-white font-bold mb-2 tracking-wide text-left" dir="ltr">
                Substitution <span className="text-slate-500 text-[10px]">(التعويض)</span>
              </span>
              <MathFormula
                math="V = \frac{(24^2 - 18.625^2)}{1029.4} \times 250 \times 2"
                classic="((24^2 - 18.625^2) / 1029.4) * 250 * 2"
                className="text-blue-300 text-base sm:text-lg py-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Show / Hide Calculators Card */}
      <div className="bg-[#1e293b]/50 backdrop-blur-md p-6 rounded-[2rem] border border-slate-800 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            ظاهر: {allCalculators.length - hiddenCalcs.length} من {allCalculators.length}
          </span>
          <div className="text-right">
            <h2 className="text-base font-black text-white">إظهار وإخفاء الحاسبات</h2>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              تحكم في الحاسبات التي تظهر في الواجهة الرئيسية للتطبيق
            </p>
          </div>
        </div>

        {/* Quick Preset Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          {hiddenCalcs.length > 0 && (
            <button
              type="button"
              onClick={() => onSetHiddenCalcs([])}
              className="px-3.5 py-2 rounded-xl text-[11px] font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>إظهار جميع الحاسبات</span>
            </button>
          )}
          <button
            type="button"
            onClick={toggleFourSubCalcs}
            className={`px-3.5 py-2 rounded-xl text-[11px] font-black border transition-all flex items-center gap-1.5 ${
              areFourSubCalcsHidden
                ? 'bg-blue-500/15 text-blue-300 border-blue-500/30 hover:bg-blue-500/25'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
            }`}
          >
            {areFourSubCalcsHidden ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>إظهار الحاسبات الـ 4 الفرعية للسيمنت</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>إخفاء الحاسبات الـ 4 الفرعية (الفراغ الحلقي، الإزاحة، Rat Hole، Shoe Track)</span>
              </>
            )}
          </button>
        </div>

        {/* Grouped Calculator Toggles */}
        <div className="space-y-5">
          {groups.map((groupTitle) => {
            const items = allCalculators.filter((c) => c.groupTitle === groupTitle);
            return (
              <div key={groupTitle} className="space-y-2.5">
                <h3 className="text-[11px] font-black text-slate-400 px-1 border-r-2 border-blue-500 pr-2">
                  {groupTitle}
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {items.map((item) => {
                    const isVisible = !hiddenCalcs.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onToggleCalc(item.id)}
                        className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                          isVisible
                            ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                            : 'bg-slate-950/40 border-slate-900 opacity-60 hover:opacity-85'
                        }`}
                      >
                        {/* Toggle Switch on Left */}
                        <div className="flex items-center gap-2">
                          <div
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 border transition-all ${
                              isVisible
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {isVisible ? (
                              <>
                                <Eye className="w-3 h-3" />
                                <span>ظاهر</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>مخفي</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Calculator Name & Icon on Right */}
                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <span
                              className={`block text-xs sm:text-sm font-black ${
                                isVisible ? 'text-white' : 'text-slate-500 line-through'
                              }`}
                            >
                              {item.name}
                            </span>
                            <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                              {item.en}
                            </span>
                          </div>
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              isVisible
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-slate-900 text-slate-600 border border-slate-800'
                            }`}
                          >
                            {item.icon}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CalcType | 'MAIN' | 'HISTORY' | 'SETTINGS'>('MAIN');
  const [history, setHistory] = useState<CalculationRecord[]>([]);
  const [restoredRecord, setRestoredRecord] = useState<CalculationRecord | null>(null);
  const [hiddenCalcs, setHiddenCalcs] = useState<CalcType[]>(() => {
    try {
      const saved = localStorage.getItem('total_cement_hidden_calcs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showDeveloper, setShowDeveloper] = useState(false);
  const [activeDevIndex, setActiveDevIndex] = useState(0);
  const developers = ["Engineer Gebril Salh Alhamoudi", "Engineer Faraj Meftah"];
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('total_cement_hidden_calcs', JSON.stringify(hiddenCalcs));
    } catch (e) {
      console.error("Failed to save hidden calculators", e);
    }
  }, [hiddenCalcs]);

  const toggleCalcVisibility = (id: CalcType) => {
    setHiddenCalcs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showDeveloper) {
      interval = setInterval(() => {
        setActiveDevIndex(prev => (prev + 1) % developers.length);
      }, 2000);
      const timeout = setTimeout(() => {
        setShowDeveloper(false);
      }, 600000); // 10 minutes
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [showDeveloper]);

  const handlePointerDown = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 400) {
      // Second tap - start long press timer
      longPressTimerRef.current = setTimeout(() => {
        setShowDeveloper(prev => !prev);
      }, 600); // 600ms for long press
    }
    lastTapRef.current = now;
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('total_cement_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('total_cement_history', JSON.stringify(history));
  }, [history]);

  const saveToHistory = (record: CalculationRecord) => {
    setHistory(prev => [record, ...prev].slice(0, 50));
  };

  const handleRestore = (record: CalculationRecord) => {
    setRestoredRecord(record);
    setActiveTab(record.type);
  };

  const handleTabChange = (tab: CalcType | 'MAIN' | 'HISTORY' | 'SETTINGS') => {
    if (tab !== 'HISTORY' && tab !== 'SETTINGS' && activeTab === 'MAIN') {
      setRestoredRecord(null);
    }
    setActiveTab(tab);
  };

  const cementGroup = [
    { id: CalcType.TOTAL_CEMENT, name: 'منصة السيمنت الاحترافية', icon: <Box className="w-5 h-5" />, en: 'Cementing Master Pro', featured: true },
    { id: CalcType.WELL_VOLUME, name: 'حساب حجم البئر الكلي (مع الرسم)', icon: <Layers className="w-5 h-5" />, en: 'Wellbore Volume & Schematic', highlight: true },
    { id: CalcType.CASING_CAPACITY_TABLE, name: 'جدول سعة وأنواع الكيسينق (Capacity)', icon: <Table className="w-5 h-5" />, en: 'Casing Capacity Table (High to Low)', highlight: true },
    { id: CalcType.ANNULAR_VOLUME, name: 'حساب الفراغ الحلقي', icon: <Droplet className="w-5 h-5" />, en: 'Annular Volume' },
    { id: CalcType.DISPLACEMENT, name: 'حساب الإزاحة', icon: <ArrowRightLeft className="w-5 h-5" />, en: 'Displacement' },
    { id: CalcType.RAT_HOLE, name: 'حساب Rat Hole', icon: <Target className="w-5 h-5" />, en: 'Rat Hole' },
    { id: CalcType.SHOE_TRACK, name: 'حساب Shoe Track', icon: <Anchor className="w-5 h-5" />, en: 'Shoe Track' },
  ];

  const pressureGroup = [
    { id: CalcType.HYDROSTATIC, name: 'الضغط الهيدروستاتيكي', icon: <Thermometer className="w-5 h-5" />, en: 'Hydrostatic Pressure' },
    { id: CalcType.ECD, name: 'الكثافة الدورانية (ECD)', icon: <Wind className="w-5 h-5" />, en: 'Equiv. Circ. Density' },
    { id: CalcType.FIT, name: 'اختبار التكامل (FIT)', icon: <ShieldCheck className="w-5 h-5" />, en: 'Formation Integrity' },
    { id: CalcType.LOT, name: 'اختبار التسرب (LOT)', icon: <ShieldAlert className="w-5 h-5" />, en: 'Leak Off Test' },
  ];

  const pumpGroup = [
    { id: CalcType.PUMP_MASTER, name: 'حاسبة المضخة المتقدمة', icon: <Gauge className="w-5 h-5" />, en: 'Pump Master Pro', smart: true },
    { id: CalcType.DRILL_STRING_STROKES, name: 'ضربات سلسلة الحفر', icon: <RotateCw className="w-5 h-5" />, en: 'Drill String Strokes', special: true },
    { id: CalcType.PUMP_OUTPUT_1, name: 'بامب اوت (الطريقة 1)', icon: <Activity className="w-5 h-5" />, en: 'Pump Output (0.000243)' },
    { id: CalcType.PUMP_OUTPUT_2, name: 'بامب اوت (الطريقة 2)', icon: <Activity className="w-5 h-5" />, en: 'Pump Output (4115.2)' },
    { id: CalcType.GPM, name: 'حساب معدل التدفق (GPM)', icon: <Activity className="w-5 h-5" />, en: 'Flow Rate' },
    { id: CalcType.SPM, name: 'حساب سرعة المضخة (SPM)', icon: <Zap className="w-5 h-5" />, en: 'Required SPM' },
  ];

  const reportGroup = [
    { id: CalcType.DRILLING_REPORT_PRO, name: 'إدارة وتعديل التقارير (AI)', icon: <FileCheck className="w-5 h-5" />, en: 'Drilling & Final Reports Pro', special: true },
    { id: CalcType.ROP, name: 'معدل الاختراق (ROP)', icon: <TrendingUp className="w-5 h-5" />, en: 'Rate of Penetration', special: true },
    { id: CalcType.FINAL_REPORT, name: 'فاينل ريبورت (Subsea)', icon: <FileText className="w-5 h-5" />, en: 'Subsea Final Calc', special: true },
  ];

  const aiGroup = [
    { id: CalcType.AI_SCANNER, name: 'رجوع الكتينق الي السطح عن طريق Tali dril string Ai', icon: <Scan className="w-5 h-5" />, en: 'Bottoms Up via AI Tally', ai: true },
    { id: CalcType.SPOT, name: 'وضع سائل (Spot Pill) بدقة AI', icon: <Target className="w-5 h-5 text-amber-400" />, en: 'AI Fluid Spotting', ai: true },
  ];

  const allCalculators: CalcItemMeta[] = [
    ...cementGroup.map((c) => ({ ...c, groupTitle: 'إجمالي السيمنت وحجم البئر (Cement & Well Volume)' })),
    ...aiGroup.map((c) => ({ ...c, groupTitle: 'محرك الذكاء الاصطناعي (AI Engine)' })),
    ...reportGroup.map((c) => ({ ...c, groupTitle: 'تقارير الحفر (Drilling Reports)' })),
    ...pumpGroup.map((c) => ({ ...c, groupTitle: 'حسابات المضخة (Pump Calculators)' })),
    ...pressureGroup.map((c) => ({ ...c, groupTitle: 'الضغوط والبارامترات (Pressures & Parameters)' })),
  ];

  const visibleCementSub = cementGroup.filter((i) => !i.featured && !hiddenCalcs.includes(i.id));
  const isTotalCementVisible = !hiddenCalcs.includes(CalcType.TOTAL_CEMENT);
  const visibleAiGroup = aiGroup.filter((i) => !hiddenCalcs.includes(i.id));
  const visibleReportGroup = reportGroup.filter((i) => !hiddenCalcs.includes(i.id));
  const visiblePumpGroup = pumpGroup.filter((i) => !hiddenCalcs.includes(i.id));
  const visiblePressureGroup = pressureGroup.filter((i) => !hiddenCalcs.includes(i.id));

  if (activeTab === 'MAIN') {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white p-6 pb-20 font-tajawal overflow-x-hidden">
        <header className="flex justify-between items-center mb-10 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <button onClick={() => handleTabChange('HISTORY')} title="السجل" className="p-3 bg-slate-800/40 rounded-2xl hover:bg-slate-700 transition-all border border-slate-700/50 group">
              <HistoryIcon className="w-6 h-6 text-slate-400 group-hover:text-blue-400" />
            </button>
            <button onClick={() => handleTabChange('SETTINGS')} title="الإعدادات" className="p-3 bg-slate-800/40 rounded-2xl hover:bg-slate-700 transition-all border border-slate-700/50 group relative">
              <Settings className="w-6 h-6 text-slate-400 group-hover:text-blue-400 group-hover:rotate-45 transition-transform" />
              {hiddenCalcs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-[9px] font-black text-white flex items-center justify-center">
                  {hiddenCalcs.length}
                </span>
              )}
            </button>
          </div>
          <div className="text-center relative">
            <h1 
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              className="text-2xl font-black tracking-tight text-white uppercase italic cursor-pointer select-none"
            >
              Total Cement
            </h1>
            <p className="text-[9px] text-blue-500 font-bold uppercase tracking-[0.3em] mt-1">Engineer Professional Suite</p>
            <AnimatePresence mode="wait">
              {showDeveloper && (
                <motion.div 
                  key={activeDevIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  className="bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl overflow-hidden mt-2"
                >
                  <span className="text-[10px] font-black text-blue-400 italic">
                    Developer: {developers[activeDevIndex]}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={() => handleTabChange(CalcType.LEARNING)} title="مركز التعلم" className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 group">
            <BookOpen className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
          </button>
        </header>

        <div className="max-w-lg mx-auto space-y-10 animate-in fade-in duration-500">
          
          {(isTotalCementVisible || visibleCementSub.length > 0) && (
            <section className="space-y-4">
              <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-2 flex items-center gap-2">إجمالي السيمنت <Box className="w-3 h-3" /></h2>
              {isTotalCementVisible && (
                <button 
                  onClick={() => handleTabChange(CalcType.TOTAL_CEMENT)}
                  className="w-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 rounded-[2.5rem] shadow-2xl flex items-center justify-between group overflow-hidden relative border border-blue-400/20"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform"></div>
                  <div className="text-right z-10">
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-[8px] font-black uppercase tracking-widest text-white mb-2">Primary Tool</span>
                    <h3 className="text-2xl font-black text-white italic">منصة السيمنت الاحترافية</h3>
                    <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider">Cementing Master Professional</p>
                  </div>
                  <div className="bg-white/20 p-5 rounded-3xl backdrop-blur-xl z-10 border border-white/10 group-hover:rotate-12 transition-all">
                    <Box className="w-8 h-8 text-white" />
                  </div>
                </button>
              )}
              {visibleCementSub.length > 0 && (
                <div className="grid grid-cols-1 gap-3">
                  {visibleCementSub.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`backdrop-blur-md p-4 rounded-2xl flex items-center justify-between transition-all group border ${
                        (item as any).highlight
                          ? 'bg-gradient-to-r from-cyan-500/15 to-blue-600/15 border-cyan-500/30 hover:border-cyan-400/60 shadow-lg shadow-cyan-500/5'
                          : 'bg-[#1e293b]/40 border-slate-800 hover:bg-[#1e293b]/80'
                      }`}
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-400" />
                      <div className="text-right flex-1 pr-4">
                        <div className="flex items-center justify-end gap-2">
                          {(item as any).highlight && (
                            <span className="bg-cyan-500 text-[7px] text-slate-950 px-1.5 py-0.5 rounded-full font-black uppercase">
                              NEW • SCHEMATIC
                            </span>
                          )}
                          <span className="block font-bold text-md text-slate-100">{item.name}</span>
                        </div>
                        <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.en}</span>
                      </div>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        (item as any).highlight ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {item.icon}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {visibleAiGroup.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-2 flex items-center gap-2">محرك الذكاء الاصطناعي <Zap className="w-3 h-3" /></h2>
              <div className="grid grid-cols-1 gap-3">
                {visibleAiGroup.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-md p-5 rounded-2xl flex items-center justify-between transition-all group border border-indigo-500/30 hover:shadow-indigo-500/10 hover:shadow-xl"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-indigo-400" />
                    <div className="text-right flex-1 pr-4">
                      <div className="flex items-center justify-end gap-2">
                         <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-[7px] text-white px-1.5 py-0.5 rounded-full font-black uppercase flex items-center gap-1">
                           <Zap className="w-2 h-2 fill-white" /> AI POWERED
                         </span>
                         <span className="block font-bold text-lg text-slate-100">{item.name}</span>
                      </div>
                      <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.en}</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                      {item.icon}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {visibleReportGroup.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-[10px] font-black text-purple-400 uppercase tracking-widest px-2 flex items-center gap-2">تقارير الحفر <Clock className="w-3 h-3" /></h2>
              <div className="grid grid-cols-1 gap-3">
                {visibleReportGroup.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className="bg-purple-500/10 backdrop-blur-md p-5 rounded-2xl flex items-center justify-between transition-all group border border-purple-500/30 hover:bg-purple-500/20"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-purple-400" />
                    <div className="text-right flex-1 pr-4">
                      <div className="flex items-center justify-end gap-2">
                         <span className="bg-purple-500 text-[7px] text-white px-1.5 py-0.5 rounded-full font-black uppercase">DRILLING</span>
                         <span className="block font-bold text-lg text-slate-100">{item.name}</span>
                      </div>
                      <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.en}</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-purple-400 bg-purple-500/10">
                      {item.icon}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {visiblePumpGroup.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-2 flex items-center gap-2">حسابات المضخة <Activity className="w-3 h-3" /></h2>
              <div className="grid grid-cols-1 gap-3">
                {visiblePumpGroup.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`backdrop-blur-md p-5 rounded-2xl flex items-center justify-between transition-all group border ${item.smart ? 'bg-emerald-500/10 border-emerald-500/30' : (item as any).special ? 'bg-purple-500/10 border-purple-500/30' : 'bg-[#1e293b]/40 border-slate-800 hover:bg-[#1e293b]/80'}`}
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-emerald-400" />
                    <div className="text-right flex-1 pr-4">
                      <div className="flex items-center justify-end gap-2">
                         {item.smart && <span className="bg-emerald-500 text-[7px] text-white px-1.5 py-0.5 rounded-full font-black uppercase">ADVANCED</span>}
                         {(item as any).special && <span className="bg-purple-500 text-[7px] text-white px-1.5 py-0.5 rounded-full font-black uppercase">NEW</span>}
                         <span className={`block font-bold ${item.smart || (item as any).special ? 'text-lg text-slate-100' : 'text-md text-slate-100'}`}>{item.name}</span>
                      </div>
                      <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.en}</span>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${(item as any).special ? 'text-purple-400 bg-purple-500/10' : 'text-emerald-500 bg-emerald-500/10'} ${item.smart ? 'bg-emerald-500/20 shadow-lg' : ''}`}>
                      {item.icon}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {visiblePressureGroup.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-2 flex items-center gap-2">الضغوط والبارامترات <Wind className="w-3 h-3" /></h2>
              <div className="grid grid-cols-1 gap-3">
                {visiblePressureGroup.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className="bg-[#1e293b]/40 backdrop-blur-md p-4 rounded-2xl flex items-center justify-between hover:bg-[#1e293b]/80 transition-all group border border-slate-800"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-amber-500" />
                    <div className="text-right flex-1 pr-4">
                      <span className="block font-bold text-md text-slate-100">{item.name}</span>
                      <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.en}</span>
                    </div>
                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                      {item.icon}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 pb-20 font-tajawal">
      <header className="flex justify-between items-center mb-6 max-w-xl mx-auto">
         <button onClick={() => setActiveTab('MAIN')} className="p-3 bg-slate-800/40 rounded-2xl border border-slate-700/50">
            <ChevronLeft className="w-6 h-6 transform rotate-180 text-blue-400" />
         </button>
         <h2 className="text-lg font-black tracking-tighter uppercase italic">
            {activeTab === CalcType.LEARNING ? 'Learning Center' : activeTab === 'SETTINGS' ? 'Settings' : activeTab === 'HISTORY' ? 'History' : 'Calculator'}
         </h2>
         <div className="w-10"></div>
      </header>

      <main className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === CalcType.HYDROSTATIC && <HydrostaticCalc onResult={saveToHistory} initialData={restoredRecord} />}
        {activeTab === CalcType.ECD && < ECDCalc onResult={saveToHistory} initialData={restoredRecord} />}
        {activeTab === CalcType.LOT && <LeakOffTestCalc onResult={saveToHistory} initialData={restoredRecord} />}
        {activeTab === CalcType.TOTAL_CEMENT && <CementingMaster onResult={saveToHistory} initialData={restoredRecord} />}
        {activeTab === CalcType.WELL_VOLUME && <WellVolumeCalc onResult={saveToHistory} initialData={restoredRecord} />}
        {activeTab === CalcType.CASING_CAPACITY_TABLE && <CasingCapacityTable />}
        {activeTab === CalcType.PUMP_MASTER && <PumpMasterPro onResult={saveToHistory} initialData={restoredRecord} />}
        {activeTab === CalcType.DRILL_STRING_STROKES && <DrillStringStrokes onResult={saveToHistory} initialData={restoredRecord} />}
        {activeTab === CalcType.ROP && <ROPCalc onResult={saveToHistory} initialData={restoredRecord} />}
        {activeTab === CalcType.FINAL_REPORT && <FinalReportCalc onResult={saveToHistory} initialData={restoredRecord} />}
        {activeTab === CalcType.DRILLING_REPORT_PRO && <DrillingReportPro onResult={saveToHistory} initialData={restoredRecord} />}
        {activeTab === CalcType.FIT && <FITCalc onResult={saveToHistory} initialData={restoredRecord} />}
        {activeTab === CalcType.AI_SCANNER && <AIScannerCalc onResult={saveToHistory} initialData={restoredRecord} />}
        {activeTab === CalcType.SPOT && <SpotCalc onResult={saveToHistory} initialData={restoredRecord} />}
        {activeTab === CalcType.PUMP_OUTPUT_1 && <PumpOutputCalc onResult={saveToHistory} initialData={restoredRecord} />}
        {activeTab === CalcType.PUMP_OUTPUT_2 && <PumpOutputCalc2 onResult={saveToHistory} initialData={restoredRecord} />}
        {activeTab === CalcType.ANNULAR_VOLUME && <AnnularVolumeCalc onResult={saveToHistory} initialData={restoredRecord} />}
        {activeTab === CalcType.DISPLACEMENT && <DisplacementCalc onResult={saveToHistory} initialData={restoredRecord} />}
        {activeTab === CalcType.RAT_HOLE && <RatHoleCalc onResult={saveToHistory} initialData={restoredRecord} />}
        {activeTab === CalcType.SHOE_TRACK && <ShoeTrackCalc onResult={saveToHistory} initialData={restoredRecord} />}
        {activeTab === CalcType.GPM && <GPMCalc onResult={saveToHistory} initialData={restoredRecord} />}
        {activeTab === CalcType.SPM && <SPMCalc onResult={saveToHistory} initialData={restoredRecord} />}
        {activeTab === CalcType.LEARNING && <LearningCenter />}
        {activeTab === 'SETTINGS' && (
          <AppSettingsView
            allCalculators={allCalculators}
            hiddenCalcs={hiddenCalcs}
            onToggleCalc={toggleCalcVisibility}
            onSetHiddenCalcs={setHiddenCalcs}
          />
        )}
        {activeTab === 'HISTORY' && (
          <HistoryView 
            history={history} 
            onClear={() => setHistory([])} 
            onDelete={(id) => setHistory(prev => prev.filter(r => r.id !== id))} 
            onRestore={handleRestore}
          />
        )}
      </main>
    </div>
  );
};

const AppWithGuard: React.FC = () => {
  return (
    <LicenseGuard>
      <FormulaStyleProvider>
        <App />
      </FormulaStyleProvider>
    </LicenseGuard>
  );
};

export default AppWithGuard;
