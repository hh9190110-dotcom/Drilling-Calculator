
import React, { useState, useEffect } from 'react';
import FormulaCard from '../components/FormulaCard';
import { Save, RefreshCw } from 'lucide-react';
import { CalcType, CalculationRecord } from '../types';

interface HydrostaticCalcProps {
  onResult: (record: CalculationRecord) => void;
  initialData?: CalculationRecord | null;
}

const HydrostaticCalc: React.FC<HydrostaticCalcProps> = ({ onResult, initialData }) => {
  const [mw, setMw] = useState<string>('');
  const [tvd, setTvd] = useState<string>('');
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    if (initialData && initialData.type === CalcType.HYDROSTATIC) {
      setMw(String(initialData.inputs.MW || ''));
      setTvd(String(initialData.inputs.TVD || ''));
    }
  }, [initialData]);

  useEffect(() => {
    const m = parseFloat(mw);
    const t = parseFloat(tvd);
    if (m && t) {
      setResult(0.052 * m * t);
    } else {
      setResult(0);
    }
  }, [mw, tvd]);

  const handleSave = () => {
    if (result === 0) return;
    onResult({
      id: Date.now().toString(),
      type: CalcType.HYDROSTATIC,
      title: 'الضغط الهيدروستاتيكي',
      inputs: { MW: mw, TVD: tvd },
      result: result,
      timestamp: Date.now()
    });
    alert('تم الحفظ');
  };

  return (
    <div className="space-y-6 text-right pb-10">
      <div className="text-center">
        <h1 className="text-3xl font-black mb-1">الضغط الهيدروستاتيكي</h1>
        <p className="text-amber-500 uppercase text-xs tracking-widest font-bold">Hydrostatic Pressure (HP)</p>
      </div>

      <FormulaCard details={{
        title: 'قانون الضغط الهيدروستاتيكي',
        law: 'HP = 0.052 \\times MW \\times TVD',
        substitution: result > 0 ? `HP = 0.052 \\times ${mw} \\times ${tvd}` : undefined,
        variables: [
          { description: 'MW = وزن الطفلة - ppg' },
          { description: 'TVD = العمق الرأسي الحقيقي - ft' },
          { description: '0.052 = ثابت التحويل الهندسي' }
        ]
      }} />

      <div className="bg-amber-600 p-8 rounded-3xl text-center shadow-lg shadow-amber-500/20 border border-amber-400/30">
        <p className="text-amber-100 text-xs font-bold mb-1 uppercase tracking-widest">الضغط الناتج (HP)</p>
        <p className="text-5xl font-black">{result.toFixed(2)} <span className="text-xl font-medium opacity-80">psi</span></p>
      </div>

      <div className="bg-[#1e293b]/30 p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-bold block text-slate-300">وزن الطفلة (MW) - ppg</label>
          <input className="input-field text-right" type="number" value={mw} onChange={e => setMw(e.target.value)} placeholder="مثال: 9.5" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold block text-slate-300">العمق الرأسي الحقيقي (TVD) - ft</label>
          <input className="input-field text-right" type="number" value={tvd} onChange={e => setTvd(e.target.value)} placeholder="مثال: 10000" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <button onClick={() => { setMw(''); setTvd(''); }} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-slate-700 text-slate-400 font-bold hover:bg-slate-800 transition-all active:scale-95">
              <RefreshCw className="w-5 h-5" /> تصفير
          </button>
          <button onClick={handleSave} disabled={result === 0} className="flex items-center justify-center gap-2 px-6 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold shadow-xl shadow-amber-500/20">
              <Save className="w-5 h-5" /> حفظ النتيجة
          </button>
      </div>
    </div>
  );
};

export default HydrostaticCalc;
