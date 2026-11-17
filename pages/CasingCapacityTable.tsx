import React, { useState, useMemo } from 'react';
import {
  Table,
  Search,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Layers,
  Ruler,
  Filter,
  CheckCircle2,
  Info
} from 'lucide-react';
import { API_CASING_CATALOG } from '../components/CasingSelector';
import MathFormula from '../components/MathFormula';

interface SingleGradeCasingRow {
  key: string;
  fraction: string;
  od: number;
  typeLabel: string;
  grade: string;
  weight: number;
  id: number;
  wall: number;
  drift: number;
  note?: string;
  capacityBblFt: number; // ID^2 / 1029.4
  ftPerBbl: number; // 1029.4 / ID^2
  galPerFt: number; // capacityBblFt * 42
}

// Primary standard API grade assigned to each weight spec by default, plus full expansion mode
const getPrimaryGradeForSpec = (od: number, weight: number, grades: string[], specIdx: number): string => {
  // Pick the most representative field grade for each weight step so every weight has a distinct, accurate API grade
  if (od === 30.0) {
    if (weight === 234.0) return 'K-55';
    if (weight === 310.0) return 'X-56';
    return 'X-65';
  }
  if (od === 24.0) {
    if (weight === 163.0) return 'J-55';
    if (weight === 186.0) return 'K-55';
    return 'X-56';
  }
  if (od === 20.0) {
    if (weight === 94.0) return 'H-40';
    if (weight === 106.5) return 'K-55';
    if (weight === 133.0) return 'L-80';
    return 'N-80';
  }
  if (od === 18.625) {
    if (weight === 87.5) return 'K-55';
    if (weight === 94.5) return 'J-55';
    if (weight === 106.0) return 'L-80';
    if (weight === 117.5) return 'N-80';
    if (weight === 136.0) return 'P-110';
    if (weight === 212.0) return 'L-80';
    return 'P-110';
  }
  if (od === 16.0) {
    if (weight === 65.0) return 'H-40';
    if (weight === 75.0) return 'J-55';
    if (weight === 84.0) return 'K-55';
    return 'N-80';
  }
  if (od === 13.375) {
    if (weight === 48.0) return 'H-40';
    if (weight === 54.5) return 'J-55';
    if (weight === 61.0) return 'K-55';
    if (weight === 68.0) return 'L-80';
    if (weight === 72.0) return 'N-80';
    if (weight === 77.0) return 'C-95';
    return 'P-110';
  }
  if (od === 11.75) {
    if (weight === 42.0) return 'H-40';
    if (weight === 47.0) return 'J-55';
    if (weight === 54.0) return 'K-55';
    if (weight === 60.0) return 'L-80';
    return 'P-110';
  }
  if (od === 10.75) {
    if (weight === 40.5) return 'J-55';
    if (weight === 45.5) return 'K-55';
    if (weight === 51.0) return 'L-80';
    if (weight === 55.5) return 'N-80';
    return 'P-110';
  }
  if (od === 9.625) {
    if (weight === 36.0) return 'J-55';
    if (weight === 40.0) return 'K-55';
    if (weight === 43.5) return 'L-80';
    if (weight === 47.0) return 'N-80';
    if (weight === 53.5) return 'P-110';
    return 'Q-125';
  }
  if (od === 8.625) {
    if (weight === 24.0) return 'J-55';
    if (weight === 32.0) return 'K-55';
    if (weight === 36.0) return 'L-80';
    if (weight === 40.0) return 'N-80';
    return 'P-110';
  }
  if (od === 7.625) {
    if (weight === 26.4) return 'K-55';
    if (weight === 29.7) return 'L-80';
    if (weight === 33.7) return 'N-80';
    return 'P-110';
  }
  if (od === 7.0) {
    if (weight === 20.0) return 'J-55';
    if (weight === 23.0) return 'K-55';
    if (weight === 26.0) return 'L-80';
    if (weight === 29.0) return 'N-80';
    if (weight === 32.0) return 'P-110';
    if (weight === 35.0) return 'C-95';
    return 'Q-125';
  }
  if (od === 5.5) {
    if (weight === 14.0) return 'J-55';
    if (weight === 15.5) return 'K-55';
    if (weight === 17.0) return 'L-80';
    if (weight === 20.0) return 'N-80';
    return 'P-110';
  }
  if (od === 5.0) {
    if (weight === 13.0) return 'J-55';
    if (weight === 15.0) return 'L-80';
    if (weight === 18.0) return 'N-80';
    return 'P-110';
  }
  if (od === 4.5) {
    if (weight === 9.5) return 'J-55';
    if (weight === 11.6) return 'K-55';
    if (weight === 13.5) return 'L-80';
    return 'P-110';
  }
  return grades[specIdx % grades.length] || grades[0] || 'K-55';
};

