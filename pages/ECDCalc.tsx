
import React, { useState, useEffect } from 'react';
import FormulaCard from '../components/FormulaCard';
import { Save, RefreshCw } from 'lucide-react';
import { CalcType, CalculationRecord } from '../types';

interface ECDCalcProps {
  onResult: (record: CalculationRecord) => void;
  initialData?: CalculationRecord | null;
}

const ECDCalc: React.FC<ECDCalcProps> = ({ onResult, initialData }) => {
  const [mw, setMw] = useState<string>('');
  const [apl, setApl] = useState<string>('');
  const [tvd, setTvd] = useState<string>('');
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    if (initialData && initialData.type === CalcType.ECD) {
      setMw(String(initialData.inputs.MW || ''));
      setApl(String(initialData.inputs.APL || ''));
      setTvd(String(initialData.inputs.TVD || ''));
    }
  }, [initialData]);

  useEffect(() => {
    const m = parseFloat(mw);
    const a = parseFloat(apl);
    const t = parseFloat(tvd);
    if (m && a && t) {
      setResult(m + (a / (0.052 * t)));
    } else {
      setResult(0);
    }
  }, [mw, apl, tvd]);

  const handleSave = () => {
    if (result === 0) return;
    onResult({
      id: Date.now().toString(),
      type: CalcType.ECD,
      title: 'الكثافة الدورانية (ECD)',
      inputs: { MW: mw, APL: apl, TVD: tvd },
      result: result,
      timestamp: Date.now()
    });
    alert('تم الحفظ');
  };

  return (
    <div className="space-y-6 text-right pb-10">
      <div className="text-center">
        <h1 className="text-3xl font-black mb-1">الكثافة الدورانية المكافئة</h1>
        <p className="text-amber-500 uppercase text-xs tracking-widest font-bold">Equivalent Circulating Density (ECD)</p>
      </div>

      <FormulaCard details={{
        title: 'قانون ECD',
        law: 'ECD = MW + \\frac{APL}{0.052 \\times TVD}',
        substitution: result > 0 ? `ECD = ${mw} + \\frac{${apl}}{0.052 \\times ${tvd}}` : undefined,
        variables: [
          { description: 'MW = وزن الطفلة الساكن - ppg' },
          { description: 'APL = فقد الضغط الحلقي - psi' },
          { description: 'TVD = العمق الرأسي الحقيقي - ft' }
        ]
      }} />

      <div className="bg-amber-600 p-8 rounded-3xl text-center shadow-lg shadow-amber-500/20 border border-amber-400/30">
        <p className="text-amber-100 text-xs font-bold mb-1 uppercase tracking-widest">النتيجة (ECD)</p>
        <p className="text-5xl font-black">{result.toFixed(2)} <span className="text-xl font-medium opacity-80">ppg</span></p>
      </div>

      <div className="bg-[#1e293b]/30 p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-bold block text-slate-300">وزن الطفلة (MW) - ppg</label>
          <input className="input-field text-right" type="number" value={mw} onChange={e => setMw(e.target.value)} placeholder="مثال: 11.2" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold block text-slate-300">فقد الضغط (APL) - psi</label>
          <input className="input-field text-right" type="number" value={apl} onChange={e => setApl(e.target.value)} placeholder="مثال: 950" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold block text-slate-300">العمق الرأسي (TVD) - ft</label>
          <input className="input-field text-right" type="number" value={tvd} onChange={e => setTvd(e.target.value)} placeholder="مثال: 10000" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <button onClick={() => { setMw(''); setApl(''); setTvd(''); }} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-slate-700 text-slate-400 font-bold hover:bg-slate-800 transition-all active:scale-95">
              <RefreshCw className="w-5 h-5" /> تصفير
          </button>
          <button onClick={handleSave} disabled={result === 0} className="flex items-center justify-center gap-2 px-6 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold shadow-xl shadow-amber-500/20">
              <Save className="w-5 h-5" /> حفظ النتيجة
          </button>
      </div>
    </div>
  );
};

export default ECDCalc;
