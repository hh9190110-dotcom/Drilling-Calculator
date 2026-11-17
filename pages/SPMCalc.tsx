
import React, { useState, useEffect } from 'react';
import FormulaCard from '../components/FormulaCard';
import { Save, RefreshCw } from 'lucide-react';
import { CalcType, CalculationRecord } from '../types';

interface SPMCalcProps {
  onResult: (record: CalculationRecord) => void;
  initialData?: CalculationRecord | null;
}

const SPMCalc: React.FC<SPMCalcProps> = ({ onResult, initialData }) => {
  const [gpm, setGpm] = useState<string>('');
  const [po, setPo] = useState<string>('');
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    if (initialData && initialData.type === CalcType.SPM) {
      setGpm(String(initialData.inputs.GPM || ''));
      setPo(String(initialData.inputs.PumpOutput || ''));
    }
  }, [initialData]);

  useEffect(() => {
    const g = parseFloat(gpm);
    const p = parseFloat(po);
    if (g && p) {
      setResult(g / (p * 42));
    } else {
      setResult(0);
    }
  }, [gpm, po]);

  const handleSave = () => {
    if (result === 0) return;
    onResult({
      id: Date.now().toString(),
      type: CalcType.SPM,
      title: 'حساب عدد الأشواط (SPM)',
      inputs: { GPM: gpm, PumpOutput: po },
      result: result,
      timestamp: Date.now()
    });
    alert('تم الحفظ');
  };

  return (
    <div className="space-y-6 text-right pb-10">
      <div className="text-center">
        <h1 className="text-3xl font-black mb-1">سرعة المضخة</h1>
        <p className="text-emerald-500 uppercase text-xs tracking-widest font-bold">Required SPM</p>
      </div>

      <FormulaCard details={{
        title: 'قانون الـ SPM',
        law: 'SPM = \\frac{GPM}{PO \\times 42}',
        substitution: result > 0 ? `SPM = \\frac{${gpm}}{${po} \\times 42}` : undefined,
        variables: [{ description: 'GPM = التدفق المطلوب - gal/min' }, { description: 'PO = مخرجات المضخة - bbl/stk' }]
      }} />

      <div className="bg-emerald-600 p-8 rounded-3xl text-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
        <p className="text-emerald-100 text-xs font-bold mb-1 uppercase tracking-widest">السرعة المطلوبة</p>
        <p className="text-5xl font-black">{result.toFixed(2)} <span className="text-xl font-medium opacity-80">stk/min</span></p>
      </div>

      <div className="bg-[#1e293b]/30 p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-bold block text-slate-300">معدل التدفق (GPM) - gal/min</label>
          <input className="input-field text-right" type="number" value={gpm} onChange={e => setGpm(e.target.value)} placeholder="373" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold block text-slate-300">مخرجات المضخة (PO) - bbl/stk</label>
          <input className="input-field text-right" type="number" value={po} onChange={e => setPo(e.target.value)} placeholder="0.111" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <button onClick={() => { setGpm(''); setPo(''); }} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-slate-700 text-slate-400 font-bold hover:bg-slate-800 transition-all active:scale-95">
              <RefreshCw className="w-5 h-5" /> تصفير
          </button>
          <button onClick={handleSave} disabled={result === 0} className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20">
              <Save className="w-5 h-5" /> حفظ
          </button>
      </div>
    </div>
  );
};

export default SPMCalc;