const getGradeBadgeStyle = (grade: string) => {
  if (grade.startsWith('H-') || grade.startsWith('J-')) {
    return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
  }
  if (grade.startsWith('K-') || grade.startsWith('X-')) {
    return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  }
  if (grade.startsWith('L-') || grade.startsWith('N-')) {
    return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  }
  if (grade.startsWith('C-') || grade.startsWith('P-') || grade.startsWith('Q-')) {
    return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
  }
  return 'bg-slate-800 text-slate-300 border-slate-700';
};

const CasingCapacityTable: React.FC = () => {
  const K = 1029.4;

  const [selectedSize, setSelectedSize] = useState<string>('ALL');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'STANDARD' | 'EXPANDED'>('STANDARD');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'DESC' | 'ASC'>('DESC'); // Default: Highest to Lowest
  const [customLength, setCustomLength] = useState<string>('1000');
  const [selectedRowKey, setSelectedRowKey] = useState<string>('30"-234-K-55');

  const lengthVal = Math.max(0, parseFloat(customLength) || 0);

  // Build rows where EVERY row has a single, clear Grade
  const allRows: SingleGradeCasingRow[] = useMemo(() => {
    const rows: SingleGradeCasingRow[] = [];
    for (const group of API_CASING_CATALOG) {
      group.specs.forEach((spec, idx) => {
        const cap = (spec.id * spec.id) / K;
        if (viewMode === 'STANDARD' && selectedGrade === 'ALL') {
          const primaryGrade = getPrimaryGradeForSpec(group.od, spec.weight, spec.grades, idx);
          rows.push({
            key: `${group.fraction}-${spec.weight}-${primaryGrade}`,
            fraction: group.fraction,
            od: group.od,
            typeLabel: group.typeLabel,
            grade: primaryGrade,
            weight: spec.weight,
            id: spec.id,
            wall: spec.wall,
            drift: spec.drift,
            note: spec.note,
            capacityBblFt: cap,
            ftPerBbl: cap > 0 ? 1 / cap : 0,
            galPerFt: cap * 42,
          });
        } else {
          // Expanded mode (or when filtering by a specific grade): create one dedicated row per grade
          for (const g of spec.grades) {
            rows.push({
              key: `${group.fraction}-${spec.weight}-${g}`,
              fraction: group.fraction,
              od: group.od,
              typeLabel: group.typeLabel,
              grade: g,
              weight: spec.weight,
              id: spec.id,
              wall: spec.wall,
              drift: spec.drift,
              note: spec.note,
              capacityBblFt: cap,
              ftPerBbl: cap > 0 ? 1 / cap : 0,
              galPerFt: cap * 42,
            });
          }
        }
      });
    }
    return rows;
  }, [viewMode, selectedGrade]);

  const filteredAndSortedRows = useMemo(() => {
    const filtered = allRows.filter((row) => {
      if (selectedSize !== 'ALL' && row.fraction !== selectedSize) return false;
      if (selectedGrade !== 'ALL' && row.grade !== selectedGrade) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchFraction = row.fraction.toLowerCase().includes(q);
        const matchOd = row.od.toString().includes(q);
        const matchId = row.id.toString().includes(q);
        const matchWeight = row.weight.toString().includes(q);
        const matchType = row.typeLabel.toLowerCase().includes(q);
        const matchGrade = row.grade.toLowerCase().includes(q);
        if (!matchFraction && !matchOd && !matchId && !matchWeight && !matchType && !matchGrade) {
          return false;
        }
      }
      return true;
    });

    // Sort by OD then Capacity (from Highest to Lowest by default)
    return filtered.sort((a, b) => {
      if (sortOrder === 'DESC') {
        if (b.od !== a.od) return b.od - a.od;
        return b.capacityBblFt - a.capacityBblFt;
      } else {
        if (a.od !== b.od) return a.od - b.od;
        return a.capacityBblFt - b.capacityBblFt;
      }
    });
  }, [allRows, selectedSize, selectedGrade, searchQuery, sortOrder]);

  const activeFormulaRow = useMemo(() => {
    return (
      filteredAndSortedRows.find((r) => r.key === selectedRowKey) ||
      allRows.find((r) => r.key === selectedRowKey) ||
      filteredAndSortedRows[0] ||
      allRows[0]
    );
  }, [allRows, selectedRowKey, filteredAndSortedRows]);

  const allGrades = ['ALL', 'H-40', 'J-55', 'K-55', 'L-80', 'N-80', 'C-95', 'P-110', 'Q-125', 'X-52', 'X-56'];

  return (
    <div className="space-y-5 text-right pb-24">
      {/* Header */}
      <div className="text-center">
        <div className="w-14 h-14 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3 text-cyan-400 shadow-lg shadow-cyan-500/10">
          <Table className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black mb-1 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent italic">
          جدول سعة وأنواع الكيسينق
        </h1>
        <p className="text-blue-400 uppercase text-[10px] tracking-[0.25em] font-bold">
          API Casing Capacity by Size, Grade &amp; Weight (High to Low)
        </p>
      </div>

      {/* Engineering Note Card */}
      <div className="bg-blue-950/30 border border-blue-500/25 rounded-2xl p-3.5 flex items-start gap-2.5 text-right">
        <div className="flex-1 text-[11px] text-slate-300 leading-relaxed font-medium">
          <span className="font-black text-cyan-400 ml-1">ملاحظة هندسية (API 5CT):</span>
          في هذا الجدول كل صف يوضح <strong className="text-white">قريد محدد (Grade)</strong> مع{' '}
          <strong className="text-amber-300">الوزن (Weight ppf)</strong> و
          <strong className="text-blue-300">القطر الداخلي (ID)</strong> و
          <strong className="text-cyan-300">السعة الخاصة به (Capacity bbl/ft)</strong> مرتبة من الأعلى إلى الأقل.
        </div>
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
      </div>

      {/* Live Formula & Selected Casing Preview Card */}
      {activeFormulaRow && (
        <div className="bg-gradient-to-br from-blue-950/50 via-slate-900/90 to-cyan-950/30 p-4 sm:p-5 rounded-[2rem] border border-cyan-500/30 shadow-2xl space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className="px-2.5 py-1 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-black"
                dir="ltr"
              >
                {activeFormulaRow.capacityBblFt.toFixed(4)} bbl/ft
              </span>
              <span
                className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-black"
                dir="ltr"
              >
                {activeFormulaRow.ftPerBbl.toFixed(2)} ft/bbl
              </span>
              {lengthVal > 0 && (
                <span
                  className="px-2.5 py-1 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px] font-black"
                  dir="ltr"
                >
                  {(activeFormulaRow.capacityBblFt * lengthVal).toFixed(1)} bbl / {lengthVal} ft
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-white block">
                الكيسينق المحدد:{' '}
                <strong className="text-cyan-400" dir="ltr">
                  {activeFormulaRow.fraction} | {activeFormulaRow.grade} | {activeFormulaRow.weight} lb/ft (ID: {activeFormulaRow.id}")
                </strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0a0f1e] p-3.5 rounded-2xl border border-slate-800">
            <div>
              <span className="block text-[10px] text-slate-400 font-bold mb-1 text-left" dir="ltr">
                Formula
              </span>
              <MathFormula
                math="Capacity = \frac{ID^2}{1029.4}"
                className="text-white text-sm sm:text-base"
              />
            </div>
            <div className="pt-2 sm:pt-0 sm:border-l border-t sm:border-t-0 border-slate-800/80 sm:pl-4">
              <span className="block text-[10px] text-slate-400 font-bold mb-1 text-left" dir="ltr">
                Substitution ({activeFormulaRow.fraction} - {activeFormulaRow.grade})
              </span>
              <MathFormula
                math={`Capacity = \\frac{${activeFormulaRow.id}^2}{1029.4} = ${activeFormulaRow.capacityBblFt.toFixed(4)} \\text{ bbl/ft}`}
                className="text-cyan-300 text-sm sm:text-base"
              />
            </div>
          </div>
        </div>
      )}

      {/* Controls: Sort Order, View Mode, Custom Length Multiplier, Search & Filters */}
      <div className="bg-[#1e293b]/50 backdrop-blur-md p-4 rounded-3xl border border-slate-800 space-y-3.5 shadow-xl">
        {/* Top Row: Sort Toggle + Display Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Sort Order Toggle */}
          <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'DESC' ? 'ASC' : 'DESC'))}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 border transition-all ${
                sortOrder === 'DESC'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              {sortOrder === 'DESC' ? (
                <>
                  <ArrowDownWideNarrow className="w-3.5 h-3.5" />
                  <span>من الأعلى للأقل (30" ← 4 1/2")</span>
                </>
              ) : (
                <>
                  <ArrowUpNarrowWide className="w-3.5 h-3.5" />
                  <span>من الأقل للأعلى (4 1/2" ← 30")</span>
                </>
              )}
            </button>
            <span className="text-[10px] font-black text-slate-300">الترتيب:</span>
          </div>

          {/* Custom Length Multiplier */}
          <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-slate-400" dir="ltr">
                ft
              </span>
              <input
                type="number"
                value={customLength}
                onChange={(e) => setCustomLength(e.target.value)}
                className="w-20 bg-slate-950 border border-slate-700 rounded-xl px-2 py-1 text-center text-xs font-black text-cyan-400 focus:outline-none focus:border-cyan-500"
                placeholder="1000"
              />
            </div>
            <span className="text-[10px] font-black text-white flex items-center gap-1">
              حساب الحجم لطول معين <Ruler className="w-3.5 h-3.5 text-cyan-400" />
            </span>
          </div>
        </div>

        {/* Mode Toggle: Standard (1 Primary Grade per Weight) vs Expanded (All Grades expanded) */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('STANDARD')}
            className={`py-2 px-2 rounded-xl text-[10px] font-black transition-all ${
              viewMode === 'STANDARD'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            القريد القياسي لكل وزن (Standard)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('EXPANDED')}
            className={`py-2 px-2 rounded-xl text-[10px] font-black transition-all ${
              viewMode === 'EXPANDED'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            تفصيل كل القريدات (كل قريد بصف مستقل)
          </button>
        </div>

        {/* Size Filter Pills (Ordered from 30" down to 4 1/2") */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-slate-500">
              عدد الصفوف: {filteredAndSortedRows.length}
            </span>
            <span className="text-[10px] font-black text-slate-300 flex items-center gap-1">
              اختر مقاس الكيسينق <Layers className="w-3.5 h-3.5 text-cyan-400" />
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar" dir="ltr">
            <button
              type="button"
              onClick={() => setSelectedSize('ALL')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black border shrink-0 transition-all ${
                selectedSize === 'ALL'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              الكل (All)
            </button>
            {API_CASING_CATALOG.map((group) => {
              const active = selectedSize === group.fraction;
              return (
                <button
                  key={group.fraction}
                  type="button"
                  onClick={() => setSelectedSize(group.fraction)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black border shrink-0 transition-all ${
                    active
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {group.fraction}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grade Filter & Search Input */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالمقاس، القريد (مثلاً K-55)، الوزن، أو ID..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pr-8 pl-3 py-1.5 text-[11px] text-white placeholder:text-slate-500 font-bold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-1 shrink-0" />
            {allGrades.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGrade(g)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all shrink-0 ${
                  selectedGrade === g
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                    : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                dir="ltr"
              >
                {g === 'ALL' ? 'كل القريدات' : g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Organized Casing Capacity Table - Fits 100% on Mobile Screen */}
      <div className="bg-[#0f172a] rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-3.5 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <span className="text-[10px] font-black text-cyan-400 uppercase" dir="ltr">
            Capacity = ID² / 1029.4
          </span>
          <h2 className="text-xs sm:text-sm font-black text-white">
            جدول سعة الكيسينق حسب الحجم والقريد والوزن
          </h2>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-center border-collapse" dir="ltr">
            <thead>
              <tr className="bg-slate-900/95 border-b border-slate-800 text-[9.5px] sm:text-[10px] font-black uppercase text-slate-400">
                <th className="py-3 px-2 text-left">
                  Size
                  <span className="block text-[8px] text-slate-500">المقاس</span>
                </th>
                <th className="py-3 px-1.5">
                  Grade
                  <span className="block text-[8px] text-slate-500">القريد</span>
                </th>
                <th className="py-3 px-1.5">
                  Weight
                  <span className="block text-[8px] text-slate-500">الوزن (ppf)</span>
                </th>
                <th className="py-3 px-1.5">
                  ID (in)
                  <span className="block text-[8px] text-slate-500">القطر الداخلي</span>
                </th>
                <th className="py-3 px-2 bg-cyan-500/10 text-cyan-300 border-l border-cyan-500/20">
                  Capacity
                  <span className="block text-[8px] text-cyan-400">السعة (bbl/ft)</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-xs">
              {filteredAndSortedRows.map((row, index) => {
                const isSelected = activeFormulaRow?.key === row.key;
                const prevRow = index > 0 ? filteredAndSortedRows[index - 1] : null;
                const isNewSizeGroup = !prevRow || prevRow.fraction !== row.fraction;

                return (
                  <React.Fragment key={row.key}>
                    {isNewSizeGroup && (
                      <tr className="bg-slate-900/95 border-y border-slate-700/80">
                        <td colSpan={5} className="py-2 px-3.5 text-right" dir="rtl">
                          <div className="flex items-center justify-between">
                            <span className="text-[9.5px] font-black text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                              {row.typeLabel}
                            </span>
                            <span className="text-xs font-black text-white">
                              كيسينق مقاس{' '}
                              <strong className="text-amber-400" dir="ltr">
                                {row.fraction}
                              </strong>{' '}
                              <span className="text-slate-400 text-[10px]" dir="ltr">
                                (OD: {row.od}")
                              </span>
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}

                    <tr
                      onClick={() => setSelectedRowKey(row.key)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-cyan-500/15 hover:bg-cyan-500/20'
                          : 'hover:bg-slate-800/50'
                      }`}
                    >
                      {/* 1. Casing Size & OD */}
                      <td className="py-3 px-2 text-left font-black text-white whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          )}
                          <div>
                            <span className="text-xs sm:text-sm text-white block leading-tight">
                              {row.fraction}
                            </span>
                            <span className="block text-[8.5px] text-slate-500 font-bold">
                              OD: {row.od}"
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Single Specific Grade */}
                      <td className="py-3 px-1.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-1 rounded-lg border text-[10px] sm:text-xs font-black ${getGradeBadgeStyle(
                            row.grade
                          )}`}
                        >
                          {row.grade}
                        </span>
                      </td>

                      {/* 3. Weight lb/ft */}
                      <td className="py-3 px-1.5 font-black text-amber-300 whitespace-nowrap">
                        <span className="text-xs sm:text-sm">{row.weight}</span>
                        <span className="text-[8.5px] text-slate-500 block">lb/ft</span>
                      </td>

                      {/* 4. Inner Diameter ID & Drift */}
                      <td className="py-3 px-1.5 whitespace-nowrap">
                        <span className="font-black text-blue-300 text-xs sm:text-sm block">
                          {row.id}"
                        </span>
                        <span className="text-[8.5px] text-slate-500 font-bold block">
                          Wall: {row.wall}"
                        </span>
                      </td>

                      {/* 5. Capacity (bbl/ft) + Volume for Length */}
                      <td className="py-3 px-2 bg-cyan-500/5 border-l border-cyan-500/15 whitespace-nowrap">
                        <span className="text-sm sm:text-base font-black text-cyan-300 block leading-tight">
                          {row.capacityBblFt.toFixed(4)}
                        </span>
                        <span className="text-[8.5px] text-blue-300 font-bold block mt-0.5">
                          {(row.capacityBblFt * lengthVal).toFixed(1)} bbl/{lengthVal}ft
                        </span>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CasingCapacityTable;
