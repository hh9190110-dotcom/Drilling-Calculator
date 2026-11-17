import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Loader2, 
  Search, 
  Trash2, 
  Zap, 
  Info, 
  Droplets, 
  Ruler, 
  Activity,
  RefreshCw,
  MoveDown,
  Target,
  RotateCw,
  Plus
} from 'lucide-react';
import { CalcType, CalculationRecord } from '../types';

interface SpotCalcProps {
  onResult: (record: CalculationRecord) => void;
  initialData?: CalculationRecord | null;
}

interface ExtractedItem {
  item: string;
  id: number | null;
  od: number | null;
  length: number | null;
}

interface PumpParams {
  po: string;
  spm: string;
}

const SpotCalc: React.FC<SpotCalcProps> = ({ onResult, initialData }) => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [drillString, setDrillString] = useState<ExtractedItem[]>([]);
  const [spotVolume, setSpotVolume] = useState<string>('20');
  const [holeSize, setHoleSize] = useState<string>('12.25');
  const [pump, setPump] = useState<PumpParams>({
    po: '0.088',
    spm: '50'
  });

  useEffect(() => {
    if (initialData && initialData.type === CalcType.SPOT) {
      if (initialData.inputs.spotVolume) setSpotVolume(String(initialData.inputs.spotVolume));
      if (initialData.inputs.holeSize) setHoleSize(String(initialData.inputs.holeSize));
      if (initialData.inputs.pump) setPump(initialData.inputs.pump as any);
      if (initialData.inputs.drillString) setDrillString(initialData.inputs.drillString as any);
      if (initialData.inputs.images) setImages(initialData.inputs.images as any);
    }
  }, [initialData]);

  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Results
  const [fillHeight, setFillHeight] = useState(0);
  const [displacement, setDisplacement] = useState(0);
  const [strokes, setStrokes] = useState(0);
  const [time, setTime] = useState(0);

  const K = 1029.4;

  useEffect(() => {
    if (drillString.length === 0) return;

    const vol = parseFloat(spotVolume) || 0;
    const oh = parseFloat(holeSize) || 0;
    const po = parseFloat(pump.po) || 0;
    const spm = parseFloat(pump.spm) || 0;

    // 1. Annular Fill Height Logic (Start from bottom)
    let remainingVol = vol;
    let totalHeight = 0;
    const reversedString = [...drillString].reverse();

    for (const comp of reversedString) {
      if (remainingVol <= 0) break;
      const od = comp.od || 0;
      const len = comp.length || 0;
      const ringCap = (oh**2 - od**2) / K;
      const maxVolInThisSection = ringCap * len;

      if (remainingVol <= maxVolInThisSection) {
        totalHeight += remainingVol / ringCap;
        remainingVol = 0;
      } else {
        totalHeight += len;
        remainingVol -= maxVolInThisSection;
      }
    }
    setFillHeight(totalHeight);

    // 2. Internal Displacement Logic (Total internal volume of the string)
    let totalInternalVol = 0;
    drillString.forEach(comp => {
      const id = comp.id || 0;
      const len = comp.length || 0;
      const cap = (id**2) / K;
      totalInternalVol += (cap * len);
    });

    setDisplacement(totalInternalVol);
    
    // 3. Strokes & Time
    if (po > 0) {
      const stk = totalInternalVol / po;
      setStrokes(stk);
      if (spm > 0) {
        setTime(stk / spm);
      }
    }
  }, [drillString, spotVolume, holeSize, pump]);

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
      const defaultBha: ExtractedItem[] =
        drillString.length > 0
          ? drillString
          : [
              { item: 'Drill Bit', od: parseFloat(holeSize) || 12.25, id: 0, length: 3 },
              { item: 'Mud Motor / Near Bit', od: 8.0, id: 2.81, length: 30 },
              { item: 'Drill Collars (DC)', od: 8.0, id: 2.81, length: 360 },
              { item: 'Heavy Weight DP (HWDP)', od: 5.0, id: 3.0, length: 450 },
              { item: 'Drill Pipe (DP)', od: 5.0, id: 4.276, length: 3500 },
            ];
      setDrillString(defaultBha);
      onResult({
        id: Date.now().toString(),
        type: CalcType.SPOT,
        title: `حساب Spotting (${spotVolume} bbl)`,
        inputs: {
          spotVolume,
          holeSize,
          pump: pump as any,
          drillString: defaultBha as any,
          images: images as any,
        },
        result: fillHeight,
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
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 mb-3">
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">AI Spotting Engine</span>
        </div>
        <h1 className="text-3xl font-black mb-1 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent italic uppercase tracking-tighter">AI Spotting Calc</h1>
        <p className="text-slate-500 uppercase text-[10px] tracking-widest font-bold font-mono">Spotting pill height at the bottom</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-2xl space-y-6">
        <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1 flex items-center justify-end gap-1">
                   Hole Size (in) <Ruler className="w-3 h-3 text-amber-400" />
                </label>
                <input 
                    className="input-field !p-3 !bg-slate-800/50 border-slate-700 font-black text-white text-center text-xl" 
                    type="number" 
                    value={holeSize} 
                    onChange={e => setHoleSize(e.target.value)} 
                />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1 flex items-center justify-end gap-1">
                   Spot Vol (bbl) <Droplets className="w-3 h-3 text-amber-400" />
                </label>
                <input 
                    className="input-field !p-3 !bg-orange-500/10 border-orange-500/30 font-black text-orange-400 text-center text-xl" 
                    type="number" 
                    value={spotVolume} 
                    onChange={e => setSpotVolume(e.target.value)} 
                />
             </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1 flex items-center justify-end gap-1">
                   Pump Output (bbl/stk) <Activity className="w-3 h-3 text-emerald-400" />
                </label>
                <input 
                    className="input-field !p-3 !bg-slate-800/50 border-slate-700 font-black text-white text-center text-sm" 
                    type="number" 
                    step="0.001"
                    value={pump.po} 
                    onChange={e => setPump(prev => ({...prev, po: e.target.value}))} 
                />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1 flex items-center justify-end gap-1">
                   Pump Speed (SPM) <RotateCw className="w-3 h-3 text-emerald-400" />
                </label>
                <input 
                    className="input-field !p-3 !bg-slate-800/50 border-slate-700 font-black text-white text-center text-sm" 
                    type="number" 
                    value={pump.spm} 
                    onChange={e => setPump(prev => ({...prev, spm: e.target.value}))} 
                />
             </div>
        </div>

        {!loading && (
          <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-slate-800/50 group">
                        <img src={img} className="w-full h-full object-cover" />
                        <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                ))}
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center bg-slate-800/10 hover:border-amber-400 transition-all"
                >
                    <Camera className="w-5 h-5 text-amber-500" />
                    <span className="text-[8px] font-black text-slate-500 uppercase">Add Tally</span>
                </button>
              </div>
              <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              
              {images.length > 0 && (
                <button onClick={analyzeImages} className="w-full py-4 bg-amber-600 text-white rounded-2xl font-black shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm uppercase italic active:scale-95 transition-all">
                    <Search className="w-4 h-4" /> تحليل التيلي وحساب الـ Spot
                </button>
              )}
          </div>
        )}

        {loading && (
            <div className="py-8 flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
                <p className="text-xs text-slate-400 font-bold animate-pulse text-center">جاري تحليل التيلي وحساب الطول في الفراغ الحلقي...</p>
            </div>
        )}

        {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-bold text-center italic">
                {error}
            </div>
        )}
      </div>

      {/* Main Result */}
      <div className="bg-slate-950 border border-slate-800 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-center space-y-6 p-1">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 rounded-[3.5rem] shadow-xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-white/50" />
                  <span className="text-[10px] text-white/70 font-black uppercase tracking-widest italic font-mono">Pill Fill Height in Annulus</span>
              </div>
              <div className="flex items-baseline justify-center gap-2">
                  <span className="text-7xl font-black text-white leading-none">{fillHeight.toFixed(0)}</span>
                  <span className="text-xl font-bold text-white/60 italic uppercase">ft</span>
              </div>
              <p className="text-[10px] text-white/40 mt-2 font-black uppercase tracking-widest">Height above Bottom</p>
          </div>

          <div className="p-6 grid grid-cols-3 gap-3" dir="rtl">
              <div className="bg-slate-900/50 rounded-3xl p-4 border border-slate-800">
                  <span className="block text-[8px] text-slate-500 font-bold uppercase mb-1">الازاحة للوصول للقاع</span>
                  <span className="text-xl font-black text-white">{displacement.toFixed(1)} <span className="text-[8px] text-slate-500">bbl</span></span>
              </div>
              <div className="bg-slate-900/50 rounded-3xl p-4 border border-slate-800">
                  <span className="block text-[8px] text-slate-500 font-bold uppercase mb-1">عدد الضربات (Stks)</span>
                  <span className="text-xl font-black text-white">{strokes.toFixed(0)}</span>
              </div>
              <div className="bg-slate-900/50 rounded-3xl p-4 border border-slate-800">
                  <span className="block text-[8px] text-slate-500 font-bold uppercase mb-1">الوقت المتوقع</span>
                  <span className="text-xl font-black text-emerald-400">{time.toFixed(1)} <span className="text-[8px] text-slate-500">min</span></span>
              </div>
          </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 space-y-4" dir="rtl">
          <div className="flex items-center gap-2 text-amber-500">
              <Info className="w-5 h-5" />
              <h3 className="font-black text-sm italic uppercase">لماذا نستخدم الذكاء الاصطناعي هنا؟</h3>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
             عند وضع pill (Spotting) في قاع البئر، من الضروري معرفة الأقطار الخارجية (OD) لمكونات الـ BHA (مثل المثقاب، الموتور، الكولارات). 
             الذكاء الاصطناعي يقرأ التيلي ويحسب بالضبط كم ستغطي الـ 20 برميل من طول الـ BHA، لأن الكولارات تأخذ حيزاً أكبر من المواسير العادية، مما يعني أن الـ 20 برميل ستصعد لمسافة أطول في حالة وجود كولارات عريضة.
          </p>
      </div>

      {drillString.length > 0 && (
        <section className="bg-slate-950/80 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900/50 border-b border-slate-800 text-center"><h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Bottom String Data (Extracted by AI)</h3></div>
            <div className="overflow-x-auto">
                <table className="w-full text-center text-[10px]" dir="rtl">
                    <thead className="bg-slate-900/50 text-slate-500 uppercase font-black">
                        <tr>
                            <th className="p-3 border-b border-slate-800">Item</th>
                            <th className="p-3 border-b border-slate-800 text-amber-400">OD (in)</th>
                            <th className="p-3 border-b border-slate-800 text-indigo-400">ID (in)</th>
                            <th className="p-3 border-b border-slate-800">Len (ft)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drillString.map((item, i) => (
                            <tr key={i} className="border-b border-slate-800/30 hover:bg-amber-500/5 transition-colors">
                                <td className="p-3 font-bold text-white text-right">{item.item}</td>
                                <td className="p-3 font-black text-amber-400">{item.od ?? '-'}</td>
                                <td className="p-3 font-black text-indigo-400">{item.id ?? '-'}</td>
                                <td className="p-3 font-bold text-slate-300">{item.length ?? '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
      )}

      <button onClick={() => { setImages([]); setDrillString([]); setHoleSize('12.25'); setSpotVolume('20'); }} className="w-full py-4 rounded-3xl border border-slate-800 text-slate-600 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
          <RefreshCw className="w-4 h-4" /> Reset Calculator
      </button>

    </div>
  );
};

export default SpotCalc;
