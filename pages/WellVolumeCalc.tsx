import React, { useState, useEffect, useId } from 'react';
import { CalcType, CalculationRecord } from '../types';
import {
  Save,
  RefreshCw,
  Layers,
  Check,
  Sliders
} from 'lucide-react';
import MathFormula from '../components/MathFormula';
import CasingSelector from '../components/CasingSelector';
import BitSelector, { BIT_TYPES_CATALOG } from '../components/BitSelector';

interface WellVolumeCalcProps {
  onResult: (record: CalculationRecord) => void;
  initialData?: CalculationRecord | null;
}

const InputField: React.FC<{
  label: string;
  val: string;
  set: (v: string) => void;
  placeholder?: string;
}> = ({ label, val, set, placeholder }) => (
  <div className="space-y-1 text-right">
    <label className="text-[10px] font-bold text-slate-400 uppercase px-1 block">{label}</label>
    <input
      className="input-field !p-3 !text-sm !bg-slate-800/60 border-slate-700/60 font-bold"
      type="number"
      value={val}
      placeholder={placeholder}
      onChange={e => set(e.target.value)}
    />
  </div>
);

const toFraction = (val: number) => {
  if (!val || isNaN(val)) return '0';
  const whole = Math.floor(val);
  const frac = val - whole;
  if (frac < 0.01) return `${whole}`;
  if (Math.abs(frac - 0.625) < 0.02) return `${whole} 5/8`;
  if (Math.abs(frac - 0.375) < 0.02) return `${whole} 3/8`;
  if (Math.abs(frac - 0.5) < 0.02) return `${whole} 1/2`;
  if (Math.abs(frac - 0.25) < 0.02) return `${whole} 1/4`;
  if (Math.abs(frac - 0.75) < 0.02) return `${whole} 3/4`;
  if (Math.abs(frac - 0.125) < 0.02) return `${whole} 1/8`;
  if (Math.abs(frac - 0.875) < 0.02) return `${whole} 7/8`;
  return Number(val.toFixed(3)).toString();
};

