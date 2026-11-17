
import React, { useState, useEffect } from 'react';
import FormulaCard from '../components/FormulaCard';
import CasingSelector from '../components/CasingSelector';
import { Save, RefreshCw } from 'lucide-react';
import { CalcType, CalculationRecord } from '../types';

interface ShoeTrackCalcProps {
  onResult: (record: CalculationRecord) => void;
  initialData?: CalculationRecord | null;
}

const ShoeTrackCalc: React.FC<ShoeTrackCalcProps> = ({ onResult, initialData }) => {
  const [id, setId] = useState<string>('');
  const [depth, setDepth] = useState<string>('20');
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    if (initialData && initialData.type === CalcType.SHOE_TRACK) {
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
      type: CalcType.SHOE_TRACK,
      title: 'Shoe Track Volume',
      inputs: { CasingID: id, Depth: depth },
      result: result,
      timestamp: Date.now()
    });
    alert('تم حفظ النتيجة');
  };

  return (
    <div className="space-y-6 text-right">
      <div className="text-center">
        <h1 className="text-3xl font-black mb-1">السيمنت في Shoe Track</h1>
        <p className="text-blue-400 uppercase text-xs tracking-widest font-bold">Shoe Track (V3)</p>
      </div>

      <FormulaCard details={{
        title: 'قانون الـ Shoe Track',
        law: 'V_3 = \\frac{ID^2}{1029.4} \\times Depth',
        substitution: result > 0 ? `V_3 = \\frac{${id}^2}{1029.4} \\times ${depth}` : undefined,
        variables: [{ description: 'ID = القطر الداخلي للكيسنج - إنش' }, { description: 'Depth = طول الـ Shoe Track - قدم' }]
      }} />

      <div className="bg-blue-600 p-8 rounded-3xl text-center shadow-lg">
        <p className="text-blue-100 text-xs font-bold mb-1 uppercase tracking-widest">حجم السيمنت (V3)</p>
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
          <label className="text-sm font-bold block text-slate-300">طول الـ Shoe Track - قدم</label>
          <input className="input-field text-right" type="number" value={depth} onChange={e => setDepth(e.target.value)} placeholder="20" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <button onClick={() => { setId(''); setDepth('20'); }} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-slate-700 text-slate-400 font-bold hover:bg-slate-800">
              <RefreshCw className="w-5 h-5" /> تصفير
          </button>
          <button onClick={handleSave} disabled={result === 0} className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold">
              <Save className="w-5 h-5" /> حفظ النتيجة
          </button>
      </div>
    </div>
  );
};

export default ShoeTrackCalc;
