
import React from 'react';
import { CalculationRecord } from '../types';
import { Trash2, History, Clock, Calculator, ChevronRight, FileText } from 'lucide-react';

interface HistoryViewProps {
  history: CalculationRecord[];
  onClear: () => void;
  onDelete: (id: string) => void;
  onRestore: (record: CalculationRecord) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onClear, onDelete, onRestore }) => {
  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    }).format(ts);
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700">
          <History className="w-12 h-12 text-slate-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-400 mb-2">السجل فارغ</h2>
        <p className="text-slate-500 max-w-xs">احسب أي عملية واضغط على "حفظ في السجل" لتظهر هنا.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <FileText className="text-blue-500" />
            سجل العمليات
          </h1>
        </div>
        <button 
          onClick={onClear}
          className="text-xs font-bold text-red-400 bg-red-400/10 px-4 py-2 rounded-full hover:bg-red-400/20 transition-all border border-red-400/20"
        >
          مسح السجل
        </button>
      </div>

      <div className="space-y-4">
        {history.map((record) => (
          <div 
            key={record.id}
            onClick={() => onRestore(record)}
            className="bg-[#1e293b]/40 backdrop-blur-md border border-slate-800 p-5 rounded-3xl group relative overflow-hidden cursor-pointer hover:bg-[#1e293b]/60 transition-all active:scale-[0.98]"
          >
            <div className="absolute top-0 right-0 w-1 h-full bg-blue-500"></div>
            
            <div className="flex justify-between items-start mb-4">
               <div className="text-right">
                  <h3 className="font-black text-white text-lg flex items-center justify-end gap-2">
                    <ChevronRight className="w-4 h-4 text-blue-500 transform rotate-180" />
                    {record.title}
                  </h3>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">
                    <span>{formatDate(record.timestamp)}</span>
                    <Clock className="w-3 h-3" />
                  </div>
               </div>
               <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(record.id);
                  }}
                  className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#0a0f1e]/60 p-3 rounded-2xl border border-blue-500/30 shadow-lg shadow-blue-500/5">
                   <p className="text-[10px] text-blue-400 font-black mb-1 uppercase tracking-tighter">النتيجة النهائية</p>
                   <p className="text-xl font-black text-white">{typeof record.result === 'number' ? record.result.toFixed(2) : record.result} <span className="text-xs font-medium opacity-50">val</span></p>
                </div>
                <div className="bg-[#0a0f1e]/60 p-3 rounded-2xl border border-slate-800/50">
                   <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase">بيانات المدخلات</p>
                   <div className="flex flex-wrap gap-1">
                      {Object.entries(record.inputs).slice(0, 3).map(([k, v]) => (
                        <span key={k} className="text-[9px] text-slate-400 font-mono bg-slate-800 px-1.5 rounded">{String(v)}</span>
                      ))}
                   </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              {Object.entries(record.inputs).map(([key, value]) => (
                <div key={key} className="px-3 py-1 bg-slate-800/50 rounded-lg text-[10px] font-mono border border-slate-700/50">
                  <span className="text-slate-500 font-bold uppercase">{key}:</span> <span className="text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
