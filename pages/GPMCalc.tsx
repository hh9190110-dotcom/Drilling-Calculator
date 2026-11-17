
import React, { useState, useEffect } from 'react';
import FormulaCard from '../components/FormulaCard';
import { Save, RefreshCw } from 'lucide-react';
import { CalcType, CalculationRecord } from '../types';

interface GPMCalcProps {
  onResult: (record: CalculationRecord) => void;
  initialData?: CalculationRecord | null;
}

const GPMCalc: React.FC<GPMCalcProps> = ({ onResult, initialData }) => {
  const [po, setPo] = useState<string>('');
  const [spm, setSpm] = useState<string>('');
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    if (initialData && initialData.type === CalcType.GPM) {
      setPo(String(initialData.inputs.PumpOutput || ''));
      setSpm(String(initialData.inputs.SPM || ''));
    }
  }, [initialData]);

  useEffect(() => {
    const p = parseFloat(po);
    const s = parseFloat(spm);
    if (p && s) {
      setResult(p * 42 * s);
    } else {
      setResult(0);
    }
  }, [po, spm]);

  const handleSave = () => {
    if (result === 0) return;
    onResult({
      id: Date.now().toString(),
      type: CalcType.GPM,
      title: 'حساب معدل التدفق (GPM)',
      inputs: { PumpOutput: po, SPM: spm },
      result: result,
      timestamp: Date.now()
    });
    alert('تم الحفظ');
  };

  return (
    <div className="space-y-6 text-right pb-10">
      <div className="text-center">
        <h1 className="text-3xl font-black mb-1">معدل التدفق</h1>
        <p className="text-emerald-500 uppercase text-xs tracking-widest font-bold">Flow Rate (GPM)</p>
      </div>

      <FormulaCard details={{
        title: 'قانون الـ GPM',
        law: 'GPM = PO \\times 42 \\times SPM',
        substitution: result > 0 ? `GPM = ${po} \\times 42 \\times ${spm}` : undefined,
        variables: [{ description: 'PO = مخرجات المضخة - bbl/stk' }, { description: 'SPM = عدد الضربات - stk/min' }]
      }} />

      <div className="bg-emerald-600 p-8 rounded-3xl text-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
        <p className="text-emerald-100 text-xs font-bold mb-1 uppercase tracking-widest">النتيجة النهائية</p>
        <p className="text-5xl font-black">{result.toFixed(2)} <span className="text-xl font-medium opacity-80">gal/min</span></p>
      </div>

      <div className="bg-[#1e293b]/30 p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-bold block text-slate-300">إنتاجية المضخة (Pump Output) - bbl/stk</label>
          <input className="input-field text-right" type="number" value={po} onChange={e => setPo(e.target.value)} placeholder="0.111" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold block text-slate-300">عدد الأشواط (SPM) - stk/min</label>
          <input className="input-field text-right" type="number" value={spm} onChange={e => setSpm(e.target.value)} placeholder="80" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <button onClick={() => { setPo(''); setSpm(''); }} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-slate-700 text-slate-400 font-bold hover:bg-slate-800 transition-all active:scale-95">
              <RefreshCw className="w-5 h-5" /> تصفير
          </button>
          <button onClick={handleSave} disabled={result === 0} className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20">
              <Save className="w-5 h-5" /> حفظ النتيجة
          </button>
      </div>
    </div>
  );
};

export default GPMCalc;
