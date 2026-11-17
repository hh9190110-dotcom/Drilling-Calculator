
import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Layers, Anchor, Target, Activity, Calculator, ChevronRight } from 'lucide-react';
import { CalculationRecord, CalcType } from '../types';
import MathFormula from '../components/MathFormula';

interface DrillStringStrokesProps {
  onResult?: (record: CalculationRecord) => void;
  initialData?: CalculationRecord | null;
}

const DrillStringStrokes: React.FC<DrillStringStrokesProps> = ({ onResult, initialData }) => {
  // 1. Drill Pipe
  const [dpId, setDpId] = useState<string>('4.276');
  const [dpLen, setDpLen] = useState<string>('1000');
  
  // 2. HWDP
  const [hwdpId, setHwdpId] = useState<string>('3');
  const [hwdpLen, setHwdpLen] = useState<string>('250');
  
  // 3. Drill Collar
  const [dcId, setDcId] = useState<string>('3');
  const [dcLen, setDcLen] = useState<string>('250');

  // 4. Pump Data
  const [po, setPo] = useState<string>('0.10615');

  useEffect(() => {
    if (initialData && initialData.type === CalcType.DRILL_STRING_STROKES) {
      const { inputs } = initialData;
      setDpId(String(inputs.DP_ID || ''));
      setDpLen(String(inputs.DP_Len || ''));
      setHwdpId(String(inputs.HWDP_ID || ''));
      setHwdpLen(String(inputs.HWDP_Len || ''));
      setDcId(String(inputs.DC_ID || ''));
      setDcLen(String(inputs.DC_Len || ''));
      setPo(String(inputs.PO || ''));
    }
  }, [initialData]);

  // Calculated Results
  const [dpCap, setDpCap] = useState<number>(0);
  const [hwdpCap, setHwdpCap] = useState<number>(0);
  const [dcCap, setDcCap] = useState<number>(0);
  const [totalCap, setTotalCap] = useState<number>(0);
  const [strokes, setStrokes] = useState<number>(0);
  const [spm, setSpm] = useState<string>('60');
  const [pumpTime, setPumpTime] = useState<number>(0);

  const K = 1029.4;

  useEffect(() => {
    const dId = parseFloat(dpId) || 0;
    const dL = parseFloat(dpLen) || 0;
    const hId = parseFloat(hwdpId) || 0;
    const hL = parseFloat(hwdpLen) || 0;
    const cId = parseFloat(dcId) || 0;
    const cL = parseFloat(dcLen) || 0;
    const pumpO = parseFloat(po) || 0;

    const resDp = (Math.pow(dId, 2) / K) * dL;
    const resHwdp = (Math.pow(hId, 2) / K) * hL;
    const resDc = (Math.pow(cId, 2) / K) * cL;
    const total = resDp + resHwdp + resDc;
    
    setDpCap(resDp);
    setHwdpCap(resHwdp);
    setDcCap(resDc);
    setTotalCap(total);
    
    if (pumpO > 0) {
      const totalStrokes = total / pumpO;
      setStrokes(totalStrokes);
      const sMin = parseFloat(spm) || 0;
      if (sMin > 0) {
        setPumpTime(totalStrokes / sMin);
      } else {
        setPumpTime(0);
      }
    } else {
      setStrokes(0);
      setPumpTime(0);
    }
  }, [dpId, dpLen, hwdpId, hwdpLen, dcId, dcLen, po, spm]);

  const handleSave = () => {
    if (totalCap === 0 || !onResult) return;
    onResult({
      id: Date.now().toString(),
      type: CalcType.DRILL_STRING_STROKES,
      title: 'سعة سلسلة الحفر والضربات',
      inputs: { 
        DP_ID: dpId, DP_Len: dpLen, 
        HWDP_ID: hwdpId, HWDP_Len: hwdpLen, 
        DC_ID: dcId, DC_Len: dcLen, 
        PO: po 
      },
      result: strokes,
      timestamp: Date.now()
    });
    alert('تم حفظ التقرير في السجل');
  };

  return (
    <div className="space-y-8 text-right pb-32 animate-in fade-in duration-500">
      <header className="text-center">
        <h1 className="text-3xl font-black mb-1 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent italic uppercase tracking-tighter">Drill String Pro</h1>
        <p className="text-[10px] text-purple-500 font-bold uppercase tracking-widest">Strokes to Surface Analysis</p>
      </header>

      {/* المخلص النهائي */}
      <section className="bg-purple-900/20 p-1 rounded-[2.5rem] border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="bg-[#0f172a] p-6 rounded-[2.3rem] m-0.5 space-y-6">
           <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">إجمالي الضربات المطلوبة (Required Strokes)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-white">{Math.ceil(strokes)}</span>
                <span className="text-xl font-bold text-purple-400 italic">strokes</span>
              </div>
              
              <div className="mt-2 flex items-center gap-3 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Pump Time:</span>
                    <span className="text-sm font-black text-emerald-400">{pumpTime.toFixed(2)}</span>
                    <span className="text-[9px] font-bold text-emerald-500/60 uppercase">min</span>
                  </div>
                  <div className="w-px h-3 bg-slate-700" />
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Rate:</span>
                    <span className="text-sm font-black text-blue-400">{(parseFloat(po) * (parseFloat(spm) || 0)).toFixed(2)}</span>
                    <span className="text-[9px] font-bold text-blue-500/60 uppercase">bpm</span>
                  </div>
              </div>

              <div className="mt-4 p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 w-full flex justify-between items-center">
                 <span className="text-2xl font-black text-purple-300">{totalCap.toFixed(2)} <span className="text-xs">bbl</span></span>
                 <span className="text-[10px] font-black text-slate-500 uppercase">Total Capacity</span>
              </div>
           </div>
        </div>
      </section>
      
      {/* شرح مبسط */}
      <section className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <Calculator className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-black text-white italic uppercase">شرح مبسط: ضربات سلسلة الحفر</h3>
        </div>
        <div className="space-y-4 text-right" dir="rtl">
          <div>
            <span className="text-blue-400 font-black block mb-1 text-sm italic uppercase tracking-wider">1. ما هي ضربات سلسلة الحفر؟</span>
            <p className="text-xs text-slate-400 font-bold leading-relaxed">
              هي إجمالي عدد "ضربات" المضخة (Strokes) المطلوبة لنقل السائل من السطح (المضخات) عبر سلسلة الحفر (Drill String) حتى يصل إلى قاع البئر (Bit).
            </p>
          </div>
          <div>
            <span className="text-blue-400 font-black block mb-1 text-sm italic uppercase tracking-wider">2. كيف يتم الحساب؟</span>
            <p className="text-xs text-slate-400 font-bold leading-relaxed">
              أولاً، نحسب السعة الداخلية لكل نوع من أنواع المواسير المستخدمة (DP, HWDP, DC) بضرب (القطر الداخلي² / 1029.4) في طول المواسير. <br/>
              ثانياً، نجمع كل هذه السعات لنحصل على "إجمالي سعة سلسلة الحفر". <br/>
              ثالثاً، نقسم إجمالي السعة على "خرج المضخة" (PO) لنعرف عدد الضربات.
            </p>
          </div>
          <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 text-center space-y-2" dir="ltr">
            <p className="text-xs text-slate-300 font-bold tracking-wide text-left">Formula</p>
            <MathFormula formula="Strokes = \frac{Total\ Capacity\ (bbl)}{Pump\ Output\ (bbl/stk)}" className="text-blue-400 text-base" />
          </div>
        </div>
      </section>

      {/* 1. Drill Pipe Calculation */}
      <section className="bg-slate-900/40 p-1 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden">
        <div className="bg-[#0f172a] p-6 rounded-[2.3rem] m-0.5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg italic">{dpCap.toFixed(2)} bbl</span>
            <h3 className="text-sm font-black text-white italic uppercase tracking-wider">1. Drill Pipe Capacity</h3>
          </div>
          <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 text-center space-y-4">
            <div>
              <p className="text-xs text-slate-300 font-bold mb-2 tracking-wide text-left" dir="ltr">Formula</p>
              <MathFormula formula="Cap = \frac{ID^2}{1029.4} \times L" className="text-blue-400 text-base" />
            </div>
            <div className="pt-3 border-t border-slate-700/30">
              <p className="text-xs text-slate-300 font-bold mb-2 tracking-wide text-left" dir="ltr">Substitution</p>
              <MathFormula formula={`Cap = \\frac{${dpId || 0}^2}{1029.4} \\times ${dpLen || 0}`} className="text-white text-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase px-1">ID (in)</label>
              <input className="input-field !p-3 !text-lg" type="number" value={dpId} onChange={e => setDpId(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase px-1">Length (ft)</label>
              <input className="input-field !p-3 !text-lg" type="number" value={dpLen} onChange={e => setDpLen(e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. HWDP Calculation */}
      <section className="bg-slate-900/40 p-1 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden">
        <div className="bg-[#0f172a] p-6 rounded-[2.3rem] m-0.5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg italic">{hwdpCap.toFixed(3)} bbl</span>
            <h3 className="text-sm font-black text-white italic uppercase tracking-wider">2. HWDP Capacity</h3>
          </div>
          <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 text-center space-y-4">
            <div>
              <p className="text-xs text-slate-300 font-bold mb-2 tracking-wide text-left" dir="ltr">Formula</p>
              <MathFormula formula="Cap = \frac{ID^2}{1029.4} \times L" className="text-indigo-400 text-base" />
            </div>
            <div className="pt-3 border-t border-slate-700/30">
              <p className="text-xs text-slate-300 font-bold mb-2 tracking-wide text-left" dir="ltr">Substitution</p>
              <MathFormula formula={`Cap = \\frac{${hwdpId || 0}^2}{1029.4} \\times ${hwdpLen || 0}`} className="text-white text-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase px-1">ID (in)</label>
              <input className="input-field !p-3 !text-lg" type="number" value={hwdpId} onChange={e => setHwdpId(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase px-1">Length (ft)</label>
              <input className="input-field !p-3 !text-lg" type="number" value={hwdpLen} onChange={e => setHwdpLen(e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Drill Collar Calculation */}
      <section className="bg-slate-900/40 p-1 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden">
        <div className="bg-[#0f172a] p-6 rounded-[2.3rem] m-0.5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg italic">{dcCap.toFixed(3)} bbl</span>
            <h3 className="text-sm font-black text-white italic uppercase tracking-wider">3. Drill Collar Capacity</h3>
          </div>
          <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 text-center space-y-4">
            <div>
              <p className="text-xs text-slate-300 font-bold mb-2 tracking-wide text-left" dir="ltr">Formula</p>
              <MathFormula formula="Cap = \frac{ID^2}{1029.4} \times L" className="text-emerald-400 text-base" />
            </div>
            <div className="pt-3 border-t border-slate-700/30">
              <p className="text-xs text-slate-300 font-bold mb-2 tracking-wide text-left" dir="ltr">Substitution</p>
              <MathFormula formula={`Cap = \\frac{${dcId || 0}^2}{1029.4} \\times ${dcLen || 0}`} className="text-white text-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase px-1">ID (in)</label>
              <input className="input-field !p-3 !text-lg" type="number" value={dcId} onChange={e => setDcId(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase px-1">Length (ft)</label>
              <input className="input-field !p-3 !text-lg" type="number" value={dcLen} onChange={e => setDcLen(e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pump Data */}
      <section className="bg-slate-900/40 p-1 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden">
        <div className="bg-[#0f172a] p-6 rounded-[2.3rem] m-0.5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-black text-white italic uppercase tracking-wider">4. Pump Data (PO)</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 text-right">
               <label className="text-[9px] font-bold text-slate-400 uppercase px-1 italic">Pump Output (bbl/stk)</label>
               <input className="input-field !p-3 !text-lg font-black text-purple-400 text-center" type="number" value={po} onChange={e => setPo(e.target.value)} />
            </div>
            <div className="space-y-1 text-right">
               <label className="text-[9px] font-bold text-slate-400 uppercase px-1 italic">Pump Speed (SPM)</label>
               <input className="input-field !p-3 !text-lg font-black text-purple-400 text-center" type="number" value={spm} onChange={e => setSpm(e.target.value)} />
            </div>
          </div>
          <div className="bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/10 text-center">
            <p className="text-[10px] text-emerald-500/70 font-bold mb-1 italic uppercase tracking-widest">تحليل زمن الضخ (Pump Time Analysis)</p>
            <div className="flex justify-center items-baseline gap-2">
              <span className="text-2xl font-black text-white">{pumpTime.toFixed(2)}</span>
              <span className="text-xs font-bold text-emerald-400 italic uppercase">Minutes</span>
            </div>
            <p className="text-[9px] text-slate-500 mt-1 font-medium">الزمن اللازم لضخ إجمالي السعة ({totalCap.toFixed(2)} bbl)</p>
          </div>
        </div>
      </section>

      <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 flex items-start gap-4">
         <Calculator className="w-6 h-6 text-purple-400 shrink-0 mt-1" />
         <div className="text-right">
           <p className="text-[10px] text-slate-400 leading-relaxed font-bold italic">
             ملاحظة: تأكد دائماً من استخدام القطر الداخلي (ID) للمواسير وليس القطر الخارجي (OD) للحصول على سعة دقيقة.
           </p>
         </div>
      </div>

      <div className="fixed bottom-6 left-6 right-6 grid grid-cols-2 gap-4 z-50">
        <button onClick={() => window.location.reload()} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 font-black active:scale-95 transition-all shadow-2xl backdrop-blur-md">
           <RefreshCw className="w-5 h-5" /> تصفير
        </button>
        <button onClick={handleSave} className="flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-2xl font-black shadow-xl shadow-purple-500/30 active:scale-95 transition-all">
           <Save className="w-5 h-5" /> حفظ التقرير
        </button>
      </div>
    </div>
  );
};

export default DrillStringStrokes;
