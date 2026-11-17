
import React from 'react';
import { FormulaDetails } from '../types';
import MathFormula from './MathFormula';

interface FormulaCardProps {
  details: FormulaDetails;
}

const FormulaCard: React.FC<FormulaCardProps> = ({ details }) => {
  return (
    <div className="bg-[#1e293b]/40 border border-[#334155] rounded-2xl p-6 mb-8 shadow-lg">
      <div className="text-right">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider" dir="ltr">Formula</span>
          <h4 className="text-gray-400 text-sm font-bold">القانون:</h4>
        </div>
        
        <div className="bg-[#0a0f1e] p-6 rounded-xl border border-[#1e293b] mb-6 shadow-inner space-y-4">
          <MathFormula
            math={details.law}
            className="text-xl sm:text-2xl text-white py-1"
          />

          {details.substitution && (
            <>
              <div className="border-t border-slate-800/80 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider" dir="ltr">Substitution</span>
                  <span className="text-xs text-slate-400 font-bold">التعويض:</span>
                </div>
                <MathFormula
                  math={details.substitution}
                  className="text-lg sm:text-xl text-blue-300 py-1"
                />
              </div>
            </>
          )}
        </div>

        <div className="space-y-3">
          {details.variables.map((v, i) => (
            <div key={i} className="text-sm font-medium flex flex-col items-end gap-1" style={{ color: v.color || '#60a5fa' }}>
              <span>{v.description}</span>
              {v.math && (
                <div className="w-full bg-[#0a0f1e]/80 p-3 rounded-xl border border-slate-800 mt-1">
                  <MathFormula math={v.math} className="text-base sm:text-lg" />
                </div>
              )}
            </div>
          ))}
          {details.note && (
            <div className="text-sm font-medium text-amber-400 mt-4 text-right">
              {details.note}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormulaCard;

