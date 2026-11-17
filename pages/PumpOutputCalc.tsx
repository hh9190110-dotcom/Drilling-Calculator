
import React, { useState, useEffect } from 'react';
import FormulaCard from '../components/FormulaCard';
import { Save, RefreshCw } from 'lucide-react';
import { CalcType, CalculationRecord } from '../types';

interface PumpOutputCalcProps {
  onResult: (record: CalculationRecord) => void;
  initialData?: CalculationRecord | null;
}

const PumpOutputCalc: React.FC<PumpOutputCalcProps> = ({ onResult, initialData }) => {
  const [dia, setDia] = useState<string>('');
  const [len, setLen] = useState<string>('');
  const [eff, setEff] = useState<string>('0.97');
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    if (initialData && initialData.type === CalcType.PUMP_OUTPUT_1) {
      setDia(String(initialData.inputs.LinerID || ''));
      setLen(String(initialData.inputs.StrokeLen || ''));
      setEff(String(initialData.inputs.Efficiency || '0.97'));
    }
  }, [initialData]);

  useEffect(() => {
    const d = parseFloat(dia);
    const l = parseFloat(len);
    const e = parseFloat(eff) || 1;
    if (d && l) {
      setResult(0.000243 * d * d * l * e);
    } else {
      setResult(0);
    }
  }, [dia, len, eff]);

  const handleSave = () => {
    if (result === 0) return;
    onResult({
      id: Date.now().toString(),
      type: CalcType.PUMP_OUTPUT_1,
      title: 'مخرجات المضخة (Pump Output)',
      inputs: { LinerID: dia, StrokeLen: len, Efficiency: eff },
      result: result,
      timestamp: Date.now()
    });
    alert('تم الحفظ');
  };

  return (
    <div className="space-y-6 text-right pb-10">
      <div className="text-center">
        <h1 className="text-3xl font-black mb-1">مخرجات المضخة</h1>
        <p className="text-emerald-500 uppercase text-xs tracking-widest font-bold">Pump Output (Method 1)</p>
      </div>

      <FormulaCard details={{
        title: 'قانون مخرجات المضخة',
        law: 'PO = 0.000243 \\times ID^2 \\times L \\times Eff',
        substitution: result > 0 ? `PO = 0.000243 \\times ${dia}^2 \\times ${len} \\times ${eff || 1}` : undefined,
        variables: [{ description: 'ID = قطر اللاينر - إنش' }, { description: 'L = طول الضربة - إنش' }, { description: 'Eff = الكفاءة (مثال: 0.97)' }]
      }} />

      <div className="bg-emerald-600 p-8 rounded-3xl text-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
        <p className="text-emerald-100 text-xs font-bold mb-1 uppercase tracking-widest">الناتج (bbl/stk)</p>
        <p className="text-5xl font-black">{result.toFixed(5)}</p>
      </div>

      <div className="bg-[#1e293b]/30 p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-bold block text-slate-300">قطر اللاينر (Liner ID) - إنش</label>
          <input className="input-field text-right" type="number" value={dia} onChange={e => setDia(e.target.value)} placeholder="6.5" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold block text-slate-300">طول الضربة (Stroke Length) - إنش</label>
          <input className="input-field text-right" type="number" value={len} onChange={e => setLen(e.target.value)} placeholder="12" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold block text-slate-300">الكفاءة (Efficiency)</label>
          <input className="input-field text-right" type="number" value={eff} onChange={e => setEff(e.target.value)} placeholder="0.97" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <button onClick={() => { setDia(''); setLen(''); setEff('0.97'); }} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-slate-700 text-slate-400 font-bold hover:bg-slate-800 transition-all active:scale-95">
              <RefreshCw className="w-5 h-5" /> تصفير
          </button>
          <button onClick={handleSave} disabled={result === 0} className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-xl">
              <Save className="w-5 h-5" /> حفظ النتيجة
          </button>
      </div>
    </div>
  );
};

export default PumpOutputCalc;
