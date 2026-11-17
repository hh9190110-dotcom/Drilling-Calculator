
import React, { useState, useEffect } from 'react';
import FormulaCard from '../components/FormulaCard';
import { Save, RefreshCw } from 'lucide-react';
import { CalcType, CalculationRecord } from '../types';

interface RatHoleCalcProps {
  onResult: (record: CalculationRecord) => void;
  initialData?: CalculationRecord | null;
}

const RatHoleCalc: React.FC<RatHoleCalcProps> = ({ onResult, initialData }) => {
  const [hole, setHole] = useState<string>('');
  const [depth, setDepth] = useState<string>('3');
  const [excess, setExcess] = useState<string>('0');
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    if (initialData && initialData.type === CalcType.RAT_HOLE) {
      setHole(String(initialData.inputs.Hole || ''));
      setDepth(String(initialData.inputs.Depth || ''));
      setExcess(String(initialData.inputs.Excess || '0'));
    }
  }, [initialData]);

  useEffect(() => {
    const d = parseFloat(hole);
    const h = parseFloat(depth);
    const e = parseFloat(excess) || 0;
    if (d && h) {
      setResult((d * d / 1029.4) * h * (1 + e / 100));
    } else {
      setResult(0);
    }
  }, [hole, depth, excess]);

  const handleSave = () => {
    if (result === 0) return;
    onResult({
      id: Date.now().toString(),
      type: CalcType.RAT_HOLE,
      title: 'Rat Hole Volume',
      inputs: { Hole: hole, Depth: depth, Excess: excess },
      result: result,
      timestamp: Date.now()
    });
    alert('تم الحفظ في السجل');
  };

  return (
    <div className="space-y-6 text-right">
      <div className="text-center">
        <h1 className="text-3xl font-black mb-1">السيمنت في Rat Hole</h1>
        <p className="text-blue-400 uppercase text-xs tracking-widest font-bold">Rat Hole (V2)</p>
      </div>

      <FormulaCard details={{
        title: 'قانون الـ Rat Hole',
        law: 'V_2 = \\frac{D^2}{1029.4} \\times Depth \\times Excess',
        substitution: result > 0 ? `V_2 = \\frac{${hole}^2}{1029.4} \\times ${depth} \\times ${1 + (parseFloat(excess) || 0) / 100}` : undefined,
        variables: [{ description: 'D = حجم الفتحة - إنش' }, { description: 'Depth = عمق الـ Rat Hole - قدم' }]
      }} />

      <div className="bg-blue-600 p-8 rounded-3xl text-center shadow-lg">
        <p className="text-blue-100 text-xs font-bold mb-1 uppercase tracking-widest">حجم السيمنت (V2)</p>
        <p className="text-5xl font-black">{result.toFixed(2)} <span className="text-xl font-medium opacity-80">bbl</span></p>
      </div>

      <div className="space-y-5 bg-[#1e293b]/30 p-6 rounded-3xl border border-slate-800">
        <div className="space-y-2">
          <label className="text-sm font-bold block text-slate-300">حجم الفتحة (D) - إنش</label>
          <input className="input-field text-right" type="number" value={hole} onChange={e => setHole(e.target.value)} placeholder="24" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold block text-slate-300">عمق الـ Rat Hole - قدم</label>
          <input className="input-field text-right" type="number" value={depth} onChange={e => setDepth(e.target.value)} placeholder="3" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold block text-slate-300">الزيادة (Excess) - %</label>
          <input className="input-field text-right" type="number" value={excess} onChange={e => setExcess(e.target.value)} placeholder="0" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <button onClick={() => { setHole(''); setDepth('3'); setExcess('0'); }} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-slate-700 text-slate-400 font-bold hover:bg-slate-800">
              <RefreshCw className="w-5 h-5" /> تصفير
          </button>
          <button onClick={handleSave} disabled={result === 0} className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20">
              <Save className="w-5 h-5" /> حفظ
          </button>
      </div>
    </div>
  );
};

export default RatHoleCalc;
