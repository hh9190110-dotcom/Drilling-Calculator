import React, { useMemo, createContext, useContext, useState, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { BookOpen, Code2, Sparkles } from 'lucide-react';

export type FormulaDisplayStyle = 'modern' | 'classic';

interface FormulaStyleContextValue {
  style: FormulaDisplayStyle;
  setStyle: (style: FormulaDisplayStyle) => void;
  toggleStyle: () => void;
}

const FormulaStyleContext = createContext<FormulaStyleContextValue>({
  style: 'modern',
  setStyle: () => {},
  toggleStyle: () => {},
});

export const FormulaStyleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [style, setStyleState] = useState<FormulaDisplayStyle>(() => {
    try {
      const saved = localStorage.getItem('formula_display_style');
      return saved === 'classic' ? 'classic' : 'modern';
    } catch {
      return 'modern';
    }
  });

  const setStyle = (newStyle: FormulaDisplayStyle) => {
    setStyleState(newStyle);
    try {
      localStorage.setItem('formula_display_style', newStyle);
    } catch {
      // ignore storage errors
    }
  };

  const toggleStyle = () => {
    setStyle(style === 'modern' ? 'classic' : 'modern');
  };

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'formula_display_style' && (e.newValue === 'modern' || e.newValue === 'classic')) {
        setStyleState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <FormulaStyleContext.Provider value={{ style, setStyle, toggleStyle }}>
      {children}
    </FormulaStyleContext.Provider>
  );
};

export const useFormulaStyle = () => useContext(FormulaStyleContext);

/**
 * Quick-toggle UI component to switch between Modern (Textbook KaTeX) and Classic (Code) formula display.
 */
