
import React, { useState, useEffect } from 'react';
import FormulaCard from '../components/FormulaCard';
import CasingSelector from '../components/CasingSelector';
import { Save, RefreshCw } from 'lucide-react';
import { CalcType, CalculationRecord } from '../types';

interface AnnularVolumeCalcProps {
  onResult: (record: CalculationRecord) => void;
  initialData?: CalculationRecord | null;
}

const AnnularVolumeCalc: React.FC<AnnularVolumeCalcProps> = ({ onResult, initialData }) => {
  const [hole, setHole] = useState<string>('');
  const [casing, setCasing] = useState<string>('');
  const [depth, setDepth] = useState<string>('');
  const [excess, setExcess] = useState<string>('0');
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    if (initialData && initialData.type === CalcType.ANNULAR_VOLUME) {
      setHole(String(initialData.inputs.Hole || ''));
      setCasing(String(initialData.inputs.Casing || ''));
      setDepth(String(initialData.inputs.Depth || ''));
      setExcess(String(initialData.inputs.Excess || '0'));
    }
  }, [initialData]);

  useEffect(() => {
    const d = parseFloat(hole);
    const c = parseFloat(casing);
    const h = parseFloat(depth);
    const e = parseFloat(excess) || 0;

    if (d && c && h) {
      const baseVal = ((d * d - c * c) / 1029.4) * h;
      setResult(baseVal * (1 + e / 100));
    } else {
      setResult(0);
    }
  }, [hole, casing, depth, excess]);

  const handleSave = () => {
    if (result === 0) return;
    onResult({
      id: Date.now().toString(),
      type: CalcType.ANNULAR_VOLUME,
      title: 'حجم الفراغ الحلقي',
      inputs: { Hole: hole, Casing: casing, Depth: depth, Excess: excess },
      result: result,
      timestamp: Date.now()
    });
    alert('تم حفظ النتيجة');
  };

  const details = {
    title: 'حساب الفراغ الحلقي',
    law: 'V_1 = \\frac{(D^2 - C^2)}{1029.4} \\times Depth \\times Excess',
    substitution: result > 0 ? `V_1 = \\frac{(${hole}^2 - ${casing}^2)}{1029.4} \\times ${depth} \\times ${1 + (parseFloat(excess) || 0) / 100}` : undefined,
    variables: [
      { description: 'D = حجم الفتحة (Hole Size) - إنش' },
      { description: 'C = حجم الكيسنج (Casing Size) - إنش' },
      { description: 'Depth = العمق - قدم' },
      { description: 'Excess = نسبة الزيادة (%)' },
    ]
  };

  return (
    <div className="space-y-6 text-right">
      <div className="text-center">
        <h1 className="text-3xl font-black mb-1">الفراغ الحلقي</h1>
        <p className="text-blue-400 uppercase text-xs tracking-widest font-bold">Annular Volume (V1)</p>
      </div>

      <FormulaCard details={details} />

      <div className="bg-blue-600 p-8 rounded-3xl text-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
        <p className="text-blue-100 text-xs font-bold mb-1 uppercase tracking-widest">إجمالي حجم الفراغ الحلقي</p>
        <p className="text-5xl font-black">{result.toFixed(2)} <span className="text-xl font-medium opacity-80">bbl</span></p>
      </div>

      <div className="space-y-5 bg-[#1e293b]/30 p-6 rounded-3xl border border-slate-800">
        <div className="space-y-2">
          <label className="text-sm font-bold block text-slate-300">حجم الفتحة (D) - إنش</label>
          <input className="input-field text-right" type="number" value={hole} onChange={e => setHole(e.target.value)} placeholder="24" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CasingSelector label="اختيار الكيسينق" currentOD={casing} currentID="" onSelect={(od) => setCasing(od)} variant="current" compact />
            <label className="text-sm font-bold block text-slate-300">حجم الكيسنج (C) - إنش</label>
          </div>
          <input className="input-field text-right" type="number" value={casing} onChange={e => setCasing(e.target.value)} placeholder="18.625" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold block text-slate-300">العمق (Depth) - قدم</label>
          <input className="input-field text-right" type="number" value={depth} onChange={e => setDepth(e.target.value)} placeholder="250" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold block text-slate-300">الزيادة (Excess) - %</label>
          <input className="input-field text-right" type="number" value={excess} onChange={e => setExcess(e.target.value)} placeholder="100" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <button onClick={() => { setHole(''); setCasing(''); setDepth(''); setExcess('0'); }} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-slate-700 text-slate-400 font-bold hover:bg-slate-800 transition-all active:scale-95">
              <RefreshCw className="w-5 h-5" /> تصفير
          </button>
          <button onClick={handleSave} disabled={result === 0} className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/20 font-bold transition-all transform active:scale-95 disabled:opacity-50">
              <Save className="w-5 h-5" /> حفظ النتيجة
          </button>
      </div>
    </div>
  );
};

export default AnnularVolumeCalc;
