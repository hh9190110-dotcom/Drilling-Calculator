
import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Activity, Info, Target, BookOpen, Zap, Calculator } from 'lucide-react';
import { CalculationRecord, CalcType } from '../types';
import MathFormula from '../components/MathFormula';

const PumpMasterPro: React.FC<{ onResult?: (record: CalculationRecord) => void, initialData?: CalculationRecord | null }> = ({ onResult, initialData }) => {
  const [method, setMethod] = useState<1 | 2>(1);
  
  // 1. مدخلات المضخة الأساسية (Basic Pump Data)
  const [dia, setDia] = useState<string>('6.5');
  const [len, setLen] = useState<string>('12');
  const [eff, setEff] = useState<string>('0.95');
  
  // 2. مدخلات GPM (تستخدم PO المحسوب)
  const [spmForGpm, setSpmForGpm] = useState<string>('80');

  // 3. مدخلات SPM (تستخدم PO المحسوب)
  const [gpmDesired, setGpmDesired] = useState<string>('350');

  useEffect(() => {
    if (initialData && initialData.type === CalcType.PUMP_MASTER) {
      const { inputs } = initialData;
      if (inputs.Method) setMethod(parseInt(String(inputs.Method)) as 1 | 2);
      if (inputs.Dia) setDia(String(inputs.Dia));
      if (inputs.Len) setLen(String(inputs.Len));
      if (inputs.Eff) setEff(String(inputs.Eff));
      if (inputs.SpmForGpm) setSpmForGpm(String(inputs.SpmForGpm));
      if (inputs.GpmDesired) setGpmDesired(String(inputs.GpmDesired));
    }
  }, [initialData]);

  // النتائج المحسوبة لحظياً
  const [po, setPo] = useState<number>(0);
  const [gpmResult, setGpmResult] = useState<number>(0);
  const [bpmResult, setBpmResult] = useState<number>(0);
  const [spmResult, setSpmResult] = useState<number>(0);

  // حساب مخرجات المضخة (PO) - وهي المدخل الأساسي للبقية
  useEffect(() => {
    const d = parseFloat(dia) || 0;
    const l = parseFloat(len) || 0;
    const e = parseFloat(eff) || 1;

    if (d && l) {
      if (method === 1) {
        setPo(0.000243 * d * d * l * e);
      } else {
        setPo((d * d * l) / 4115.2);
      }
    } else {
      setPo(0);
    }
  }, [dia, len, eff, method]);

  // حساب GPM و BPM (التدفق) بناءً على PO و SPM
  useEffect(() => {
    if (po > 0) {
      const sVal = parseFloat(spmForGpm) || 0;
      const calculatedBpm = po * sVal;
      const calculatedGpm = calculatedBpm * 42;
      
      setBpmResult(calculatedBpm);
      setGpmResult(calculatedGpm);
      
      // مزامنة تلقائية للتدفق المطلوب في الخطوة التالية
      if (calculatedGpm > 0) {
        setGpmDesired(calculatedGpm.toFixed(2));
      }
    } else {
      setBpmResult(0);
      setGpmResult(0);
    }
  }, [po, spmForGpm]);

  // حساب SPM (السرعة) بناءً على PO و GPM المطلوب
  useEffect(() => {
    const gVal = parseFloat(gpmDesired) || 0;
    if (po > 0 && gVal > 0) {
      setSpmResult(gVal / (po * 42));
    } else {
      setSpmResult(0);
    }
  }, [po, gpmDesired]);

  const handleSave = () => {
    if (po === 0 || !onResult) return;
    onResult({
      id: Date.now().toString(),
      type: CalcType.PUMP_MASTER,
      title: 'تقرير هيدروليكا المضخة الشامل',
      inputs: { 
        Method: method.toString(),
        Dia: dia,
        Len: len,
        Eff: eff,
        SpmForGpm: spmForGpm,
        GpmDesired: gpmDesired,
        PO: po.toFixed(5), 
        GPM: gpmResult.toFixed(2), 
        BPM: bpmResult.toFixed(3), 
        SPM_Required: spmResult.toFixed(2) 
      },
      result: po,
      timestamp: Date.now()
    });
    alert('تم حفظ التقرير في السجل');
  };

  return (
    <div className="space-y-8 text-right pb-32 animate-in fade-in duration-500">
      <header className="text-center">
        <h1 className="text-3xl font-black mb-1 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent italic uppercase tracking-tighter">PUMP MASTER PRO</h1>
        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Advanced Hydraulic Control</p>
        
        <div className="flex bg-slate-900/60 p-1 rounded-2xl border border-slate-800 backdrop-blur-md mt-6 max-w-xs mx-auto">
           <button onClick={() => setMethod(1)} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${method === 1 ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}>0.000243 Method</button>
           <button onClick={() => setMethod(2)} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${method === 2 ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-500'}`}>L²/4115.2 Method</button>
        </div>
      </header>

      {/* القسم 1: بيانات المضخة الأساسية وحساب PO */}
      <section className="bg-slate-900/40 p-1 rounded-[2.5rem] border border-emerald-500/20 shadow-2xl relative overflow-hidden">
        <div className="bg-[#0f172a] p-6 rounded-[2.3rem] m-0.5 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-500"><BookOpen className="w-4 h-4" /></div>
            <h3 className="text-sm font-black text-white italic uppercase tracking-wider">القسم 1: بيانات المضخة الأساسية (PO)</h3>
          </div>

          <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 text-center space-y-4">
            <div>
              <p className="text-xs text-slate-300 font-bold mb-2 tracking-wide text-left" dir="ltr">Formula</p>
              <MathFormula
                formula={method === 1 ? 'PO = 0.000243 \\times ID^2 \\times L \\times Eff' : 'PO = \\frac{ID^2 \\times L}{4115.2}'}
                className="text-emerald-400 text-lg"
              />
            </div>
            <div className="pt-3 border-t border-emerald-500/10">
              <p className="text-xs text-slate-300 font-bold mb-2 tracking-wide text-left" dir="ltr">Substitution</p>
              <MathFormula
                formula={method === 1 
                  ? `PO = 0.000243 \\times ${dia || 0}^2 \\times ${len || 0} \\times ${eff || 0}` 
                  : `PO = \\frac{${dia || 0}^2 \\times ${len || 0}}{4115.2}`}
                className="text-emerald-300 text-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 text-right">
              <label className="text-[9px] font-bold text-slate-500 uppercase px-1 italic">Liner ID (in)</label>
              <input className="input-field !p-3 !text-lg !bg-slate-800/40 border-slate-700/50" type="number" value={dia} onChange={e => setDia(e.target.value)} />
            </div>
            <div className="space-y-1 text-right">
              <label className="text-[9px] font-bold text-slate-500 uppercase px-1 italic">Stroke Len (in)</label>
              <input className="input-field !p-3 !text-lg !bg-slate-800/40 border-slate-700/50" type="number" value={len} onChange={e => setLen(e.target.value)} />
            </div>
          </div>
          
          {method === 1 && (
            <div className="w-full space-y-1 text-right">
              <label className="text-[9px] font-bold text-slate-500 uppercase px-1 italic">Efficiency (Eff)</label>
              <input className="input-field !p-3 !text-lg !bg-slate-800/40 border-slate-700/50" type="number" value={eff} onChange={e => setEff(e.target.value)} />
            </div>
          )}

          <div className="flex items-center justify-between p-5 bg-emerald-600 rounded-[2rem] shadow-xl shadow-emerald-600/20">
            <div className="text-right">
               <span className="block text-[8px] font-black text-emerald-100 uppercase tracking-widest mb-1 italic">Result per Stroke (PO)</span>
               <span className="text-3xl font-black text-white">{po.toFixed(5)}</span>
            </div>
            <span className="text-xl font-bold text-emerald-100 italic">bbl/stk</span>
          </div>
        </div>
      </section>

      {/* القسم 2: حساب معدل التدفق (GPM & BPM) */}
      <section className="bg-slate-900/40 p-1 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="bg-[#0f172a] p-6 rounded-[2.3rem] m-0.5 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-500"><Activity className="w-4 h-4" /></div>
            <h3 className="text-sm font-black text-white italic uppercase tracking-wider">القسم 2: حساب معدل التدفق (Flow Rate)</h3>
          </div>

          <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 text-center space-y-4">
            <div className="space-y-2">
              <p className="text-xs text-slate-300 font-bold mb-1 tracking-wide text-left" dir="ltr">Formula</p>
              <MathFormula formula="GPM = PO \times 42 \times SPM" className="text-emerald-400 text-base" />
              <MathFormula formula="BPM = PO \times SPM" className="text-teal-400 text-base" />
            </div>
            <div className="pt-3 border-t border-slate-700/30">
              <p className="text-xs text-slate-300 font-bold mb-2 tracking-wide text-left" dir="ltr">Substitution</p>
              <MathFormula formula={`GPM = ${po.toFixed(5)} \\times 42 \\times ${spmForGpm || 0}`} className="text-emerald-300 text-lg" />
            </div>
          </div>
          
          <div className="space-y-1 text-right">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1 flex items-center justify-end gap-1">
                  Strokes (SPM) <Target className="w-3 h-3 text-emerald-500" />
              </label>
              <input className="input-field !p-4 !text-xl !bg-slate-800/40 border-slate-700/50 font-black text-emerald-400" type="number" value={spmForGpm} onChange={e => setSpmForGpm(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-emerald-500/20 text-center flex flex-col justify-center">
               <span className="block text-[8px] text-emerald-600 font-black mb-1 uppercase tracking-tighter italic">Flow (GPM)</span>
               <span className="text-2xl font-black text-emerald-400">{gpmResult.toFixed(2)}</span>
               <span className="text-[8px] text-slate-500 font-bold uppercase">gal/min</span>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-teal-500/20 text-center flex flex-col justify-center">
               <span className="block text-[8px] text-teal-600 font-black mb-1 uppercase tracking-tighter italic">Flow (BPM)</span>
               <span className="text-2xl font-black text-teal-400">{bpmResult.toFixed(3)}</span>
               <span className="text-[8px] text-slate-500 font-bold uppercase">bbl/min</span>
            </div>
          </div>
        </div>
      </section>

      {/* القسم 3: حساب السرعة المطلوبة (SPM) */}
      <section className="bg-slate-900/40 p-1 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="bg-[#0f172a] p-6 rounded-[2.3rem] m-0.5 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-teal-500/10 p-2 rounded-xl text-teal-500"><Zap className="w-4 h-4" /></div>
            <h3 className="text-sm font-black text-white italic uppercase tracking-wider">القسم 3: حساب السرعة المطلوبة (SPM)</h3>
          </div>

          <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 text-center space-y-4">
            <div>
              <p className="text-xs text-slate-300 font-bold mb-2 tracking-wide text-left" dir="ltr">Formula</p>
              <MathFormula formula="SPM = \frac{GPM}{PO \times 42}" className="text-teal-400 text-lg" />
            </div>
            <div className="pt-3 border-t border-slate-700/30">
              <p className="text-xs text-slate-300 font-bold mb-2 tracking-wide text-left" dir="ltr">Substitution</p>
              <MathFormula formula={`SPM = \\frac{${gpmDesired || 0}}{${po.toFixed(5)} \\times 42}`} className="text-teal-300 text-lg" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 items-end">
             <div className="bg-teal-500/5 p-4 rounded-2xl border border-teal-500/10 flex flex-col items-center justify-center h-full">
                <span className="text-[8px] text-slate-500 font-bold mb-1 italic uppercase tracking-tighter">Required SPM Result</span>
                <span className="text-2xl font-black text-teal-400">{spmResult.toFixed(2)}</span>
                <span className="text-[8px] text-teal-600 font-black uppercase">stk/min</span>
             </div>
             <div className="space-y-1 text-right">
                <label className="text-[9px] font-bold text-slate-400 uppercase px-1 flex items-center gap-1 justify-end italic">
                  Enter Desired GPM
                  <span className="bg-emerald-500/20 text-emerald-400 text-[7px] px-1 rounded animate-pulse">Sync</span>
                </label>
                <input className="input-field !p-3 !text-lg !bg-slate-800/40 border-emerald-500/30 text-emerald-400 font-black" type="number" value={gpmDesired} onChange={e => setGpmDesired(e.target.value)} />
             </div>
          </div>
        </div>
      </section>

      <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 flex items-start gap-4">
         <Calculator className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
         <div className="text-right">
           <p className="text-[10px] text-slate-400 leading-relaxed font-bold italic">
             نصيحة تقنية: تم عرض التدفق بالبرميل (BPM) بجانب الجالون (GPM) لتوفير رؤية شاملة. تذكر أن 1 برميل يساوي 42 جالون أمريكي.
           </p>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-6">
        <button onClick={() => window.location.reload()} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 font-black active:scale-95 transition-all shadow-2xl backdrop-blur-md">
           <RefreshCw className="w-5 h-5" /> تصفير البيانات
        </button>
        <button onClick={handleSave} className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/30 active:scale-95 transition-all">
           <Save className="w-5 h-5" /> حفظ التقرير
        </button>
      </div>
    </div>
  );
};

export default PumpMasterPro;
