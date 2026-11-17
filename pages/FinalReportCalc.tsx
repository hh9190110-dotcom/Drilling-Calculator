import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, FileText, Ruler, MapPin } from 'lucide-react';
import { CalcType, CalculationRecord } from '../types';
import MathFormula from '../components/MathFormula';

interface FinalReportCalcProps {
  onResult: (record: CalculationRecord) => void;
  initialData?: CalculationRecord | null;
}

const FinalReportCalc: React.FC<FinalReportCalcProps> = ({ onResult, initialData }) => {
  const [tvd, setTvd] = useState<string>('1524');
  const [gl, setGl] = useState<string>('622');
  const [subsea, setSubsea] = useState<number>(0);

  useEffect(() => {
    if (initialData && initialData.type === CalcType.FINAL_REPORT) {
      setTvd(String(initialData.inputs.TVD || ''));
      setGl(String(initialData.inputs.GL || ''));
    }
  }, [initialData]);

  const handleSave = () => {
    onResult({
      id: Date.now().toString(),
      type: CalcType.FINAL_REPORT,
      title: 'تقرير نهائي (Final Report)',
      inputs: { TVD: tvd, GL: gl },
      result: subsea,
      timestamp: Date.now()
    });
    alert('تم حفظ تقرير Subsea بنجاح');
  };

  return (
    <div className="space-y-6 text-right pb-10">
      <div className="text-center">
        <h1 className="text-3xl font-black mb-1 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent italic uppercase tracking-tighter">Final Report</h1>
        <p className="text-blue-500 uppercase text-xs tracking-widest font-bold">Geological & Drilling Final Analysis</p>
      </div>

      <div className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-blue-500/20 shadow-2xl space-y-6">
        <div className="flex items-center justify-between mb-2">
            <div className="bg-blue-500/10 p-2 rounded-xl text-blue-500"><FileText className="w-4 h-4" /></div>
            <h3 className="text-sm font-black text-white italic uppercase tracking-wider">مساحة Subsea</h3>
        </div>
        
        <div className="bg-blue-500/5 p-5 rounded-2xl border border-blue-500/10 text-center space-y-4" dir="ltr">
            <div className="space-y-1">
                <p className="text-xs text-slate-300 font-bold tracking-wide text-left">Formula</p>
                <MathFormula formula="Subsea = GL - TVD" className="text-blue-400 text-lg" />
            </div>
            <div className="pt-3 border-t border-blue-500/10 space-y-1">
                <p className="text-xs text-slate-300 font-bold tracking-wide text-left">Substitution</p>
                <MathFormula formula={`Subsea = ${gl || 0} - ${tvd || 0}`} className="text-blue-300 text-lg" />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2 text-right">
                <label className="text-[10px] font-black text-slate-400 uppercase px-1 flex items-center justify-end gap-1 italic">
                    TVD (ft) <Ruler className="w-3 h-3 text-blue-400" />
                </label>
                <input 
                    className="input-field !text-xl !p-3 !bg-slate-800/50 border-slate-700 focus:border-blue-500" 
                    type="number" 
                    value={tvd} 
                    onChange={e => setTvd(e.target.value)} 
                />
            </div>

            <div className="space-y-2 text-right">
                <label className="text-[10px] font-black text-slate-400 uppercase px-1 flex items-center justify-end gap-1 italic">
                    Ground Level (ft) <MapPin className="w-3 h-3 text-blue-400" />
                </label>
                <input 
                    className="input-field !text-xl !p-3 !bg-slate-800/50 border-slate-700 focus:border-blue-500" 
                    type="number" 
                    value={gl} 
                    onChange={e => setGl(e.target.value)} 
                />
            </div>
        </div>

        <div className="bg-blue-600/20 p-8 rounded-[3rem] text-center border border-blue-500/30 shadow-2xl relative overflow-hidden">
            <p className="text-blue-400 text-xs font-black mb-1 uppercase tracking-widest italic">Subsea Result</p>
            <div className="flex items-baseline justify-center gap-2 relative z-10">
                <span className="text-6xl font-black text-white">{subsea.toFixed(0)}</span>
                <span className="text-lg font-bold text-blue-300 italic uppercase">ft</span>
            </div>
            <div className="mt-3">
              <MathFormula formula={`Subsea = ${gl || 0} - ${tvd || 0}`} className="text-slate-400 text-sm" />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <button onClick={() => { setTvd(''); setGl(''); }} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-slate-700 text-slate-500 font-black hover:bg-slate-800 transition-all shadow-xl">
              <RefreshCw className="w-5 h-5" /> تصفير
          </button>
          <button onClick={handleSave} className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/30 active:scale-95 transition-all">
              <Save className="w-5 h-5" /> حفظ التقرير
          </button>
      </div>
    </div>
  );
};

export default FinalReportCalc;
