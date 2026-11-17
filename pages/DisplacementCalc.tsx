
import React, { useState, useEffect } from 'react';
import FormulaCard from '../components/FormulaCard';
import CasingSelector from '../components/CasingSelector';
import { Save, RefreshCw } from 'lucide-react';
import { CalcType, CalculationRecord } from '../types';

interface DisplacementCalcProps {
  onResult: (record: CalculationRecord) => void;
  initialData?: CalculationRecord | null;
}

const DisplacementCalc: React.FC<DisplacementCalcProps> = ({ onResult, initialData }) => {
  const [id, setId] = useState<string>('');
  const [depth, setDepth] = useState<string>('');
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    if (initialData && initialData.type === CalcType.DISPLACEMENT) {
      setId(String(initialData.inputs.CasingID || ''));
      setDepth(String(initialData.inputs.Depth || ''));
    }
  }, [initialData]);

  useEffect(() => {
    const d = parseFloat(id);
    const h = parseFloat(depth);
    if (d && h) {
      setResult((d * d / 1029.4) * h);
    } else {
      setResult(0);
    }
  }, [id, depth]);

  const handleSave = () => {
    if (result === 0) return;
    onResult({
      id: Date.now().toString(),
      type: CalcType.DISPLACEMENT,
      title: 'حساب الإزاحة',
      inputs: { CasingID: id, Depth: depth },
      result: result,
      timestamp: Date.now()
    });
    alert('تم الحفظ بنجاح');
  };

  return (
    <div className="space-y-6 text-right">
      <div className="text-center">
        <h1 className="text-3xl font-black mb-1">حساب الإزاحة</h1>
        <p className="text-blue-400 uppercase text-xs tracking-widest font-bold">Displacement</p>
      </div>

      <FormulaCard details={{
        title: 'قانون الإزاحة',
        law: 'Disp = \\frac{ID^2}{1029.4} \\times Depth',
        substitution: result > 0 ? `Disp = \\frac{${id}^2}{1029.4} \\times ${depth}` : undefined,
        variables: [{ description: 'ID = القطر الداخلي - إنش' }, { description: 'Depth = العمق - قدم' }]
      }} />

      <div className="bg-blue-600 p-8 rounded-3xl text-center shadow-lg">
        <p className="text-blue-100 text-xs font-bold mb-1 uppercase tracking-widest">إجمالي الإزاحة</p>
        <p className="text-5xl font-black">{result.toFixed(2)} <span className="text-xl font-medium opacity-80">bbl</span></p>
      </div>

      <div className="bg-[#1e293b]/30 p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CasingSelector label="اختيار الكيسينق (حسب النوع والوزن)" currentOD="" currentID={id} onSelect={(_od, selectedId) => setId(selectedId)} variant="current" compact />
            <label className="text-sm font-bold block text-slate-300">القطر الداخلي للكيسنج (ID) - إنش</label>
          </div>
          <input className="input-field text-right" type="number" value={id} onChange={e => setId(e.target.value)} placeholder="17.755" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold block text-slate-300">العمق (Depth) - قدم</label>
          <input className="input-field text-right" type="number" value={depth} onChange={e => setDepth(e.target.value)} placeholder="230" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <button onClick={() => { setId(''); setDepth(''); }} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-slate-700 text-slate-400 font-bold hover:bg-slate-800 transition-all active:scale-95">
              <RefreshCw className="w-5 h-5" /> تصفير
          </button>
          <button onClick={handleSave} disabled={result === 0} className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20">
              <Save className="w-5 h-5" /> حفظ
          </button>
      </div>
    </div>
  );
};

export default DisplacementCalc;
