
import React, { useState, useEffect } from 'react';
import FormulaCard from '../components/FormulaCard';
import { Save, RefreshCw } from 'lucide-react';
import { CalcType, CalculationRecord } from '../types';

interface PumpOutputCalc2Props {
  onResult: (record: CalculationRecord) => void;
  initialData?: CalculationRecord | null;
}

const PumpOutputCalc2: React.FC<PumpOutputCalc2Props> = ({ onResult, initialData }) => {
  const [dia, setDia] = useState<string>('');
  const [len, setLen] = useState<string>('');
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    if (initialData && initialData.type === CalcType.PUMP_OUTPUT_2) {
      setDia(String(initialData.inputs.LinerID || ''));
      setLen(String(initialData.inputs.StrokeLen || ''));
    }
  }, [initialData]);

  useEffect(() => {
    const d = parseFloat(dia);
    const l = parseFloat(len);
    if (d && l) {
      setResult((d * d * l) / 4115.2);
    } else {
      setResult(0);
    }
  }, [dia, len]);

  const handleSave = () => {
    if (result === 0) return;
    onResult({
      id: Date.now().toString(),
      type: CalcType.PUMP_OUTPUT_2,
      title: 'مخرجات المضخة (طريقة L²/4115.2)',
      inputs: { LinerID: dia, StrokeLen: len },
      result: result,
      timestamp: Date.now()
    });
    alert('تم الحفظ');
  };

  return (
    <div className="space-y-6 text-right pb-10">
      <div className="text-center">
        <h1 className="text-3xl font-black mb-1">مخرجات المضخة</h1>
        <p className="text-teal-500 uppercase text-xs tracking-widest font-bold">Pump Output (Method 2)</p>
      </div>

      <FormulaCard details={{
        title: 'قانون مخرجات المضخة (2)',
        law: 'PO = \\frac{ID^2 \\times L}{4115.2}',
        substitution: result > 0 ? `PO = \\frac{${dia}^2 \\times ${len}}{4115.2}` : undefined,
        variables: [{ description: 'ID = قطر اللاينر - إنش' }, { description: 'L = طول الضربة - إنش' }]
      }} />

      <div className="bg-teal-600 p-8 rounded-3xl text-center shadow-lg shadow-teal-500/20 border border-teal-400/30">
        <p className="text-teal-100 text-xs font-bold mb-1 uppercase tracking-widest">الناتج (bbl/stk)</p>
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
      </div>

      <div className="grid grid-cols-2 gap-4">
          <button onClick={() => { setDia(''); setLen(''); }} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-slate-700 text-slate-400 font-bold hover:bg-slate-800 transition-all active:scale-95">
              <RefreshCw className="w-5 h-5" /> تصفير
          </button>
          <button onClick={handleSave} disabled={result === 0} className="flex items-center justify-center gap-2 px-6 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold shadow-xl">
              <Save className="w-5 h-5" /> حفظ النتيجة
          </button>
      </div>
    </div>
  );
};

export default PumpOutputCalc2;
