
import React, { useState, useEffect } from 'react';
import FormulaCard from '../components/FormulaCard';
import { Save, RefreshCw, ShieldCheck } from 'lucide-react';
import { CalcType, CalculationRecord } from '../types';

interface LeakOffTestCalcProps {
  onResult: (record: CalculationRecord) => void;
  initialData?: CalculationRecord | null;
}

const LeakOffTestCalc: React.FC<LeakOffTestCalcProps> = ({ onResult, initialData }) => {
  const [mwTest, setMwTest] = useState<string>('');
  const [tvdShoe, setTvdShoe] = useState<string>('');
  const [lop, setLop] = useState<string>('');
  
  useEffect(() => {
    if (initialData && initialData.type === CalcType.LOT) {
      setMwTest(String(initialData.inputs.MW_Test || ''));
      setTvdShoe(String(initialData.inputs.Shoe_TVD || ''));
      setLop(String(initialData.inputs.LOP || ''));
    }
  }, [initialData]);

  const [fracPres, setFracPres] = useState<number>(0);
  const [mamw, setMamw] = useState<number>(0);
  const [safeMamw, setSafeMamw] = useState<number>(0);

  useEffect(() => {
    const m = parseFloat(mwTest);
    const t = parseFloat(tvdShoe);
    const p = parseFloat(lop);

    if (m && t && p) {
      // 1. Fracture Pressure (PSI) = Hydrostatic + Leak Off Pressure
      const hydrostatic = 0.052 * m * t;
      const fracture = hydrostatic + p;
      setFracPres(fracture);

      // 2. MAMW (PPG) = Fracture Pressure / (0.052 * TVD)
      const maxWeight = fracture / (0.052 * t);
      setMamw(maxWeight);

      // 3. Safe MAMW = MAMW - 0.5 ppg (Based on your "For the safe" slide)
      setSafeMamw(maxWeight - 0.5);
    } else {
      setFracPres(0);
      setMamw(0);
      setSafeMamw(0);
    }
  }, [mwTest, tvdShoe, lop]);

  const handleSave = () => {
    if (safeMamw === 0) return;
    onResult({
      id: Date.now().toString(),
      type: CalcType.LOT,
      title: 'اختبار تسرب الطبقات (LOT)',
      inputs: { MW_Test: mwTest, Shoe_TVD: tvdShoe, LOP: lop },
      result: safeMamw,
      timestamp: Date.now()
    });
    alert('تم حفظ البيانات في السجل');
  };

  return (
    <div className="space-y-6 text-right pb-10">
      <div className="text-center">
        <h1 className="text-3xl font-black mb-1">اختبار التسرب (LOT)</h1>
        <p className="text-amber-500 uppercase text-xs tracking-widest font-bold">Leak Off Test Analysis</p>
      </div>

      <FormulaCard details={{
        title: 'قوانين اختبار التسرب',
        law: 'Frac\\ P = (0.052 \\times MW \\times TVD) + LOP',
        substitution: fracPres > 0 ? `Frac\\ P = (0.052 \\times ${mwTest} \\times ${tvdShoe}) + ${lop}` : undefined,
        variables: [
          { description: 'MW = وزن الطفلة أثناء الاختبار - ppg' },
          { description: 'TVD = عمق حذاء الكيسنج (Casing Shoe) - ft' },
          { description: 'LOP = ضغط التسرب على السطح - psi' },
          { description: 'معادلة أقصى وزن آمن للطفلة (Safe MAMW):', math: 'MAMW_{Safe} = \\frac{Frac\\ P}{0.052 \\times TVD} - 0.5', color: '#fbbf24' }
        ]
      }} />

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-slate-800/40 border border-slate-700 p-6 rounded-3xl text-center">
          <p className="text-slate-500 text-[10px] font-black uppercase mb-1">ضغط التكسير (Fracture Pressure)</p>
          <p className="text-3xl font-black text-white">{fracPres.toFixed(1)} <span className="text-sm opacity-50">psi</span></p>
        </div>
        
        <div className="bg-amber-600 p-6 rounded-3xl text-center shadow-xl shadow-amber-500/20 relative overflow-hidden">
          <div className="absolute top-2 left-2 opacity-20"><ShieldCheck className="w-12 h-12" /></div>
          <p className="text-amber-100 text-[10px] font-black uppercase mb-1">أقصى وزن مسموح به (Safe MAMW)</p>
          <p className="text-5xl font-black">{safeMamw.toFixed(2)} <span className="text-lg opacity-80 font-medium">ppg</span></p>
          <p className="text-[10px] text-amber-900 font-bold mt-2">تم طرح 0.5 ppg كعامل أمان</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <button onClick={() => { setMwTest(''); setTvdShoe(''); setLop(''); }} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-slate-700 text-slate-400 font-bold hover:bg-slate-800 transition-all">
              <RefreshCw className="w-5 h-5" /> تصفير
          </button>
          <button onClick={handleSave} disabled={safeMamw === 0} className="flex items-center justify-center gap-2 px-6 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold shadow-xl">
              <Save className="w-5 h-5" /> حفظ النتائج
          </button>
      </div>

      <div className="bg-[#1e293b]/30 p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-bold block text-slate-300">وزن الطفلة وقت الاختبار (ppg)</label>
          <input className="input-field text-right" type="number" value={mwTest} onChange={e => setMwTest(e.target.value)} placeholder="مثال: 11.2" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold block text-slate-300">عمق حذاء الكيسنج (TVD) - ft</label>
          <input className="input-field text-right" type="number" value={tvdShoe} onChange={e => setTvdShoe(e.target.value)} placeholder="مثال: 10000" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold block text-slate-300">ضغط التسرب المسجل (LOP) - psi</label>
          <input className="input-field text-right" type="number" value={lop} onChange={e => setLop(e.target.value)} placeholder="مثال: 950" />
        </div>
      </div>
    </div>
  );
};

export default LeakOffTestCalc;
