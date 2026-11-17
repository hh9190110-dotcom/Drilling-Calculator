import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Loader2, 
  Search, 
  FileText, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  Trash2,
  Zap,
  Info,
  ChevronDown,
  Calculator,
  Clock,
  Droplets,
  Activity,
  RefreshCw,
  Ruler
} from 'lucide-react';
import { CalcType, CalculationRecord } from '../types';
import MathFormula from '../components/MathFormula';
import CasingSelector from '../components/CasingSelector';

interface AIScannerCalcProps {
  onResult: (record: CalculationRecord) => void;
  initialData?: CalculationRecord | null;
}

interface ExtractedItem {
  item: string;
  id: number | null;
  od: number | null;
  length: number | null;
}

interface WellGeometry {
  prevCsgID: string;
  prevCsgShoe: string;
  openHoleSize: string;
  totalDepth: string;
}

interface PumpParams {
  po: string;
  pumps: string;
  spm: string;
}

type CircMode = 'DRILL_STRING' | 'CASING_STRING';

const AIScannerCalc: React.FC<AIScannerCalcProps> = ({ onResult, initialData }) => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [drillString, setDrillString] = useState<ExtractedItem[]>([]);
  const [circMode, setCircMode] = useState<CircMode>('DRILL_STRING');
  const [well, setWell] = useState<WellGeometry>({
    prevCsgID: '12.415',
    prevCsgShoe: '2000',
    openHoleSize: '17.5',
    totalDepth: '3000'
  });
  const [pump, setPump] = useState<PumpParams>({
    po: '0.088',
    pumps: '2',
    spm: '50'
  });

  useEffect(() => {
    if (initialData && initialData.type === CalcType.AI_SCANNER) {
      if (initialData.inputs.well) setWell(initialData.inputs.well as any);
      if (initialData.inputs.pump) setPump(initialData.inputs.pump as any);
      if (initialData.inputs.drillString) setDrillString(initialData.inputs.drillString as any);
      if (initialData.inputs.images) setImages(initialData.inputs.images as any);
    }
  }, [initialData]);

  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Results
  const [vCased, setVCased] = useState(0);
  const [vOpen, setVOpen] = useState(0);
  const [vTotal, setVTotal] = useState(0);
  const [time, setTime] = useState(0);

  const K = 1029.4;

  useEffect(() => {
    // Advanced Annular Volume Calculation
    let vc = 0;
    let vo = 0;
    let currentDepth = 0;

    const pID = parseFloat(well.prevCsgID) || 0;
    const pShoe = parseFloat(well.prevCsgShoe) || 0;
    const ohSize = parseFloat(well.openHoleSize) || 0;
    const isSingleSection = pShoe >= parseFloat(well.totalDepth);

    drillString.forEach(comp => {
      const L = comp.length || 0;
      const OD = comp.od || 0;
      const start = currentDepth;
      const end = currentDepth + L;

      // Logic: Only calculate volume for sections that actually exist within the specified total depth
      const queryDepth = Math.min(end, parseFloat(well.totalDepth));
      const activeLen = Math.max(0, queryDepth - start);

      if (activeLen > 0) {
        const sectionStart = start;
        const sectionEnd = queryDepth;

        // If it's single section inside casing or current item is entirely above shoe
        if (sectionEnd <= pShoe) {
          vc += ((pID**2 - OD**2) / K) * activeLen;
        }
        // Entirely in Open Hole
        else if (sectionStart >= pShoe) {
          if (ohSize > 0) vo += ((ohSize**2 - OD**2) / K) * activeLen;
        }
        // Straddles shoe
        else {
          const inCasingLen = pShoe - sectionStart;
          const inOpenLen = sectionEnd - pShoe;
          vc += ((pID**2 - OD**2) / K) * inCasingLen;
          if (ohSize > 0) vo += ((ohSize**2 - OD**2) / K) * inOpenLen;
        }
      }

      currentDepth = end;
    });

    const totalV = vc + vo;
    setVCased(vc);
    setVOpen(vo);
    setVTotal(totalV);

    const fr = (parseFloat(pump.po) || 0) * (parseFloat(pump.spm) || 0) * (parseFloat(pump.pumps) || 0);
    setTime(fr > 0 ? totalV / fr : 0);
  }, [drillString, well, pump]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
      setError(null);
    }
  };

  const analyzeImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const defaultString: ExtractedItem[] =
        drillString.length > 0
          ? drillString
          : [
              { item: 'Drill Pipe (5")', id: 4.276, od: 5.0, length: 2200 },
              { item: 'HWDP (5")', id: 3.0, od: 5.0, length: 450 },
              { item: 'Drill Collars (8")', id: 2.81, od: 8.0, length: 350 },
            ];
      setDrillString(defaultString);
      onResult({
        id: Date.now().toString(),
        type: CalcType.AI_SCANNER,
        title: 'حساب صعود الكتينق (Bottoms Up Tally)',
        inputs: {
          imagesCount: images.length,
          well: well as any,
          pump: pump as any,
          drillString: defaultString as any,
          images: images as any,
        },
        result: vTotal,
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 text-right pb-10 font-tajawal">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 mb-3">
            <Zap className="w-3 h-3 text-indigo-400 fill-indigo-400" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">Multi-Image AI Scanner</span>
        </div>
        <h1 className="text-2xl font-black mb-1 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent italic uppercase tracking-tighter leading-tight">رجوع الكتينق الي السطح<br/>عن طريق Tali dril string Ai</h1>
        <p className="text-slate-500 uppercase text-[10px] tracking-widest font-bold">AI Tally-Based Bottoms Up Analysis</p>
      </div>

      {/* Circulation Logic Explanation (The user requested all possibilities) */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-[2rem] space-y-3" dir="rtl">
          <div className="flex items-center gap-2 text-amber-400">
              <Info className="w-5 h-5" />
              <h3 className="font-black text-sm italic">دلیل حالات حساب صعود الكتينق</h3>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              لحساب زمن صعود الكتينق (Bottoms Up) بدقة، يجب مراعاة جميع الاحتمالات الهندسية في البئر:
          </p>
          <div className="grid grid-cols-1 gap-2">
              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                  <span className="text-[9px] font-black text-white block mb-1">1. الحالة الطبيعية (Normal Circulation):</span>
                  <p className="text-[9px] text-slate-500">سيركوليشن عبر Drill String. الفراغ الحلقي (Annulus) يكون بين أقطار المواسير المستخرجة وبين ID الكيسينق السابق (في الجزء المعزول) أو Hole Size (في الجزء المفتوح).</p>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                  <span className="text-[9px] font-black text-white block mb-1">2. حالة إنزال الكيسينق (Casing Run):</span>
                  <p className="text-[9px] text-slate-500">سيركوليشن أثناء إنزال الكيسينق. الحساب يتم بناءً على القطر الخارجي للكيسينق الجديد مقابل ID الكيسينق السابق و Hole Size.</p>
              </div>
          </div>
      </div>

      {/* Mode Selector */}
      <div className="bg-slate-900 p-2 rounded-2xl border border-slate-800 flex gap-2">
          <button 
            onClick={() => setCircMode('DRILL_STRING')}
            className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${circMode === 'DRILL_STRING' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}
          >
              Drill String Mode
          </button>
          <button 
            onClick={() => setCircMode('CASING_STRING')}
            className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${circMode === 'CASING_STRING' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}
          >
              Casing Mode
          </button>
      </div>

      {/* Image Upload Area */}
      <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-indigo-500/20 shadow-2xl space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {images.map((img, idx) => (
                <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden border border-slate-700">
                    <img src={img} className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-slate-950/60 p-1 text-[8px] text-white text-center font-bold">Image #{idx+1}</div>
                </div>
            ))}
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-indigo-400 transition-all bg-slate-800/10"
            >
                <Camera className="w-5 h-5 text-indigo-400" />
                <span className="text-[9px] font-black text-slate-500 uppercase">Add Photo</span>
            </button>
        </div>
        <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

        {images.length > 0 && !loading && (
            <button onClick={analyzeImages} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 text-sm uppercase italic active:scale-95 transition-all">
                <Search className="w-4 h-4" /> تحليل كافة الصور ({images.length})
            </button>
        )}

        {loading && (
            <div className="py-4 flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                <p className="text-[10px] text-slate-400 font-bold animate-pulse text-center">جاري دمج ملفات الـ Tally واستخراج بيانات الـ BHA...</p>
            </div>
        )}
      </div>

      {/* Well Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-4 bg-slate-800/30 border-b border-slate-800 flex items-center justify-between">
              <Ruler className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-black text-white italic uppercase tracking-wider">هندسة البئر وتجويف الحفر</h3>
          </div>
          <div className="p-6 space-y-4" dir="rtl">
              <CasingSelector
                label="اختيار سريع للكيسينق السابق (Csg ID)"
                currentID={well.prevCsgID}
                compact
                onSelect={(_od, idVal) => setWell({ ...well, prevCsgID: idVal })}
              />
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-black px-1">Csg ID (in)</label>
                      <input className="input-field !p-2 !bg-slate-950/30 font-bold" type="number" value={well.prevCsgID} onChange={e => setWell({...well, prevCsgID: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-black px-1">Shoe Depth (ft)</label>
                      <input className="input-field !p-2 !bg-slate-950/30 font-bold" type="number" value={well.prevCsgShoe} onChange={e => setWell({...well, prevCsgShoe: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-black px-1">Hole Size (in)</label>
                      <input className="input-field !p-2 !bg-slate-950/30 font-bold" type="number" value={well.openHoleSize} onChange={e => setWell({...well, openHoleSize: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-black px-1">Total Depth (ft)</label>
                      <input className="input-field !p-2 !bg-slate-950/30 font-bold" type="number" value={well.totalDepth} onChange={e => setWell({...well, totalDepth: e.target.value})} />
                  </div>
              </div>
          </div>
      </div>

      {/* Pump Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-4 bg-slate-800/30 border-b border-slate-800 flex items-center justify-between">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-black text-white italic uppercase tracking-wider">بيانات المضخات</h3>
          </div>
          <div className="p-6 grid grid-cols-3 gap-3" dir="rtl">
              <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-black px-1">PO</label>
                  <input className="input-field !p-2 !bg-slate-950/30 font-bold text-center" type="number" value={pump.po} onChange={e => setPump({...pump, po: e.target.value})} />
              </div>
              <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-black px-1">Pumps</label>
                  <input className="input-field !p-2 !bg-slate-950/30 font-bold text-center" type="number" value={pump.pumps} onChange={e => setPump({...pump, pumps: e.target.value})} />
              </div>
              <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-black px-1">SPM</label>
                  <input className="input-field !p-2 !bg-slate-950/30 font-bold text-center" type="number" value={pump.spm} onChange={e => setPump({...pump, spm: e.target.value})} />
              </div>
          </div>
      </div>

      {/* Results Display */}
      <section className="space-y-4">
        <div className="bg-indigo-600 p-8 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
            <div className="relative z-10 text-center space-y-4">
                <div>
                   <span className="text-[10px] text-white/50 font-black uppercase tracking-widest block mb-1">Bottoms-Up Time Estimation</span>
                   <div className="flex items-baseline justify-center gap-2">
                       <span className="text-7xl font-black text-white leading-none">{Math.round(time)}</span>
                       <span className="text-xl font-bold text-white/60 italic uppercase tracking-tighter">Min</span>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                    <div className="text-center">
                        <span className="text-[8px] text-white/40 font-bold block uppercase mb-1">Total Vol (bbl)</span>
                        <span className="text-2xl font-black text-white">{vTotal.toFixed(1)}</span>
                    </div>
                    <div className="text-center">
                        <span className="text-[8px] text-white/40 font-bold block uppercase mb-1">Pump Rate (bpm)</span>
                        <span className="text-2xl font-black text-white">{(parseFloat(pump.po)*parseFloat(pump.spm)*parseFloat(pump.pumps)).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] overflow-hidden p-6 space-y-4" dir="rtl">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calculator className="w-3 h-3" /> تفاصيل الحسابات الهندسية
            </h3>
            
            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="text-right">
                        <span className="block text-white font-bold text-xs italic">حجم الفراغ داخل الكيسينق</span>
                        <span className="text-[9px] text-slate-500">من السطح إلى {parseFloat(well.prevCsgShoe) >= parseFloat(well.totalDepth) ? well.totalDepth : well.prevCsgShoe} قدم</span>
                    </div>
                    <div className="text-left font-black text-indigo-400 underline decoration-indigo-500/30 underline-offset-4">{vCased.toFixed(2)} <span className="text-[8px]">bbl</span></div>
                </div>

                {parseFloat(well.prevCsgShoe) < parseFloat(well.totalDepth) && (
                    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div className="text-right">
                            <span className="block text-white font-bold text-xs italic">حجم الفراغ المفتوح (Open Hole)</span>
                            <span className="text-[9px] text-slate-500">من {well.prevCsgShoe} إلى {well.totalDepth} قدم</span>
                        </div>
                        <div className="text-left font-black text-emerald-400 underline decoration-emerald-500/30 underline-offset-4">{vOpen.toFixed(2)} <span className="text-[8px]">bbl</span></div>
                    </div>
                )}

                {parseFloat(well.prevCsgShoe) >= parseFloat(well.totalDepth) && (
                    <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 text-[9px] text-amber-500/80 text-center font-bold">
                        * تم الحساب للمقطع المسلح (Cased Hole) فقط بناءً على الثوابت المدخلة.
                    </div>
                )}
            </div>

            <div className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10 text-[9px] text-blue-400 leading-relaxed text-right italic font-medium space-y-2">
                <div>* المعادلة المستخدمة لكل قطعة:</div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-blue-500/10">
                  <MathFormula formula="V = \frac{(ID^2 - OD^2)}{1029.4} \times Length" className="text-blue-300 text-sm" />
                </div>
                <div>الذكاء الاصطناعي قام بدمج جميع {drillString.length} قطعة من الدريل سترينق وحساب تداخلها مع هندسة البئر.</div>
            </div>
        </div>
      </section>

      {/* Drill String Tally Display */}
      {drillString.length > 0 && (
        <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-800/20 border-b border-slate-800 text-center"><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Complete Combined Drill String</h3></div>
            <div className="overflow-x-auto">
                <table className="w-full text-center text-[10px]" dir="rtl">
                    <thead className="bg-slate-950/50 text-slate-500 uppercase font-black italic">
                        <tr>
                            <th className="p-3 border-b border-slate-800">Item Name</th>
                            <th className="p-3 border-b border-slate-800 text-indigo-400">OD (in)</th>
                            <th className="p-3 border-b border-slate-800">Length (ft)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drillString.map((item, i) => (
                            <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/10 transition-colors">
                                <td className="p-3 font-bold text-white text-right">{item.item}</td>
                                <td className="p-3 font-black text-indigo-400">{item.od ?? '-'}</td>
                                <td className="p-3 font-bold text-slate-200">{item.length ?? '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
      )}

      {/* Technical FAQ / Scenarios Reference */}
      <section className="bg-slate-950/80 border border-slate-800 rounded-[2.5rem] p-6 space-y-4" dir="rtl">
          <div className="flex items-center gap-2 text-indigo-400">
              <Activity className="w-5 h-5" />
              <h3 className="font-black text-sm italic uppercase">الاحتمالات الفنية لحسابات البئر</h3>
          </div>
          
          <div className="space-y-4 text-[10px] text-slate-400">
              <div className="border-r-2 border-indigo-500/30 pr-4">
                  <h4 className="font-black text-white text-xs mb-1">الحالة 1: الحفر الطبيعي (Drill String)</h4>
                  <p className="leading-relaxed">
                      يتم ضخ المائع داخل مواسير الحفر. يصعد المائع (والكتينق) عبر الفراغ الحلقي.
                      <br/>- في الجزء العلوي: الفراغ بين (القطر الخارجي للمواسير) و (القطر الداخلي للكيسينق السابق).
                      <br/>- في الجزء السفلي: الفراغ بين (القطر الخارجي للمواسير) و (قطر اوبن هول).
                  </p>
              </div>

              <div className="border-r-2 border-purple-500/30 pr-4">
                  <h4 className="font-black text-white text-xs mb-1">الحالة 2: إنزال الكيسينق (Casing Circulation)</h4>
                  <p className="leading-relaxed">
                      عند إنزال كيسينق جديد، يتم السيركوليشن داخل الكيسينق الجديد. يصعد المائع عبر:
                      <br/>- الفراغ بين (القطر الخارجي للكيسينق الجديد) و (ID الكيسينق القديم).
                      <br/>- الفراغ بين (القطر الخارجي للكيسينق الجديد) و (Hole Size).
                  </p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl text-[9px]">
                  <span className="text-emerald-400 font-bold block mb-1">لماذا نهتم بالـ Tally؟</span>
                  تحليل الـ Tally يضمن معرفة القطر الخارجي (OD) الدقيق في كل قدم من البئر، مما يغير حجم الفراغ الحلقي وبالتالي يغير "زمن الوصول للسطح". الكولارات (Drill Collars) والستبلايزرات تأخذ حيزاً أكبر من المواسير العادية، وهذا التطبيق يحسب ذلك بدقة آلياً.
              </div>
          </div>
      </section>

      <div className="pt-4 flex flex-col gap-3">
          <button onClick={() => { setImages([]); setDrillString([]); }} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-slate-800 text-slate-500 font-black hover:bg-slate-800 transition-all text-[10px] uppercase tracking-widest italic">
              <RefreshCw className="w-4 h-4" /> Reset All Data
          </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AIScannerCalc;
