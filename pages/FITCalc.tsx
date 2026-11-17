import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Activity, ShieldCheck, Ruler, Info } from 'lucide-react';
import { CalcType, CalculationRecord } from '../types';
import MathFormula from '../components/MathFormula';

interface FITCalcProps {
  onResult: (record: CalculationRecord) => void;
  initialData?: CalculationRecord | null;
}

const FITCalc: React.FC<FITCalcProps> = ({ onResult, initialData }) => {
  const [emw, setEmw] = useState<string>('11');
  const [mw, setMw] = useState<string>('9.5');
  const [shoeDepth, setShoeDepth] = useState<string>('2710');
  const [fitPressure, setFitPressure] = useState<number>(0);

  useEffect(() => {
    const e = parseFloat(emw) || 0;
    const m = parseFloat(mw) || 0;
    const d = parseFloat(shoeDepth) || 0;
    const result = (e - m) * 0.052 * d;
    setFitPressure(result > 0 ? result : 0);
  }, [emw, mw, shoeDepth]);

  useEffect(() => {
    if (initialData && initialData.type === CalcType.FIT) {
      setEmw(String(initialData.inputs.EMW || ''));
      setMw(String(initialData.inputs.MW || ''));
      setShoeDepth(String(initialData.inputs.ShoeDepth || ''));
    }
  }, [initialData]);

  const handleSave = () => {
    onResult({
      id: Date.now().toString(),
      type: CalcType.FIT,
      title: 'حساب ضغط اختبار التكوين (FIT)',
      inputs: { EMW: emw, MW: mw, ShoeDepth: shoeDepth },
      result: fitPressure,
      timestamp: Date.now()
    });
    alert('تم حفظ البيانات بنجاح');
  };

  return (
    <div className="space-y-6 text-right pb-10">
      <div className="text-center">
        <h1 className="text-3xl font-black mb-1 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent italic uppercase tracking-tighter">FIT Pressure</h1>
        <p className="text-emerald-500 uppercase text-xs tracking-widest font-bold">Formation Integrity Test</p>
      </div>

      <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-emerald-500/20 shadow-2xl space-y-6">
        <div className="flex items-center justify-between mb-2">
            <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-500 text-xs"><Info className="w-4 h-4" /></div>
            <h3 className="text-sm font-black text-white italic uppercase tracking-wider">معلومات الحساب</h3>
        </div>

        <div className="bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20 flex items-start gap-4" dir="rtl">
            <div className="bg-blue-500 p-2 rounded-lg mt-1"><Info className="w-4 h-4 text-white" /></div>
            <div>
                <p className="text-blue-200 text-xs font-bold leading-relaxed">
                    ملاحظة هامة: يتم أخذ قيمة <span className="text-white font-black underline">Required EMW (11 PPG)</span> من واقع <span className="text-white font-black">برنامج الحفر (Drilling Program)</span> المعتمد للبئر.
                </p>
            </div>
        </div>

        <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 text-center space-y-4" dir="ltr">
            <div className="space-y-1">
              <p className="text-xs text-slate-300 font-bold tracking-wide text-left">Formula</p>
              <div className="p-3 bg-slate-950/40 rounded-xl">
                <MathFormula formula="FIT = (EMW - MW) \times 0.052 \times Depth" className="text-emerald-400 text-lg" />
              </div>
            </div>
            <div className="pt-3 border-t border-emerald-500/10 space-y-1">
              <p className="text-xs text-slate-300 font-bold tracking-wide text-left">Substitution</p>
              <div className="p-3 bg-slate-950/40 rounded-xl">
                <MathFormula formula={`FIT = (${emw || 0} - ${mw || 0}) \\times 0.052 \\times ${shoeDepth || 0}`} className="text-emerald-300 text-lg" />
              </div>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-6 pt-2">
            <div className="space-y-2 text-right">
                <label className="text-[10px] font-black text-slate-400 uppercase px-1 flex items-center justify-end gap-1 italic">
                    Shoe Depth TVD (ft) <Ruler className="w-3 h-3 text-emerald-400" />
                </label>
                <input 
                    className="input-field !text-xl !p-4 !bg-slate-800/50 border-slate-700 focus:border-emerald-500" 
                    type="number" 
                    value={shoeDepth} 
                    onChange={e => setShoeDepth(e.target.value)} 
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-right">
                    <label className="text-[10px] font-black text-slate-400 uppercase px-1 flex items-center justify-end gap-1 italic">
                        Req. EMW (ppg) <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    </label>
                    <input 
                        className="input-field !text-xl !p-4 !bg-slate-800/50 border-slate-700 focus:border-emerald-500 font-bold text-emerald-400" 
                        type="number" 
                        value={emw} 
                        onChange={e => setEmw(e.target.value)} 
                    />
                </div>
                <div className="space-y-2 text-right">
                    <label className="text-[10px] font-black text-slate-400 uppercase px-1 flex items-center justify-end gap-1 italic">
                        Current MW (ppg) <Activity className="w-3 h-3 text-emerald-400" />
                    </label>
                    <input 
                        className="input-field !text-xl !p-4 !bg-slate-800/50 border-slate-700 focus:border-emerald-500" 
                        type="number" 
                        value={mw} 
                        onChange={e => setMw(e.target.value)} 
                    />
                </div>
            </div>
        </div>

        <div className="bg-emerald-600/20 p-8 rounded-[3rem] text-center border border-emerald-500/30 shadow-2xl relative overflow-hidden">
            <p className="text-emerald-400 text-xs font-black mb-1 uppercase tracking-widest italic">FIT Pressure Result</p>
            <div className="flex items-baseline justify-center gap-2 relative z-10">
                <span className="text-6xl font-black text-white">{fitPressure.toFixed(0)}</span>
                <span className="text-lg font-bold text-emerald-300 italic uppercase">psi</span>
            </div>
            <div className="mt-4 p-2.5 bg-slate-950/30 rounded-2xl inline-block px-6">
                <MathFormula formula={`FIT = (${emw || 0} - ${mw || 0}) \\times 0.052 \\times ${shoeDepth || 0}`} className="text-slate-300 text-sm" />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <button onClick={() => { setEmw(''); setMw(''); setShoeDepth(''); }} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-slate-700 text-slate-500 font-black hover:bg-slate-800 transition-all shadow-xl">
              <RefreshCw className="w-5 h-5" /> تصفير
          </button>
          <button onClick={handleSave} className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/30 active:scale-95 transition-all">
              <Save className="w-5 h-5" /> حفظ النتيجة
          </button>
      </div>
    </div>
  );
};

export default FITCalc;
