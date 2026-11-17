
import React, { useState } from 'react';
import TotalCementCalc from './TotalCementCalc';
import CompleteSectionCalc from './CompleteSectionCalc';
import { CalculationRecord, CalcType } from '../types';
import { Layers, Box } from 'lucide-react';

interface CementingMasterProps {
  onResult: (record: CalculationRecord) => void;
  initialData?: CalculationRecord | null;
}

const CementingMaster: React.FC<CementingMasterProps> = ({ onResult, initialData }) => {
  const [mode, setMode] = useState<'GLOBAL' | 'SEGMENTED'>('GLOBAL');

  React.useEffect(() => {
    if (initialData && initialData.type === CalcType.TOTAL_CEMENT) {
      if (initialData.inputs.Mode) setMode(initialData.inputs.Mode as 'GLOBAL' | 'SEGMENTED');
    }
  }, [initialData]);

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md max-w-sm mx-auto shadow-2xl">
        <button 
          onClick={() => setMode('GLOBAL')} 
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black transition-all duration-300 ${mode === 'GLOBAL' ? 'bg-blue-600 text-white shadow-lg scale-[1.02]' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Box className={`w-4 h-4 ${mode === 'GLOBAL' ? 'text-white' : 'text-slate-600'}`} />
          <span>إجمالي السيمنت (ط1)</span>
        </button>
        <button 
          onClick={() => setMode('SEGMENTED')} 
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black transition-all duration-300 ${mode === 'SEGMENTED' ? 'bg-indigo-600 text-white shadow-lg scale-[1.02]' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Layers className={`w-4 h-4 ${mode === 'SEGMENTED' ? 'text-white' : 'text-slate-600'}`} />
          <span>السكشن المتعدد (ط2)</span>
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {mode === 'GLOBAL' ? (
          <TotalCementCalc onResult={onResult} initialData={initialData} />
        ) : (
          <CompleteSectionCalc onResult={onResult} initialData={initialData} />
        )}
      </div>
    </div>
  );
};

export default CementingMaster;
