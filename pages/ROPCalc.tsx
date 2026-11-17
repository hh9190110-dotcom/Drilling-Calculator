
import React, { useState, useEffect } from 'react';
import FormulaCard from '../components/FormulaCard';
import { Save, RefreshCw, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { CalcType, CalculationRecord } from '../types';

interface ROPCalcProps {
  onResult: (record: CalculationRecord) => void;
  initialData?: CalculationRecord | null;
}

const ROPCalc: React.FC<ROPCalcProps> = ({ onResult, initialData }) => {
  const [distance, setDistance] = useState<string>('');
  const [hours, setHours] = useState<string>('');
  const [minutes, setMinutes] = useState<string>('0');
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    if (initialData && initialData.type === CalcType.ROP) {
      setDistance(String(initialData.inputs.Distance || ''));
      setHours(String(initialData.inputs.Hours || ''));
      setMinutes(String(initialData.inputs.Minutes || '0'));
    }
  }, [initialData]);

  useEffect(() => {
    const dist = parseFloat(distance) || 0;
    const h = parseFloat(hours) || 0;
    const m = parseFloat(minutes) || 0;
    
    const totalTimeHours = h + (m / 60);

    if (dist > 0 && totalTimeHours > 0) {
      setResult(dist / totalTimeHours);
    } else {
      setResult(0);
    }
  }, [distance, hours, minutes]);

  const handleSave = () => {
    if (result === 0) return;
    onResult({
      id: Date.now().toString(),
      type: CalcType.ROP,
      title: 'معدل الاختراق (ROP)',
      inputs: { Distance: distance, Hours: hours, Minutes: minutes },
      result: result,
      timestamp: Date.now()
    });
    alert('تم حفظ النتيجة بنجاح');
  };

  return (
    <div className="space-y-6 text-right pb-10">
      <div className="text-center">
        <h1 className="text-3xl font-black mb-1 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent italic uppercase tracking-tighter">Rate of Penetration</h1>
        <p className="text-purple-500 uppercase text-xs tracking-widest font-bold">Drilling Performance Analysis</p>
      </div>

      <FormulaCard details={{
        title: 'قانون معدل الاختراق',
        law: 'ROP = \\frac{Distance}{Time}',
        substitution: result > 0 ? `ROP = \\frac{${distance}}{${hours || 0} + \\frac{${minutes || 0}}{60}}` : undefined,
        variables: [
          { description: 'Distance = المسافة المحفورة - ft' },
          { description: 'Time = الوقت المستغرق - hr' }
        ],
        note: 'يتم تحويل الدقائق إلى ساعات تلقائياً: (Hours + Minutes/60)'
      }} />

      <div className="bg-purple-600 p-8 rounded-[2.5rem] text-center shadow-2xl shadow-purple-500/20 border border-purple-400/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mt-12 blur-2xl"></div>
        <p className="text-purple-100 text-xs font-black mb-2 uppercase tracking-widest italic">معدل الاختراق (ROP)</p>
        <div className="flex items-baseline justify-center gap-2">
            <p className="text-6xl font-black text-white">{result.toFixed(2)}</p>
            <p className="text-xl font-bold text-purple-200 italic">ft/hr</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <button onClick={() => { setDistance(''); setHours(''); setMinutes('0'); }} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-slate-700 text-slate-500 font-black hover:bg-slate-800 transition-all active:scale-95 shadow-xl">
              <RefreshCw className="w-5 h-5" /> تصفير
          </button>
          <button onClick={handleSave} disabled={result === 0} className="flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-2xl font-black shadow-xl shadow-purple-500/30 active:scale-95 transition-all disabled:opacity-50">
              <Save className="w-5 h-5" /> حفظ في السجل
          </button>
      </div>

      <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-slate-800 space-y-6">
        <div className="space-y-2 text-right">
          <label className="text-[10px] font-black text-slate-400 uppercase px-1 flex items-center justify-end gap-1 italic">
             Distance Drilled (ft) <TrendingUp className="w-3 h-3 text-purple-400" />
          </label>
          <input 
            className="input-field !text-2xl !p-4 !bg-slate-800/50 border-slate-700 focus:border-purple-500" 
            type="number" 
            value={distance} 
            onChange={e => setDistance(e.target.value)} 
            placeholder="مثال: 120" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-right">
              <label className="text-[10px] font-black text-slate-400 uppercase px-1 flex items-center justify-end gap-1 italic">
                 Hours <Clock className="w-3 h-3 text-purple-400" />
              </label>
              <input 
                className="input-field !p-3 !bg-slate-800/50 border-slate-700" 
                type="number" 
                value={hours} 
                onChange={e => setHours(e.target.value)} 
                placeholder="2" 
              />
            </div>
            <div className="space-y-2 text-right">
              <label className="text-[10px] font-black text-slate-400 uppercase px-1 italic">Minutes</label>
              <input 
                className="input-field !p-3 !bg-slate-800/50 border-slate-700" 
                type="number" 
                value={minutes} 
                onChange={e => setMinutes(e.target.value)} 
                placeholder="30" 
              />
            </div>
        </div>
      </div>

      <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 flex items-start gap-4">
         <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
            <TrendingUp className="w-5 h-5" />
         </div>
         <div className="text-right">
           <p className="text-[10px] text-slate-400 leading-relaxed font-bold italic">
             يعتبر الـ ROP مؤشراً حيوياً على أداء لقمة الحفر (Bit) ومدى استجابة الطبقات الأرضية لعملية الحفر.
           </p>
         </div>
      </div>
    </div>
  );
};

export default ROPCalc;