export const FormulaStyleToggle: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { style, setStyle, toggleStyle } = useFormulaStyle();

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleStyle}
        title="تبديل سريع بين شكل المعادلات القديم (البرمجي) والحديث (الجامعي)"
        className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-[11px] font-black transition-all active:scale-95 shadow-lg ${
          style === 'modern'
            ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border-blue-500/40 text-blue-300 hover:border-blue-400'
            : 'bg-slate-800/80 border-amber-500/40 text-amber-300 hover:border-amber-400'
        }`}
      >
        {style === 'modern' ? (
          <>
            <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>المعادلات: الحديث (جامعي)</span>
          </>
        ) : (
          <>
            <Code2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>المعادلات: القديم (برمجي)</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="flex bg-slate-900/70 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md max-w-sm mx-auto justify-center items-center gap-1.5 shadow-lg">
      <button
        type="button"
        onClick={() => setStyle('modern')}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[10px] font-black transition-all ${
          style === 'modern'
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BookOpen className="w-3.5 h-3.5 shrink-0" />
        <span>الشكل الحديث (جامعي)</span>
      </button>
      <button
        type="button"
        onClick={() => setStyle('classic')}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[10px] font-black transition-all ${
          style === 'classic'
            ? 'bg-slate-700 text-amber-300 border border-amber-500/30 shadow-md'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Code2 className="w-3.5 h-3.5 shrink-0" />
        <span>الشكل القديم (برمجي)</span>
      </button>
    </div>
  );
};

interface MathFormulaProps {
  math?: string;
  formula?: string;
  classic?: string;
  displayMode?: boolean;
  className?: string;
}

/**
 * Converts a LaTeX formula string back into the original computer/code-style engineering string
 * e.g. "V = \frac{(Hole^2 - OD^2)}{1029.4} \times L \times Exc" -> "((Hole^2 - OD^2) / 1029.4) * L * Exc"
 */
export function formatAsClassicCode(raw: string): string {
  if (!raw) return '';
  let s = raw.trim();

  // Remove leading "V = " or "Disp = " or "Disp_1 = " or "Disp_2 = " added for textbook display
  s = s.replace(/^(V|Disp|Disp_1|Disp_2)\s*=\s*/, '');

  // Replace LaTeX structural symbols
  s = s
    .replace(/\\sum\s*/g, 'Σ ')
    .replace(/\\Delta\s*P_1/g, 'ΔP1')
    .replace(/\\Delta\s*P_2/g, 'ΔP2')
    .replace(/\\Delta\s*P/g, 'ΔP')
    .replace(/\\Delta\s*/g, 'Δ')
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\left\[/g, '[')
    .replace(/\\right\]/g, ']');

  // Iteratively convert \frac{num}{den} -> ((num) / den) or (num / den)
  let prev = '';
  while (prev !== s && s.includes('\\frac')) {
    prev = s;
    s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_, num, den) => {
      const cleanNum = num.trim();
      const cleanDen = den.trim();
      const numWrapped =
        cleanNum.startsWith('(') && cleanNum.endsWith(')')
          ? cleanNum
          : cleanNum.includes(' ') || cleanNum.includes('-') || cleanNum.includes('+') || cleanNum.includes('\\times')
          ? `(${cleanNum})`
          : cleanNum;
      const denWrapped =
        cleanDen.includes(' ') || cleanDen.includes('\\times') || cleanDen.includes('+') || cleanDen.includes('-')
          ? `(${cleanDen})`
          : cleanDen;
      return `(${numWrapped} / ${denWrapped})`;
    });
  }

  // Convert subscripts back to classic code identifiers
  s = s
    .replace(/ID_\{last\}/g, 'Last_ID')
    .replace(/DP_\{ID\}/g, 'DP_ID')
    .replace(/Liner_\{ID\}/g, 'Liner_ID')
    .replace(/DV_\{Depth\}/g, 'DV_Depth')
    .replace(/L_\{eff\}/g, 'L_eff')
    .replace(/L_\{Rat\}/g, 'Rat_Len')
    .replace(/L_\{Shoe\}/g, 'Shoe_Len')
    .replace(/L_\{Overlap\}/g, 'Overlap_Len')
    .replace(/L_\{Tail\}/g, 'Tail_Height')
    .replace(/L_\{DP\}/g, 'DP_Len')
    .replace(/L_\{Liner\}/g, 'Liner_Len')
    .replace(/L_\{Mud\}/g, 'L_Mud')
    .replace(/HP_\{Annulus\}/g, 'HP_Annulus')
    .replace(/HP_\{Casing\}/g, 'HP_Casing')
    .replace(/HP_\{Ann\}/g, 'HP_Ann')
    .replace(/HP_\{Csg\}/g, 'HP_Csg')
    .replace(/MW_\{Ann\}/g, 'MW_Ann')
    .replace(/MW_\{Mud\}/g, 'MW_Mud')
    .replace(/MW_\{Tail\}/g, 'MW_Tail')
    .replace(/MAMW_\{Safe\}/g, 'MAMW Safe')
    .replace(/_\{([^{}]+)\}/g, '_$1')
    .replace(/_1/g, '₁')
    .replace(/_2/g, '₂')
    .replace(/_3/g, '₃');

  // Convert operators and escaped spaces
  s = s
    .replace(/\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\\\s+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return s;
}

/**
 * Ensures any mathematical string (whether already in LaTeX or plain engineering notation)
 * is converted into clean, textbook-grade LaTeX for KaTeX rendering.
 */
export function normalizeToLatex(raw: string): string {
  if (!raw) return '';
  let s = raw.trim();

  // Replace unicode symbols with LaTeX equivalents
  s = s
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/₁/g, '_1')
    .replace(/₂/g, '_2')
    .replace(/₃/g, '_3')
    .replace(/₄/g, '_4')
    .replace(/₅/g, '_5')
    .replace(/₆/g, '_6')
    .replace(/Σ/g, '\\sum ');

  // If the string already uses explicit LaTeX commands (\frac, \times, \Delta, \left, etc.),
  // just clean up any remaining raw * or × symbols and return.
  if (s.includes('\\frac') || s.includes('\\times') || s.includes('\\Delta') || s.includes('\\sum')) {
    return s
      .replace(/\*/g, ' \\times ')
      .replace(/×/g, ' \\times ')
      .replace(/÷/g, ' \\div ');
  }

  // Otherwise, convert plain-text engineering formulas into LaTeX:
  s = s.replace(/Last_ID/g, 'ID_{last}');
  s = s.replace(/Last ID/g, 'ID_{last}');
  s = s.replace(/DP_ID/g, 'DP_{ID}');
  s = s.replace(/Liner_ID/g, 'Liner_{ID}');
  s = s.replace(/DV_Depth/g, 'DV_{Depth}');
  s = s.replace(/L_eff/g, 'L_{eff}');
  s = s.replace(/DP_Volume/g, 'V_{DP}');
  s = s.replace(/Liner_Volume/g, 'V_{Liner}');

  // Convert ((A - B) / C) -> \frac{(A - B)}{C}
  s = s.replace(/\(\(\s*([^()]+?)\s*\)\s*\/\s*([0-9.a-zA-Z_{}^]+)\s*\)/g, '\\frac{($1)}{$2}');

  // Convert ((A) / C) or (A / C) -> \frac{A}{C}
  s = s.replace(/\(\s*([^()]+?)\s*\/\s*([0-9.a-zA-Z_{}^]+)\s*\)/g, '\\frac{$1}{$2}');

  // Convert A / (B) -> \frac{A}{B}
  s = s.replace(/([0-9.a-zA-Z_{}^]+)\s*\/\s*\(\s*([^()]+?)\s*\)/g, '\\frac{$1}{$2}');

  // Convert remaining simple A / B -> \frac{A}{B}
  s = s.replace(/([0-9.a-zA-Z_{}^]+)\s*\/\s*([0-9.a-zA-Z_{}^]+)/g, '\\frac{$1}{$2}');

  // Convert multiplication symbols (* and ×) to \times
  s = s.replace(/\*/g, ' \\times ').replace(/×/g, ' \\times ');

  return s;
}

const MathFormula: React.FC<MathFormulaProps> = ({
  math,
  formula,
  classic,
  displayMode = true,
  className = '',
}) => {
  const { style } = useFormulaStyle();
  const rawFormula = math ?? formula ?? '';

  const html = useMemo(() => {
    const latex = normalizeToLatex(rawFormula);
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        strict: false,
        trust: true,
      });
    } catch (e) {
      console.error('KaTeX render error:', e);
      return latex;
    }
  }, [rawFormula, displayMode]);

  const classicText = useMemo(() => {
    return classic ?? formatAsClassicCode(rawFormula);
  }, [classic, rawFormula]);

  if (style === 'classic') {
    return (
      <div dir="ltr" className={`flex items-center justify-center overflow-x-auto select-text ${className}`}>
        <code
          dir="ltr"
          className="font-mono font-bold text-xs sm:text-sm bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800/80 text-center break-words leading-relaxed tracking-tight"
        >
          {classicText}
        </code>
      </div>
    );
  }

  return (
    <div
      dir="ltr"
      className={`flex items-center justify-center overflow-x-auto overflow-y-hidden select-text ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MathFormula;