const WellVolumeCalc: React.FC<WellVolumeCalcProps> = ({ onResult, initialData }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const K = 1029.4;

  // Multi-select toggles for the wellbore sections + Tubing
  const [hasCasing, setHasCasing] = useState<boolean>(true);
  const [hasLiner, setHasLiner] = useState<boolean>(false);
  const [hasOpenHole, setHasOpenHole] = useState<boolean>(true);
  const [hasTubing, setHasTubing] = useState<boolean>(false);

  // Casing parameters
  const [csgOD, setCsgOD] = useState<string>('13.375');
  const [csgID, setCsgID] = useState<string>('12.415');
  const [csgShoeDepth, setCsgShoeDepth] = useState<string>('3500');

  // Liner parameters
  const [linerOD, setLinerOD] = useState<string>('9.625');
  const [linerID, setLinerID] = useState<string>('8.681');
  const [linerTopDepth, setLinerTopDepth] = useState<string>('3200');
  const [linerShoeDepth, setLinerShoeDepth] = useState<string>('7000');

  // Open Hole & Drill Bit parameters
  const [holeSize, setHoleSize] = useState<string>('12.25');
  const [bitTypeId, setBitTypeId] = useState<string>('PDC_MATRIX');
  const [totalDepth, setTotalDepth] = useState<string>('8500');
  const [ohExcess, setOhExcess] = useState<string>('0');

  // Tubing parameters
  const [tbgOD, setTbgOD] = useState<string>('3.5');
  const [tbgID, setTbgID] = useState<string>('2.992');
  const [tbgDepth, setTbgDepth] = useState<string>('3200');

  useEffect(() => {
    if (initialData && initialData.type === CalcType.WELL_VOLUME) {
      const inp = initialData.inputs;
      if (inp.hasCasing !== undefined) setHasCasing(Boolean(inp.hasCasing));
      if (inp.hasLiner !== undefined) setHasLiner(Boolean(inp.hasLiner));
      if (inp.hasOpenHole !== undefined) setHasOpenHole(Boolean(inp.hasOpenHole));
      if (inp.hasTubing !== undefined) setHasTubing(Boolean(inp.hasTubing));
      if (inp.wellMode && inp.hasCasing === undefined) {
        if (inp.wellMode === 'OPEN_HOLE') {
          setHasCasing(false);
          setHasLiner(false);
          setHasOpenHole(true);
        } else if (inp.wellMode === 'CASED_HOLE') {
          setHasCasing(true);
          setHasLiner(false);
          setHasOpenHole(false);
        } else if (inp.wellMode === 'CASING_AND_OH') {
          setHasCasing(true);
          setHasLiner(false);
          setHasOpenHole(true);
        } else if (inp.wellMode === 'LINER_AND_OH') {
          setHasCasing(true);
          setHasLiner(true);
          setHasOpenHole(true);
        }
      }
      if (inp.csgOD !== undefined) setCsgOD(String(inp.csgOD));
      if (inp.csgID !== undefined) setCsgID(String(inp.csgID));
      if (inp.csgShoeDepth !== undefined) setCsgShoeDepth(String(inp.csgShoeDepth));
      if (inp.linerOD !== undefined) setLinerOD(String(inp.linerOD));
      if (inp.linerID !== undefined) setLinerID(String(inp.linerID));
      if (inp.linerTopDepth !== undefined) setLinerTopDepth(String(inp.linerTopDepth));
      if (inp.linerShoeDepth !== undefined) setLinerShoeDepth(String(inp.linerShoeDepth));
      if (inp.holeSize !== undefined) setHoleSize(String(inp.holeSize));
      if (inp.bitTypeId !== undefined) setBitTypeId(String(inp.bitTypeId));
      if (inp.totalDepth !== undefined) setTotalDepth(String(inp.totalDepth));
      if (inp.ohExcess !== undefined) setOhExcess(String(inp.ohExcess));
      if (inp.tbgOD !== undefined) setTbgOD(String(inp.tbgOD));
      if (inp.tbgID !== undefined) setTbgID(String(inp.tbgID));
      if (inp.tbgDepth !== undefined) setTbgDepth(String(inp.tbgDepth));
    }
  }, [initialData]);

  const currentBitTypeObj =
    BIT_TYPES_CATALOG.find((b) => b.id === bitTypeId) || BIT_TYPES_CATALOG[0];

  // Toggle helper: ensures at least one outer wellbore section remains selected
  const toggleSection = (section: 'CASING' | 'LINER' | 'OPEN_HOLE' | 'TUBING') => {
    if (section === 'TUBING') {
      setHasTubing(!hasTubing);
      return;
    }
    if (section === 'CASING') {
      if (hasCasing && !hasLiner && !hasOpenHole) return;
      setHasCasing(!hasCasing);
    } else if (section === 'LINER') {
      if (hasLiner && !hasCasing && !hasOpenHole) return;
      const nextLiner = !hasLiner;
      setHasLiner(nextLiner);
      if (nextLiner && hasOpenHole && parseFloat(totalDepth) <= parseFloat(linerShoeDepth)) {
        setTotalDepth(String((parseFloat(linerShoeDepth) || 7000) + 1500));
        if (parseFloat(holeSize) >= parseFloat(linerOD)) {
          setHoleSize('8.5');
        }
      }
    } else if (section === 'OPEN_HOLE') {
      if (hasOpenHole && !hasCasing && !hasLiner) return;
      const nextOH = !hasOpenHole;
      setHasOpenHole(nextOH);
      if (nextOH) {
        const refShoe = hasLiner ? parseFloat(linerShoeDepth) || 7000 : hasCasing ? parseFloat(csgShoeDepth) || 3500 : 0;
        if (parseFloat(totalDepth) <= refShoe) {
          setTotalDepth(String(refShoe + 1500));
        }
      }
    }
  };

  // Calculations
  const cOD = parseFloat(csgOD) || 0;
  const cID = parseFloat(csgID) || 0;
  const cShoe = parseFloat(csgShoeDepth) || 0;

  const lOD = parseFloat(linerOD) || 0;
  const lID = parseFloat(linerID) || 0;
  const lTop = parseFloat(linerTopDepth) || 0;
  const lShoe = parseFloat(linerShoeDepth) || 0;

  const hDia = parseFloat(holeSize) || 0;
  const td = parseFloat(totalDepth) || 0;
  const excFactor = 1 + (parseFloat(ohExcess) || 0) / 100;

  const tOD = parseFloat(tbgOD) || 0;
  const tID = parseFloat(tbgID) || 0;
  const tLen = hasTubing ? Math.max(0, parseFloat(tbgDepth) || 0) : 0;

  // 1. Casing section calculation (Empty wellbore capacity)
  const upperCsgLength = hasCasing
    ? Math.max(0, hasLiner ? lTop : cShoe)
    : 0;
  const vCasing = hasCasing ? ((cID * cID) / K) * upperCsgLength : 0;

  // 2. Liner section calculation (Empty wellbore capacity)
  const linerLength = hasLiner ? Math.max(0, lShoe - lTop) : 0;
  const vLiner = hasLiner ? ((lID * lID) / K) * linerLength : 0;

  // 3. Open Hole section calculation (Empty wellbore capacity)
  const ohTopDepth = hasLiner ? lShoe : hasCasing ? cShoe : 0;
  const ohLength = hasOpenHole ? Math.max(0, td - ohTopDepth) : 0;
  const vOpenHole = hasOpenHole ? ((hDia * hDia) / K) * ohLength * excFactor : 0;

  // Empty wellbore total volume (without tubing steel)
  const emptyWellVolumeBbl = vCasing + vLiner + vOpenHole;

  // 4. Tubing & Annular Calculations (when hasTubing is active)
  // Capacity inside Tubing: (tID^2 / 1029.4) * tLen
  const vTubingInside = hasTubing ? ((tID * tID) / K) * tLen : 0;

  // Tubing Steel Metal Displacement: ((tOD^2 - tID^2) / 1029.4) * tLen
  const vTubingMetal = hasTubing ? Math.max(0, ((tOD * tOD - tID * tID) / K) * tLen) : 0;

  // Interval of Tubing inside Upper Casing [0 -> upperCsgLength]
  const tbgInCsgLen = hasTubing && hasCasing ? Math.max(0, Math.min(tLen, upperCsgLength)) : 0;
  const vAnnCsgTbg =
    tbgInCsgLen > 0 && cID > tOD
      ? ((cID * cID - tOD * tOD) / K) * tbgInCsgLen
      : 0;

  // Interval of Tubing inside Liner [lTop -> lShoe]
  const linerStartDepth = hasCasing ? lTop : 0;
  const linerEndDepth = hasCasing ? lShoe : linerLength;
  const tbgInLinerLen =
    hasTubing && hasLiner
      ? Math.max(0, Math.min(tLen, linerEndDepth) - Math.min(tLen, linerStartDepth))
      : 0;
  const vAnnLinerTbg =
    tbgInLinerLen > 0 && lID > tOD
      ? ((lID * lID - tOD * tOD) / K) * tbgInLinerLen
      : 0;

  // Interval of Tubing inside Open Hole [ohTopDepth -> td]
  const tbgInOhLen =
    hasTubing && hasOpenHole
      ? Math.max(0, Math.min(tLen, td) - Math.min(tLen, ohTopDepth))
      : 0;
  const vAnnOhTbg =
    tbgInOhLen > 0 && hDia > tOD
      ? (((hDia * hDia) * excFactor - tOD * tOD) / K) * tbgInOhLen
      : 0;

  // Total Annular Volume between Wellbore (Csg/Liner/OH) and Tubing over the Tubing length
  const vTotalAnnulusAroundTbg = vAnnCsgTbg + vAnnLinerTbg + vAnnOhTbg;

  // Volume of the Wellbore BELOW the Tubing Shoe down to Total Depth
  const csgBelowTbgLen = hasCasing ? Math.max(0, upperCsgLength - tbgInCsgLen) : 0;
  const linerBelowTbgLen = hasLiner ? Math.max(0, linerLength - tbgInLinerLen) : 0;
  const ohBelowTbgLen = hasOpenHole ? Math.max(0, ohLength - tbgInOhLen) : 0;
  const vBelowTubing =
    ((cID * cID) / K) * csgBelowTbgLen +
    ((lID * lID) / K) * linerBelowTbgLen +
    ((hDia * hDia) / K) * ohBelowTbgLen * excFactor;

  // Total Net Fluid in the Well (if Tubing is present, it's Inside Tubing + Annulus + Below Tubing)
  const totalVolumeBbl = hasTubing
    ? vTubingInside + vTotalAnnulusAroundTbg + vBelowTubing
    : emptyWellVolumeBbl;
  const totalVolumeFt3 = totalVolumeBbl * 5.6146;
  const totalVolumeGal = totalVolumeBbl * 42;
  const totalVolumeM3 = totalVolumeBbl * 0.158987;

  // Active configuration label
  const activePartsAr: string[] = [];
  const activePartsEn: string[] = [];
  if (hasCasing) {
    activePartsAr.push('كيسينق');
    activePartsEn.push('Casing');
  }
  if (hasLiner) {
    activePartsAr.push('لاينر');
    activePartsEn.push('Liner');
  }
  if (hasOpenHole) {
    activePartsAr.push('أوبن هول');
    activePartsEn.push('Open Hole');
  }
  if (hasTubing) {
    activePartsAr.push('تيوبينق');
    activePartsEn.push('Tubing');
  }
  const activeLabelAr = activePartsAr.join(' + ');
  const activeLabelEn = activePartsEn.join(' + ');

  const handleSave = () => {
    if (totalVolumeBbl <= 0) return;
    onResult({
      id: Date.now().toString(),
      type: CalcType.WELL_VOLUME,
      title: `حجم البئر (${activeLabelAr})`,
      inputs: {
        hasCasing: hasCasing ? 1 : 0,
        hasLiner: hasLiner ? 1 : 0,
        hasOpenHole: hasOpenHole ? 1 : 0,
        hasTubing: hasTubing ? 1 : 0,
        csgOD,
        csgID,
        csgShoeDepth,
        linerOD,
        linerID,
        linerTopDepth,
        linerShoeDepth,
        holeSize,
        bitTypeId,
        totalDepth,
        ohExcess,
        tbgOD,
        tbgID,
        tbgDepth
      },
      result: totalVolumeBbl,
      timestamp: Date.now()
    });
  };

  // --- Dynamic SVG Schematic Geometry ---
  const svgWidth = 400;
  const svgHeight = 380;
  const centerX = 200;
  const surfaceY = 24;
  const bottomY = svgHeight - 22;
  const totalDrawHeight = bottomY - surfaceY;

  // Zigzag open hole path helper
  const generateZigzagPath = (x: number, startY: number, endY: number, side: 'left' | 'right') => {
    const height = Math.abs(endY - startY);
    if (height < 1) return `M ${x} ${startY} L ${x} ${endY}`;
    let path = `M ${x} ${startY}`;
    const stepHeight = 4;
    const steps = Math.max(1, Math.ceil(height / stepHeight));
    const actualStepHeight = (endY - startY) / steps;
    const amplitude = 3;
    const period = 14;
    for (let i = 1; i <= steps; i++) {
      const currY = startY + i * actualStepHeight;
      const phase = (currY % period) / period;
      const triangle = phase < 0.25 ? phase * 4 : phase < 0.75 ? 2 - phase * 4 : phase * 4 - 4;
      const offset = triangle * amplitude * (side === 'left' ? 1 : -1);
      path += ` L ${x + offset} ${currY}`;
    }
    return path;
  };

  // Proportional visual widths based on actual diameters
  const maxDia = Math.max(
    hasCasing ? cOD : 0,
    hasLiner ? lOD : 0,
    hasOpenHole ? hDia : 0,
    12
  );
  const scaleWidth = (dia: number, minW: number, maxW: number) => {
    if (!dia || dia <= 0) return minW;
    const ratio = Math.min(1.3, Math.max(0.45, dia / maxDia));
    return Math.min(maxW, Math.max(minW, Math.round(ratio * 130)));
  };

  const csgVisualW = scaleWidth(cOD, 92, 154);
  const linerVisualW = hasCasing
    ? Math.min(csgVisualW - 22, scaleWidth(lOD, 62, 120))
    : scaleWidth(lOD, 78, 136);
  const holeVisualW = !hasCasing && !hasLiner
    ? scaleWidth(hDia, 98, 156)
    : hasLiner
    ? Math.min((hasCasing ? csgVisualW : linerVisualW + 20) - 12, Math.max(linerVisualW + 4, scaleWidth(hDia, 70, 126)))
    : Math.min(csgVisualW + 8, Math.max(72, scaleWidth(hDia, 76, 140)));

  const tbgVisualW = Math.min(34, Math.max(22, Math.round((tOD / Math.max(cOD, 9.625)) * 68)));

  // Vertical transition Y coordinates based on selected sections
  let csgEndY = bottomY;
  let linerTopY = surfaceY;
  let linerEndY = bottomY;
  let ohStartY = surfaceY;
  let ohEndY = bottomY;
  let maxWellDepthRef = Math.max(
    hasOpenHole ? td : 0,
    hasLiner ? lShoe : 0,
    hasCasing ? cShoe : 0,
    1000
  );

  if (hasCasing && hasLiner && hasOpenHole) {
    const safeTD = Math.max(1, td, lShoe + 100);
    maxWellDepthRef = safeTD;
    const rPrev = Math.min(0.42, Math.max(0.24, cShoe / safeTD));
    const rLinerTop = Math.min(rPrev - 0.06, Math.max(0.16, lTop / safeTD));
    const rLinerShoe = Math.min(0.74, Math.max(rPrev + 0.22, lShoe / safeTD));
    csgEndY = surfaceY + totalDrawHeight * rPrev;
    linerTopY = surfaceY + totalDrawHeight * rLinerTop;
    linerEndY = surfaceY + totalDrawHeight * rLinerShoe;
    ohStartY = linerEndY;
    ohEndY = bottomY;
  } else if (hasCasing && hasOpenHole && !hasLiner) {
    const safeTD = Math.max(1, td, cShoe + 100);
    maxWellDepthRef = safeTD;
    const ratio = Math.min(0.7, Math.max(0.28, cShoe / safeTD));
    csgEndY = surfaceY + totalDrawHeight * ratio;
    ohStartY = csgEndY;
    ohEndY = bottomY;
  } else if (hasCasing && hasLiner && !hasOpenHole) {
    const safeBottom = Math.max(1, lShoe, cShoe + 100);
    maxWellDepthRef = safeBottom;
    const rPrev = Math.min(0.62, Math.max(0.32, cShoe / safeBottom));
    const rLinerTop = Math.min(rPrev - 0.08, Math.max(0.2, lTop / safeBottom));
    csgEndY = surfaceY + totalDrawHeight * rPrev;
    linerTopY = surfaceY + totalDrawHeight * rLinerTop;
    linerEndY = bottomY;
  } else if (!hasCasing && hasLiner && hasOpenHole) {
    const safeTD = Math.max(1, td, lShoe + 100);
    maxWellDepthRef = safeTD;
    const rLinerTop = lTop > 0 ? Math.min(0.22, Math.max(0.08, lTop / safeTD)) : 0;
    const rLinerShoe = Math.min(0.7, Math.max(rLinerTop + 0.3, lShoe / safeTD));
    linerTopY = surfaceY + totalDrawHeight * rLinerTop;
    linerEndY = surfaceY + totalDrawHeight * rLinerShoe;
    ohStartY = linerEndY;
    ohEndY = bottomY;
  } else if (hasCasing && !hasLiner && !hasOpenHole) {
    maxWellDepthRef = Math.max(1, cShoe);
    csgEndY = bottomY;
  } else if (!hasCasing && hasLiner && !hasOpenHole) {
    const safeShoe = Math.max(1, lShoe);
    maxWellDepthRef = safeShoe;
    const rTop = lTop > 0 ? Math.min(0.3, Math.max(0.1, lTop / safeShoe)) : 0;
    linerTopY = surfaceY + totalDrawHeight * rTop;
    linerEndY = bottomY;
  } else {
    maxWellDepthRef = Math.max(1, td);
    ohStartY = surfaceY;
    ohEndY = bottomY;
  }

  // Tubing bottom Y coordinate mapped proportionally to the wellbore diagram
  const tbgRatio = Math.min(0.95, Math.max(0.18, tLen / Math.max(1, maxWellDepthRef)));
  const tbgEndY = surfaceY + totalDrawHeight * tbgRatio;

  const leftCsgX = centerX - csgVisualW / 2;
  const rightCsgX = centerX + csgVisualW / 2;
  const leftLinerX = centerX - linerVisualW / 2;
  const rightLinerX = centerX + linerVisualW / 2;
  const leftOhX = centerX - holeVisualW / 2;
  const rightOhX = centerX + holeVisualW / 2;
  const leftTbgX = centerX - tbgVisualW / 2;
  const rightTbgX = centerX + tbgVisualW / 2;

  const leftOhZigzag = generateZigzagPath(leftOhX, ohStartY, ohEndY, 'left');
  const rightOhZigzag = generateZigzagPath(rightOhX, ohEndY, ohStartY, 'right');
  const openHoleClosedPath = `
    M ${leftOhX} ${ohStartY}
    ${leftOhZigzag.replace('M', 'L')}
    L ${rightOhX} ${ohEndY}
    ${rightOhZigzag.replace('M', 'L')}
    Z
  `;

  return (
    <div className="space-y-6 text-right pb-24">
      {/* Page Title */}
      <div className="text-center">
        <h1 className="text-3xl font-black mb-1 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent italic">
          حساب حجم البئر الكلي
        </h1>
        <p className="text-blue-400 uppercase text-[10px] tracking-[0.25em] font-bold">
          Wellbore, Tubing &amp; Annular Volume Schematic
        </p>
      </div>

      {/* Multi-Select Well Sections Selector */}
      <div className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">
            تحديد متعدد حر
          </span>
          <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
            حدد أجزاء البئر (كيسينق / لاينر / أوبن هول / تيوبينق) <Layers className="w-4 h-4 text-cyan-400" />
          </span>
        </div>

        {/* 4 Multi-Select Toggle Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Option 1: Casing */}
          <button
            type="button"
            onClick={() => toggleSection('CASING')}
            className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1.5 relative ${
              hasCasing
                ? 'bg-blue-600/25 border-blue-400 text-white shadow-lg shadow-blue-500/15'
                : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                  hasCasing
                    ? 'bg-blue-500 border-blue-300 text-white'
                    : 'bg-slate-900 border-slate-700 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-blue-300">
                Casing
              </span>
            </div>
            <span className="text-sm font-black mt-0.5">كيسينق</span>
            <span className="text-[9px] text-slate-400 font-bold">
              {hasCasing ? 'مُفعل ✓' : 'اضغط للتحديد'}
            </span>
          </button>

          {/* Option 2: Liner */}
          <button
            type="button"
            onClick={() => toggleSection('LINER')}
            className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1.5 relative ${
              hasLiner
                ? 'bg-purple-600/25 border-purple-400 text-white shadow-lg shadow-purple-500/15'
                : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                  hasLiner
                    ? 'bg-purple-500 border-purple-300 text-white'
                    : 'bg-slate-900 border-slate-700 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-purple-300">
                Liner
              </span>
            </div>
            <span className="text-sm font-black mt-0.5">لاينر</span>
            <span className="text-[9px] text-slate-400 font-bold">
              {hasLiner ? 'مُفعل ✓' : 'اضغط للتحديد'}
            </span>
          </button>

          {/* Option 3: Open Hole */}
          <button
            type="button"
            onClick={() => toggleSection('OPEN_HOLE')}
            className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1.5 relative ${
              hasOpenHole
                ? 'bg-red-600/25 border-red-400 text-white shadow-lg shadow-red-500/15'
                : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                  hasOpenHole
                    ? 'bg-red-500 border-red-300 text-white'
                    : 'bg-slate-900 border-slate-700 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-red-300">
                Open Hole
              </span>
            </div>
            <span className="text-sm font-black mt-0.5">أوبن هول</span>
            <span className="text-[9px] text-slate-400 font-bold">
              {hasOpenHole ? 'مُفعل ✓' : 'اضغط للتحديد'}
            </span>
          </button>

          {/* Option 4: Tubing (تيوبينق) */}
          <button
            type="button"
            onClick={() => toggleSection('TUBING')}
            className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1.5 relative ${
              hasTubing
                ? 'bg-emerald-600/25 border-emerald-400 text-white shadow-lg shadow-emerald-500/15'
                : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                  hasTubing
                    ? 'bg-emerald-500 border-emerald-300 text-white'
                    : 'bg-slate-900 border-slate-700 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300">
                Tubing
              </span>
            </div>
            <span className="text-sm font-black mt-0.5">تيوبينق</span>
            <span className="text-[9px] text-slate-400 font-bold">
              {hasTubing ? 'مُفعل ✓ (داخلي + حلقي)' : 'اضغط لإضافة تيوبينق'}
            </span>
          </button>
        </div>

        {/* Active Combination Indicator Bar */}
        <div className="bg-slate-950/70 px-3.5 py-2 rounded-2xl border border-slate-800/80 flex items-center justify-between">
          <span className="text-[10px] font-black text-cyan-400 uppercase" dir="ltr">
            {activeLabelEn}
          </span>
          <div className="flex items-center gap-1.5 text-xs font-black text-white">
            <span className="text-slate-400 text-[10px]">الشكل الحالي:</span>
            <span className="text-cyan-300">{activeLabelAr}</span>
          </div>
        </div>
      </div>

      {/* Total Well Volume Summary Banner */}
      <div className="bg-gradient-to-br from-blue-900/40 via-slate-900/80 to-cyan-900/30 p-6 rounded-[2.2rem] border border-cyan-500/30 shadow-2xl text-center space-y-4">
        <div>
          <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">
            {hasTubing
              ? `إجمالي السائل الفعلي في البئر بوجود التيوبينق (${activeLabelAr})`
              : `إجمالي سعة وحجم البئر الكلي (${activeLabelAr})`}
          </p>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-6xl font-black text-white">{totalVolumeBbl.toFixed(2)}</span>
            <span className="text-2xl font-bold text-cyan-400 italic">bbl</span>
          </div>
          {hasTubing && (
            <p className="text-[11px] font-bold text-slate-400 mt-1">
              حجم البئر فارغاً بدون معدن التيوبينق:{' '}
              <strong className="text-white" dir="ltr">
                {emptyWellVolumeBbl.toFixed(2)} bbl
              </strong>{' '}
              | إزاحة معدن التيوبينق:{' '}
              <strong className="text-amber-400" dir="ltr">
                {vTubingMetal.toFixed(2)} bbl
              </strong>
            </p>
          )}
        </div>

        {/* Special Highlight Cards when Tubing is Active */}
        {hasTubing && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-emerald-500/30">
            <div className="bg-emerald-500/15 border border-emerald-500/30 p-3 rounded-2xl">
              <span className="block text-[10px] font-black text-emerald-300">
                1. السعة داخل التيوبينق (Tubing Capacity)
              </span>
              <span className="text-2xl font-black text-white">
                {vTubingInside.toFixed(2)} <span className="text-xs text-emerald-300">bbl</span>
              </span>
              <span className="block text-[9px] text-slate-300 font-bold" dir="ltr">
                {tLen > 0 ? (vTubingInside / tLen).toFixed(4) : '0.0000'} bbl/ft × {tLen} ft
              </span>
            </div>

            <div className="bg-cyan-500/15 border border-cyan-500/30 p-3 rounded-2xl">
              <span className="block text-[10px] font-black text-cyan-300">
                2. الفراغ الحلقي حول التيوبينق (Annular Vol)
              </span>
              <span className="text-2xl font-black text-white">
                {vTotalAnnulusAroundTbg.toFixed(2)} <span className="text-xs text-cyan-300">bbl</span>
              </span>
              <span className="block text-[9px] text-slate-300 font-bold">
                بين الكيسينق/البئر والتيوبينق لعمق {tLen} ft
              </span>
            </div>

            <div className="bg-amber-500/15 border border-amber-500/30 p-3 rounded-2xl">
              <span className="block text-[10px] font-black text-amber-300">
                3. الحجم أسفل نهاية التيوبينق (Below Tubing)
              </span>
              <span className="text-2xl font-black text-white">
                {vBelowTubing.toFixed(2)} <span className="text-xs text-amber-300">bbl</span>
              </span>
              <span className="block text-[9px] text-slate-300 font-bold">
                من عمق {tLen} ft حتى قاع البئر
              </span>
            </div>
          </div>
        )}

        {/* Sub-volumes breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80">
          {hasCasing && (
            <div className="bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-2xl">
              <span className="block text-[9px] font-black text-blue-400">
                {hasLiner ? 'سعة الكيسينق العلوي الكاملة' : 'سعة الكيسينق الكاملة (Casing)'}
              </span>
              <span className="text-lg font-black text-white">
                {vCasing.toFixed(2)} <span className="text-[10px] text-slate-400">bbl</span>
              </span>
            </div>
          )}

          {hasLiner && (
            <div className="bg-purple-500/10 border border-purple-500/20 p-2.5 rounded-2xl">
              <span className="block text-[9px] font-black text-purple-400">
                سعة اللاينر الكاملة (Liner)
              </span>
              <span className="text-lg font-black text-white">
                {vLiner.toFixed(2)} <span className="text-[10px] text-slate-400">bbl</span>
              </span>
            </div>
          )}

          {hasOpenHole && (
            <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-2xl">
              <span className="block text-[9px] font-black text-red-400">
                سعة الأوبن هول الكاملة (Open Hole)
              </span>
              <span className="text-lg font-black text-white">
                {vOpenHole.toFixed(2)} <span className="text-[10px] text-slate-400">bbl</span>
              </span>
            </div>
          )}

          <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-2xl col-span-full sm:col-span-1">
            <span className="block text-[9px] font-black text-emerald-400">وحدات مكافئة</span>
            <span className="text-xs font-black text-white block">
              {totalVolumeFt3.toFixed(1)} ft³ | {totalVolumeM3.toFixed(1)} m³
            </span>
            <span className="text-[9px] font-bold text-slate-400 block">
              {totalVolumeGal.toFixed(0)} US Gal
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Interactive Wellbore Schematic */}
      <div className="w-full flex flex-col items-center bg-slate-900/40 rounded-[2rem] p-3 border border-slate-800/60 shadow-xl">
        <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-2 px-2">
          <h3 className="text-xs font-black text-cyan-400 uppercase tracking-wider italic flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            الرسم التفاعلي للبئر حسب المدخلات (Live Well Schematic)
          </h3>

          <div className="flex flex-wrap gap-1.5 text-[9px] font-black">
            {hasCasing && (
              <span className="px-2 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300">
                Csg: {toFraction(cOD)}" (ID: {cID}")
              </span>
            )}
            {hasLiner && (
              <span className="px-2 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300">
                Liner: {toFraction(lOD)}" (ID: {lID}")
              </span>
            )}
            {hasOpenHole && (
              <span className="px-2 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300">
                Bit: {toFraction(hDia)}" ({currentBitTypeObj.shortTag})
              </span>
            )}
            {hasTubing && (
              <span className="px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                Tbg: {toFraction(tOD)}" (ID: {tID}" • {tLen} ft)
              </span>
            )}
          </div>
        </div>

        <svg
          style={{ direction: 'ltr' }}
          width="100%"
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="drop-shadow-2xl overflow-visible select-none"
        >
          <defs>
            <linearGradient id={`csgFill-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.65" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.65" />
            </linearGradient>
            <linearGradient id={`linerFill-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#581c87" stopOpacity="0.65" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#581c87" stopOpacity="0.65" />
            </linearGradient>
            <linearGradient id={`ohFill-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.65" />
              <stop offset="50%" stopColor="#ef4444" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.65" />
            </linearGradient>
            <linearGradient id={`tbgFill-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#065f46" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#065f46" stopOpacity="0.85" />
            </linearGradient>
            <pattern id={`rockPat-${uid}`} patternUnits="userSpaceOnUse" width="20" height="20">
              <path
                d="M 0 10 L 10 0 M 10 20 L 20 10"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          {/* Rock Formation Background */}
          <rect
            x={centerX - 165}
            y={surfaceY}
            width="330"
            height={totalDrawHeight}
            fill="#141c2b"
            rx="12"
          />
          <rect
            x={centerX - 165}
            y={surfaceY}
            width="330"
            height={totalDrawHeight}
            fill={`url(#rockPat-${uid})`}
            rx="12"
          />

          {/* 1. Casing Section */}
          {hasCasing && (
            <g>
              {/* Interior Fluid of Casing */}
              <rect
                x={leftCsgX}
                y={surfaceY}
                width={csgVisualW}
                height={(hasLiner ? linerTopY : csgEndY) - surfaceY}
                fill={`url(#csgFill-${uid})`}
              />
              {/* Steel Casing Walls */}
              <rect
                x={leftCsgX - 4}
                y={surfaceY}
                width="5"
                height={csgEndY - surfaceY}
                fill="#60a5fa"
              />
              <rect
                x={rightCsgX - 1}
                y={surfaceY}
                width="5"
                height={csgEndY - surfaceY}
                fill="#60a5fa"
              />
              {/* Casing Shoe Triangles */}
              <path
                d={`M ${leftCsgX - 4} ${csgEndY} L ${leftCsgX + 10} ${csgEndY} L ${leftCsgX - 4} ${csgEndY - 12} Z`}
                fill="#fbbf24"
              />
              <path
                d={`M ${rightCsgX + 4} ${csgEndY} L ${rightCsgX - 10} ${csgEndY} L ${rightCsgX + 4} ${csgEndY - 12} Z`}
                fill="#fbbf24"
              />

              {/* Volume Label inside Casing (when Tubing is NOT covering the whole label) */}
              {!hasTubing && (
                <g
                  transform={`translate(${centerX}, ${
                    surfaceY + ((hasLiner ? linerTopY : csgEndY) - surfaceY) * 0.5
                  })`}
                >
                  <text
                    x="0"
                    y="-4"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="13"
                    fontWeight="900"
                  >
                    {vCasing.toFixed(1)} bbl
                  </text>
                  <text
                    x="0"
                    y="10"
                    textAnchor="middle"
                    fill="#bfdbfe"
                    fontSize="8.5"
                    fontWeight="800"
                  >
                    Casing (ID: {cID}" × {upperCsgLength} ft)
                  </text>
                </g>
              )}
            </g>
          )}

          {/* 2. Liner Section */}
          {hasLiner && (
            <g>
              <rect
                x={leftLinerX}
                y={linerTopY}
                width={linerVisualW}
                height={linerEndY - linerTopY}
                fill={`url(#linerFill-${uid})`}
              />
              {hasCasing && (
                <>
                  <line
                    x1={leftCsgX}
                    y1={linerTopY}
                    x2={leftLinerX}
                    y2={linerTopY}
                    stroke="#c084fc"
                    strokeWidth="5"
                  />
                  <line
                    x1={rightLinerX}
                    y1={linerTopY}
                    x2={rightCsgX}
                    y2={linerTopY}
                    stroke="#c084fc"
                    strokeWidth="5"
                  />
                </>
              )}
              <rect
                x={leftLinerX - 3}
                y={linerTopY}
                width="4"
                height={linerEndY - linerTopY}
                fill="#c084fc"
              />
              <rect
                x={rightLinerX - 1}
                y={linerTopY}
                width="4"
                height={linerEndY - linerTopY}
                fill="#c084fc"
              />
              <path
                d={`M ${leftLinerX - 3} ${linerEndY} L ${leftLinerX + 9} ${linerEndY} L ${leftLinerX - 3} ${linerEndY - 10} Z`}
                fill="#fbbf24"
              />
              <path
                d={`M ${rightLinerX + 3} ${linerEndY} L ${rightLinerX - 9} ${linerEndY} L ${rightLinerX + 3} ${linerEndY - 10} Z`}
                fill="#fbbf24"
              />

              {!hasTubing && (
                <g transform={`translate(${centerX}, ${linerTopY + (linerEndY - linerTopY) * 0.5})`}>
                  <text
                    x="0"
                    y="-4"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="12"
                    fontWeight="900"
                  >
                    {vLiner.toFixed(1)} bbl
                  </text>
                  <text
                    x="0"
                    y="10"
                    textAnchor="middle"
                    fill="#e9d5ff"
                    fontSize="8"
                    fontWeight="800"
                  >
                    Liner (ID: {lID}" × {linerLength} ft)
                  </text>
                </g>
              )}
            </g>
          )}

          {/* 3. Open Hole Section */}
          {hasOpenHole && ohLength > 0 && (
            <g>
              <path d={openHoleClosedPath} fill={`url(#ohFill-${uid})`} />
              <path d={leftOhZigzag} fill="none" stroke="#ef4444" strokeWidth="2.5" />
              <path d={rightOhZigzag} fill="none" stroke="#ef4444" strokeWidth="2.5" />
              <line
                x1={leftOhX}
                y1={ohEndY}
                x2={rightOhX}
                y2={ohEndY}
                stroke="#ef4444"
                strokeWidth="2.5"
              />

              {/* Volume Label inside Open Hole */}
              <g transform={`translate(${centerX}, ${ohStartY + (ohEndY - ohStartY) * 0.55})`}>
                <text
                  x="0"
                  y="-4"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="900"
                >
                  {vOpenHole.toFixed(1)} bbl
                </text>
                <text
                  x="0"
                  y="9"
                  textAnchor="middle"
                  fill="#fecaca"
                  fontSize="8"
                  fontWeight="800"
                >
                  Open Hole ({toFraction(hDia)}" × {ohLength} ft)
                </text>
              </g>

              {/* Drill Bit Crown Graphic at Bottom of Open Hole */}
              <g transform={`translate(${centerX}, ${ohEndY - 8})`}>
                <rect
                  x={-Math.min(46, holeVisualW * 0.38)}
                  y="-8"
                  width={Math.min(92, holeVisualW * 0.76)}
                  height="14"
                  rx="4"
                  fill="#0f172a"
                  stroke="#fbbf24"
                  strokeWidth="1.2"
                />
                <text
                  x="0"
                  y="2"
                  textAnchor="middle"
                  fill="#fde68a"
                  fontSize="7.5"
                  fontWeight="900"
                >
                  Bit: {toFraction(hDia)}" {currentBitTypeObj.shortTag}
                </text>
              </g>
            </g>
          )}

          {/* 4. Central Tubing String (when hasTubing is active) */}
          {hasTubing && (
            <g>
              {/* Tubing Interior Fluid */}
              <rect
                x={leftTbgX}
                y={surfaceY}
                width={tbgVisualW}
                height={tbgEndY - surfaceY}
                fill={`url(#tbgFill-${uid})`}
              />
              {/* Tubing Steel Walls */}
              <rect
                x={leftTbgX - 2.5}
                y={surfaceY}
                width="3"
                height={tbgEndY - surfaceY}
                fill="#34d399"
              />
              <rect
                x={rightTbgX - 0.5}
                y={surfaceY}
                width="3"
                height={tbgEndY - surfaceY}
                fill="#34d399"
              />
              {/* Tubing Shoe Mule-Shoe / Collar indicator */}
              <rect
                x={leftTbgX - 4}
                y={tbgEndY - 5}
                width="5"
                height="5"
                fill="#fbbf24"
              />
              <rect
                x={rightTbgX - 1}
                y={tbgEndY - 5}
                width="5"
                height="5"
                fill="#fbbf24"
              />

              {/* Badge showing Inside Tubing Volume */}
              <g transform={`translate(${centerX}, ${surfaceY + (tbgEndY - surfaceY) * 0.38})`}>
                <rect
                  x="-42"
                  y="-13"
                  width="84"
                  height="24"
                  rx="6"
                  fill="rgba(6, 78, 59, 0.92)"
                  stroke="#34d399"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="-2"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9.5"
                  fontWeight="900"
                >
                  Tbg ID: {vTubingInside.toFixed(1)} bbl
                </text>
                <text
                  x="0"
                  y="8"
                  textAnchor="middle"
                  fill="#a7f3d0"
                  fontSize="7"
                  fontWeight="800"
                >
                  داخل التيوبينق ({toFraction(tOD)}")
                </text>
              </g>

              {/* Badge showing Annular Volume around Tubing */}
              <g transform={`translate(${centerX}, ${surfaceY + (tbgEndY - surfaceY) * 0.72})`}>
                <rect
                  x="-50"
                  y="-13"
                  width="100"
                  height="24"
                  rx="6"
                  fill="rgba(15, 23, 42, 0.92)"
                  stroke="#38bdf8"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="-2"
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="9.5"
                  fontWeight="900"
                >
                  Annulus: {vTotalAnnulusAroundTbg.toFixed(1)} bbl
                </text>
                <text
                  x="0"
                  y="8"
                  textAnchor="middle"
                  fill="#bae6fd"
                  fontSize="7"
                  fontWeight="800"
                >
                  الفراغ الحلقي حول التيوبينق
                </text>
              </g>
            </g>
          )}

          {/* --- Side Depth Annotations --- */}
          {/* Surface 0 ft (Left) */}
          <g transform={`translate(8, ${surfaceY})`}>
            <line
              x1="0"
              y1="0"
              x2={(hasCasing ? leftCsgX : hasLiner ? leftLinerX : leftOhX) - 10}
              y2="0"
              stroke="#3b82f6"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            <text x="2" y="-5" fill="#3b82f6" fontSize="9" fontWeight="900" textAnchor="start">
              السطح (Surface)
            </text>
            <text x="2" y="10" fill="#60a5fa" fontSize="10" fontWeight="900" textAnchor="start">
              0 ft
            </text>
          </g>

          {/* Tubing Shoe Depth (Left, if Tubing active) */}
          {hasTubing && (
            <g transform={`translate(8, ${tbgEndY})`}>
              <line
                x1="0"
                y1="0"
                x2={leftTbgX - 6}
                y2="0"
                stroke="#34d399"
                strokeWidth="1.2"
                strokeDasharray="3,2"
              />
              <text x="2" y="-5" fill="#34d399" fontSize="8.5" fontWeight="900" textAnchor="start">
                عمق التيوبينق (Tbg Depth)
              </text>
              <text x="2" y="10" fill="#a7f3d0" fontSize="9.5" fontWeight="900" textAnchor="start">
                {tLen} ft
              </text>
            </g>
          )}

          {/* Liner Top Depth (Left, if Liner active) */}
          {hasLiner && (
            <g transform={`translate(8, ${linerTopY})`}>
              <line
                x1="0"
                y1="0"
                x2={(hasCasing ? leftCsgX : leftLinerX) - 10}
                y2="0"
                stroke="#c084fc"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text x="2" y="-5" fill="#c084fc" fontSize="8.5" fontWeight="900" textAnchor="start">
                قمة اللاينر (Liner Top)
              </text>
              <text x="2" y="10" fill="#e9d5ff" fontSize="9.5" fontWeight="900" textAnchor="start">
                {lTop} ft
              </text>
            </g>
          )}

          {/* Casing Shoe Depth (Right, if Casing active) */}
          {hasCasing && (
            <g transform={`translate(${rightCsgX + 4}, ${csgEndY})`}>
              <line x1="-4" y1="0" x2="24" y2="0" stroke="#60a5fa" strokeWidth="1" strokeDasharray="2,2" />
              <text x="28" y="-4" fill="#93c5fd" fontSize="8.5" fontWeight="900" textAnchor="start">
                حذاء الكيسينق
              </text>
              <text x="28" y="9" fill="#ffffff" fontSize="9.5" fontWeight="900" textAnchor="start">
                {cShoe} ft
              </text>
            </g>
          )}

          {/* Liner Shoe Depth (Right, if Liner active) */}
          {hasLiner && (
            <g transform={`translate(${rightLinerX + 4}, ${linerEndY})`}>
              <line x1="-4" y1="0" x2="28" y2="0" stroke="#c084fc" strokeWidth="1" strokeDasharray="2,2" />
              <text x="32" y="-4" fill="#d8b4fe" fontSize="8.5" fontWeight="900" textAnchor="start">
                حذاء اللاينر
              </text>
              <text x="32" y="9" fill="#ffffff" fontSize="9.5" fontWeight="900" textAnchor="start">
                {lShoe} ft
              </text>
            </g>
          )}

          {/* Total Depth TD (Right, if Open Hole active) */}
          {hasOpenHole && (
            <g transform={`translate(${rightOhX + 4}, ${ohEndY})`}>
              <line x1="-4" y1="0" x2="24" y2="0" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" />
              <text x="28" y="-4" fill="#f87171" fontSize="8.5" fontWeight="900" textAnchor="start">
                نهاية الحفرة (TD)
              </text>
              <text x="28" y="9" fill="#fca5a5" fontSize="9.5" fontWeight="900" textAnchor="start">
                {td} ft
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Inputs Configuration Card */}
      <div className="bg-[#1e293b]/40 p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-[10px] font-black text-cyan-400 uppercase">Well Parameters</span>
          <span className="text-sm font-black text-white flex items-center gap-2">
            مدخلات أبعاد وأعماق البئر <Sliders className="w-4 h-4 text-cyan-400" />
          </span>
        </div>

        {/* Tubing Inputs (when Tubing is selected) */}
        {hasTubing && (
          <div className="space-y-3 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/25">
            <CasingSelector
              label="اختيار مقاس التيوبينق (Tubing Size & Weight)"
              sublabel="اختر مثلاً 2 3/8 أو 2 7/8 أو 3 1/2 أو 4 1/2 لتعبئة OD و ID"
              currentOD={tbgOD}
              currentID={tbgID}
              onSelect={(od, id) => {
                setTbgOD(od);
                setTbgID(id);
              }}
              variant="tubing"
            />
            <div className="grid grid-cols-3 gap-3">
              <InputField label="Tubing OD (in)" val={tbgOD} set={setTbgOD} />
              <InputField label="Tubing ID (in)" val={tbgID} set={setTbgID} />
              <InputField label="Tubing Depth (ft)" val={tbgDepth} set={setTbgDepth} />
            </div>
          </div>
        )}

        {/* Casing Inputs */}
        {hasCasing && (
          <div className="space-y-3 bg-blue-500/5 p-4 rounded-2xl border border-blue-500/20">
            <CasingSelector
              label={hasLiner ? 'الكيسينق العلوي (Upper Csg)' : 'الكيسينق (Casing)'}
              currentOD={csgOD}
              currentID={csgID}
              onSelect={(od, id) => {
                setCsgOD(od);
                setCsgID(id);
              }}
              variant="current"
            />
            <div className="grid grid-cols-3 gap-3">
              <InputField label="Csg OD (in)" val={csgOD} set={setCsgOD} />
              <InputField label="Csg ID (in)" val={csgID} set={setCsgID} />
              <InputField label="Csg Shoe (ft)" val={csgShoeDepth} set={setCsgShoeDepth} />
            </div>
          </div>
        )}

        {/* Liner Inputs */}
        {hasLiner && (
          <div className="space-y-3 bg-purple-500/5 p-4 rounded-2xl border border-purple-500/20">
            <CasingSelector
              label="اللاينر (Liner String)"
              currentOD={linerOD}
              currentID={linerID}
              onSelect={(od, id) => {
                setLinerOD(od);
                setLinerID(id);
              }}
              variant="liner"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InputField label="Liner OD (in)" val={linerOD} set={setLinerOD} />
              <InputField label="Liner ID (in)" val={linerID} set={setLinerID} />
              <InputField label="Liner Top (ft)" val={linerTopDepth} set={setLinerTopDepth} />
              <InputField label="Liner Shoe (ft)" val={linerShoeDepth} set={setLinerShoeDepth} />
            </div>
          </div>
        )}

        {/* Open Hole & Drill Bit Inputs */}
        {hasOpenHole && (
          <div className="space-y-3 bg-red-500/5 p-4 rounded-2xl border border-red-500/20">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-red-400 uppercase" dir="ltr">
                {ohTopDepth} ft → {td} ft ({ohLength} ft)
              </span>
              <span className="text-xs font-black text-red-300">
                بيانات الحفرة المفتوحة ورأس الحفر (Open Hole &amp; Bit)
              </span>
            </div>

            <BitSelector
              label="اختيار رأس الحفر / البتة (Bit Type & Size)"
              currentHoleSize={holeSize}
              selectedBitTypeId={bitTypeId}
              onSelect={(dia, meta) => {
                setHoleSize(dia);
                setBitTypeId(meta.bitType.id);
              }}
            />

            <div className="grid grid-cols-3 gap-3">
              <InputField label="Bit / Hole Size (in)" val={holeSize} set={setHoleSize} />
              <InputField label="Total Depth TD (ft)" val={totalDepth} set={setTotalDepth} />
              <InputField label="OH Excess (%)" val={ohExcess} set={setOhExcess} />
            </div>
          </div>
        )}
      </div>

      {/* Mathematical Formula & Substitution Cards */}
      <div className="space-y-4">
        {/* Tubing Internal Capacity + Casing-Tubing Annulus Formulas */}
        {hasTubing && (
          <>
            {/* 1. Inside Tubing Formula */}
            <div className="bg-emerald-950/20 p-4 rounded-3xl border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-black text-emerald-400">
                  {vTubingInside.toFixed(2)} bbl
                </span>
                <span className="text-xs font-black text-white">
                  السعة داخل التيوبينق (Tubing Internal Capacity)
                </span>
              </div>
              <div className="bg-[#0a0f1e] p-4 rounded-2xl border border-slate-800 space-y-3">
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold mb-1 text-left" dir="ltr">
                    Formula
                  </span>
                  <MathFormula
                    math="V_{Tbg} = \frac{ID_{Tbg}^2}{1029.4} \times L_{Tbg}"
                    className="text-white text-sm sm:text-base"
                  />
                </div>
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="block text-[10px] text-slate-400 font-bold mb-1 text-left" dir="ltr">
                    Substitution
                  </span>
                  <MathFormula
                    math={`V_{Tbg} = \\frac{${tID}^2}{1029.4} \\times ${tLen}`}
                    className="text-emerald-300 text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* 2. Annular Volume between Casing and Tubing */}
            {tbgInCsgLen > 0 && (
              <div className="bg-cyan-950/20 p-4 rounded-3xl border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-cyan-400">
                    {vAnnCsgTbg.toFixed(2)} bbl
                  </span>
                  <span className="text-xs font-black text-white">
                    الفراغ الحلقي بين الكيسينق والتيوبينق (Casing-Tubing Annulus)
                  </span>
                </div>
                <div className="bg-[#0a0f1e] p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold mb-1 text-left" dir="ltr">
                      Formula
                    </span>
                    <MathFormula
                      math="V_{Ann(Csg-Tbg)} = \frac{ID_{Csg}^2 - OD_{Tbg}^2}{1029.4} \times L_{Tbg}"
                      className="text-white text-sm sm:text-base"
                    />
                  </div>
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="block text-[10px] text-slate-400 font-bold mb-1 text-left" dir="ltr">
                      Substitution
                    </span>
                    <MathFormula
                      math={`V_{Ann(Csg-Tbg)} = \\frac{${cID}^2 - ${tOD}^2}{1029.4} \\times ${tbgInCsgLen}`}
                      className="text-cyan-300 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. Annular Volume between Liner and Tubing (if Tubing extends into Liner) */}
            {tbgInLinerLen > 0 && (
              <div className="bg-purple-950/20 p-4 rounded-3xl border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-purple-400">
                    {vAnnLinerTbg.toFixed(2)} bbl
                  </span>
                  <span className="text-xs font-black text-white">
                    الفراغ الحلقي بين اللاينر والتيوبينق (Liner-Tubing Annulus)
                  </span>
                </div>
                <div className="bg-[#0a0f1e] p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold mb-1 text-left" dir="ltr">
                      Formula
                    </span>
                    <MathFormula
                      math="V_{Ann(Liner-Tbg)} = \frac{ID_{Liner}^2 - OD_{Tbg}^2}{1029.4} \times L"
                      className="text-white text-sm sm:text-base"
                    />
                  </div>
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="block text-[10px] text-slate-400 font-bold mb-1 text-left" dir="ltr">
                      Substitution
                    </span>
                    <MathFormula
                      math={`V_{Ann(Liner-Tbg)} = \\frac{${lID}^2 - ${tOD}^2}{1029.4} \\times ${tbgInLinerLen}`}
                      className="text-purple-300 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {hasCasing && (
          <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-black text-blue-400">{vCasing.toFixed(2)} bbl</span>
              <span className="text-xs font-black text-white">
                سعة الكيسينق الداخلي الكاملة (Cased Hole Capacity)
              </span>
            </div>
            <div className="bg-[#0a0f1e] p-4 rounded-2xl border border-slate-800 space-y-3">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold mb-1 text-left" dir="ltr">
                  Formula
                </span>
                <MathFormula
                  math="V_{Csg} = \frac{ID^2}{1029.4} \times L_{Csg}"
                  className="text-white text-sm sm:text-base"
                />
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <span className="block text-[10px] text-slate-400 font-bold mb-1 text-left" dir="ltr">
                  Substitution
                </span>
                <MathFormula
                  math={`V_{Csg} = \\frac{${cID}^2}{1029.4} \\times ${upperCsgLength}`}
                  className="text-blue-300 text-sm sm:text-base"
                />
              </div>
            </div>
          </div>
        )}

        {hasLiner && (
          <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-black text-purple-400">{vLiner.toFixed(2)} bbl</span>
              <span className="text-xs font-black text-white">
                سعة اللاينر الداخلي الكاملة (Liner Internal Capacity)
              </span>
            </div>
            <div className="bg-[#0a0f1e] p-4 rounded-2xl border border-slate-800 space-y-3">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold mb-1 text-left" dir="ltr">
                  Formula
                </span>
                <MathFormula
                  math="V_{Liner} = \frac{ID_{Liner}^2}{1029.4} \times (Shoe_{Liner} - Top_{Liner})"
                  className="text-white text-sm sm:text-base"
                />
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <span className="block text-[10px] text-slate-400 font-bold mb-1 text-left" dir="ltr">
                  Substitution
                </span>
                <MathFormula
                  math={`V_{Liner} = \\frac{${lID}^2}{1029.4} \\times ${linerLength}`}
                  className="text-purple-300 text-sm sm:text-base"
                />
              </div>
            </div>
          </div>
        )}

        {hasOpenHole && (
          <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-black text-red-400">{vOpenHole.toFixed(2)} bbl</span>
              <span className="text-xs font-black text-white">
                حجم الحفرة المفتوحة (Open Hole Volume)
              </span>
            </div>
            <div className="bg-[#0a0f1e] p-4 rounded-2xl border border-slate-800 space-y-3">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold mb-1 text-left" dir="ltr">
                  Formula
                </span>
                <MathFormula
                  math="V_{OH} = \frac{Hole^2}{1029.4} \times L_{OH} \times Exc"
                  className="text-white text-sm sm:text-base"
                />
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <span className="block text-[10px] text-slate-400 font-bold mb-1 text-left" dir="ltr">
                  Substitution
                </span>
                <MathFormula
                  math={`V_{OH} = \\frac{${hDia}^2}{1029.4} \\times ${ohLength} \\times ${excFactor}`}
                  className="text-red-300 text-sm sm:text-base"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <button
          type="button"
          onClick={() => {
            setHasCasing(true);
            setHasLiner(false);
            setHasOpenHole(true);
            setHasTubing(false);
            setCsgOD('13.375');
            setCsgID('12.415');
            setCsgShoeDepth('3500');
            setLinerOD('9.625');
            setLinerID('8.681');
            setLinerTopDepth('3200');
            setLinerShoeDepth('7000');
            setHoleSize('12.25');
            setBitTypeId('PDC_MATRIX');
            setTotalDepth('8500');
            setOhExcess('0');
            setTbgOD('3.5');
            setTbgID('2.992');
            setTbgDepth('3200');
          }}
          className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-slate-700 text-slate-400 font-bold hover:bg-slate-800 transition-all active:scale-95"
        >
          <RefreshCw className="w-5 h-5" /> استعادة الافتراضي
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={totalVolumeBbl <= 0}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <Save className="w-5 h-5" /> حفظ في السجل
        </button>
      </div>
    </div>
  );
};

export default WellVolumeCalc;
