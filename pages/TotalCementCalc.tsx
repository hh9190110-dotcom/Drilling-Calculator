
import React, { useState, useEffect, useRef } from 'react';
import { CalcType, CalculationRecord } from '../types';
import { 
  RefreshCw, 
  Save, 
  ChevronDown, 
  ChevronUp, 
  Settings2,
  CheckCircle2,
  Target,
  Eye,
  X,
  Info,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SectionDiagram from '../components/SectionDiagram';
import MathFormula from '../components/MathFormula';
import CasingSelector from '../components/CasingSelector';

const Input: React.FC<{ label: string, val: string, set: (v: string) => void }> = ({ label, val, set }) => (
  <div className="space-y-1 text-right"><label className="text-[8px] font-bold text-slate-500 uppercase px-1 italic">{label}</label><input className="input-field !p-2 !text-xs !bg-slate-800/50 border-slate-700/50" type="number" value={val} onChange={e => set(e.target.value)} /></div>
);

const TotalCementCalc: React.FC<{ onResult: (record: CalculationRecord) => void, initialData?: CalculationRecord | null }> = ({ onResult, initialData }) => {
  const [activeTab, setActiveTab] = useState<'SEC1' | 'SEC2' | 'SEC3' | 'SEC4'>('SEC1');
  const [expanded, setExpanded] = useState<string | null>('global');
  const [isApproximate, setIsApproximate] = useState<boolean>(false);

  useEffect(() => {
    if (initialData && initialData.type === CalcType.TOTAL_CEMENT) {
      const { inputs } = initialData;
      if (inputs.Tab) setActiveTab(inputs.Tab as any);
      if (inputs.isApproximate) setIsApproximate(inputs.isApproximate === 'true');
      
      // Global
      if (inputs.mudDens) setMudDens(String(inputs.mudDens));
      if (inputs.leadDens) setLeadDens(String(inputs.leadDens));
      if (inputs.tailDens) setTailDens(String(inputs.tailDens));

      // Section 1
      if (inputs.g1Hole) setG1Hole(String(inputs.g1Hole));
      if (inputs.g1CsgOD) setG1CsgOD(String(inputs.g1CsgOD));
      if (inputs.g1CsgID) setG1CsgID(String(inputs.g1CsgID));
      if (inputs.g1Depth) setG1Depth(String(inputs.g1Depth));
      if (inputs.g1Excess) setG1Excess(String(inputs.g1Excess));
      if (inputs.g1Shoe) setG1Shoe(String(inputs.g1Shoe));
      if (inputs.g1Rat) setG1Rat(String(inputs.g1Rat));

      // Section 2
      if (inputs.g2TotalDepth) setG2TotalDepth(String(inputs.g2TotalDepth));
      if (inputs.g2PrevShoe) setG2PrevShoe(String(inputs.g2PrevShoe));
      if (inputs.g2TailH) setG2TailH(String(inputs.g2TailH));
      if (inputs.g2Hole) setG2Hole(String(inputs.g2Hole));
      if (inputs.g2PrevOD) setG2PrevOD(String(inputs.g2PrevOD));
      if (inputs.g2PrevID) setG2PrevID(String(inputs.g2PrevID));
      if (inputs.g2CsgOD) setG2CsgOD(String(inputs.g2CsgOD));
      if (inputs.g2CsgID) setG2CsgID(String(inputs.g2CsgID));
      if (inputs.g2Excess) setG2Excess(String(inputs.g2Excess));
      if (inputs.g2Shoe) setG2Shoe(String(inputs.g2Shoe));
      if (inputs.g2Rat) setG2Rat(String(inputs.g2Rat));

      // Section 3
      if (inputs.g3TotalDepth) setG3TotalDepth(String(inputs.g3TotalDepth));
      if (inputs.g3PrevShoe) setG3PrevShoe(String(inputs.g3PrevShoe));
      if (inputs.g3DvDepth) setG3DvDepth(String(inputs.g3DvDepth));
      if (inputs.g3TailH) setG3TailH(String(inputs.g3TailH));
      if (inputs.g3Hole) setG3Hole(String(inputs.g3Hole));
      if (inputs.g3PrevOD) setG3PrevOD(String(inputs.g3PrevOD));
      if (inputs.g3PrevID) setG3PrevID(String(inputs.g3PrevID));
      if (inputs.g3CsgOD) setG3CsgOD(String(inputs.g3CsgOD));
      if (inputs.g3CsgID) setG3CsgID(String(inputs.g3CsgID));
      if (inputs.g3Excess) setG3Excess(String(inputs.g3Excess));
      if (inputs.g3Shoe) setG3Shoe(String(inputs.g3Shoe));
      if (inputs.g3Rat) setG3Rat(String(inputs.g3Rat));

      // Section 4
      if (inputs.g4TotalDepth) setG4TotalDepth(String(inputs.g4TotalDepth));
      if (inputs.g4LinerTop) setG4LinerTop(String(inputs.g4LinerTop));
      if (inputs.g4PrevShoe) setG4PrevShoe(String(inputs.g4PrevShoe));
      if (inputs.g4TailH) setG4TailH(String(inputs.g4TailH));
      if (inputs.g4Hole) setG4Hole(String(inputs.g4Hole));
      if (inputs.g4PrevID) setG4PrevID(String(inputs.g4PrevID));
      if (inputs.g4CsgOD) setG4CsgOD(String(inputs.g4CsgOD));
      if (inputs.g4CsgID) setG4CsgID(String(inputs.g4CsgID));
      if (inputs.g4Excess) setG4Excess(String(inputs.g4Excess));
      if (inputs.g4Shoe) setG4Shoe(String(inputs.g4Shoe));
      if (inputs.g4Rat) setG4Rat(String(inputs.g4Rat));
      if (inputs.g4DP_ID) setG4DP_ID(String(inputs.g4DP_ID));
    }
  }, [initialData]);

  // Developer Info State
  const [showDev, setShowDev] = useState(false);
  const [devIdx, setDevIdx] = useState(0);
  const lastTapRef = useRef<number>(0);
  const lpTimerRef = useRef<NodeJS.Timeout | null>(null);
  const developers = ["Engineer Gebril Salh Alhamoudi", "Engineer Faraj Meftah"];

  useEffect(() => {
    if (showDev) {
      const interval = setInterval(() => setDevIdx(i => (i + 1) % 2), 2000);
      const timer = setTimeout(() => setShowDev(false), 600000);
      return () => { clearInterval(interval); clearTimeout(timer); };
    }
  }, [showDev]);

  const handleDevDown = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 400) {
      lpTimerRef.current = setTimeout(() => setShowDev(prev => !prev), 600);
    }
    lastTapRef.current = now;
  };

  const handleDevUp = () => {
    if (lpTimerRef.current) { clearTimeout(lpTimerRef.current); lpTimerRef.current = null; }
  };

  // --- السكشن الأول ---
  const [g1Hole, setG1Hole] = useState<string>('24');
  const [g1CsgOD, setG1CsgOD] = useState<string>('18.625');
  const [g1CsgID, setG1CsgID] = useState<string>('17.755');
  const [g1Depth, setG1Depth] = useState<string>('250');
  const [g1Excess, setG1Excess] = useState<string>('100');
  const [g1Shoe, setG1Shoe] = useState<string>('20');
  const [g1Rat, setG1Rat] = useState<string>('3');

  // --- السكشن الثاني ---
  const [g2TotalDepth, setG2TotalDepth] = useState<string>('3200');
  const [g2PrevShoe, setG2PrevShoe] = useState<string>('350');
  const [g2TailH, setG2TailH] = useState<string>('500');
  const [g2Hole, setG2Hole] = useState<string>('17.5');
  const [g2PrevOD, setG2PrevOD] = useState<string>('18.625');
  const [g2PrevID, setG2PrevID] = useState<string>('17.755');
  const [g2CsgOD, setG2CsgOD] = useState<string>('13.375');
  const [g2CsgID, setG2CsgID] = useState<string>('12.347');
  const [g2Excess, setG2Excess] = useState<string>('20');
  const [g2Shoe, setG2Shoe] = useState<string>('90');
  const [g2Rat, setG2Rat] = useState<string>('5');

  // --- السكشن الثالث ---
  const [g3TotalDepth, setG3TotalDepth] = useState<string>('8528');
  const [g3PrevShoe, setG3PrevShoe] = useState<string>('3200');
  const [g3DvDepth, setG3DvDepth] = useState<string>('3600');
  const [g3TailH, setG3TailH] = useState<string>('500');
  const [g3Hole, setG3Hole] = useState<string>('12.25');
  const [g3PrevOD, setG3PrevOD] = useState<string>('13.375');
  const [g3PrevID, setG3PrevID] = useState<string>('12.347');
  const [g3CsgOD, setG3CsgOD] = useState<string>('9.625');
  const [g3CsgID, setG3CsgID] = useState<string>('8.681');
  const [g3Excess, setG3Excess] = useState<string>('20');
  const [g3Shoe, setG3Shoe] = useState<string>('87');
  const [g3Rat, setG3Rat] = useState<string>('5');

  // --- السكشن الرابع (Liner) ---
  const [g4TotalDepth, setG4TotalDepth] = useState<string>('11504');
  const [g4LinerTop, setG4LinerTop] = useState<string>('8228');
  const [g4PrevShoe, setG4PrevShoe] = useState<string>('8528');
  const [g4TailH, setG4TailH] = useState<string>('1000');
  const [g4Hole, setG4Hole] = useState<string>('8.5');
  const [g4PrevID, setG4PrevID] = useState<string>('8.681');
  const [g4PrevOD, setG4PrevOD] = useState<string>('9.625');
  const [g4CsgOD, setG4CsgOD] = useState<string>('7');
  const [g4CsgID, setG4CsgID] = useState<string>('6.184');
  const [g4Excess, setG4Excess] = useState<string>('20');
  const [g4Shoe, setG4Shoe] = useState<string>('40');
  const [g4Rat, setG4Rat] = useState<string>('5');
  const [g4DP_ID, setG4DP_ID] = useState<string>('4.276');

  // --- Densities ---
  const [mudDens, setMudDens] = useState<string>('9.5');
  const [leadDens, setLeadDens] = useState<string>('12.5');
  const [tailDens, setTailDens] = useState<string>('15.8');

  const K = 1029.4;

  const [res1, setRes1] = useState({ v1: 0, v1Sub: '', v2: 0, v2Sub: '', v3: 0, v3Sub: '', total: 0, disp: 0, dispSub: '', diffPress: 0, diffPressSub: '', hpAnn: 0, hpAnnSub: '', hpCsg: 0, hpCsgSub: '' });
  const [res1Approx, setRes1Approx] = useState({ v1: 0, v1Sub: '', v2: 0, v2Sub: '', v3: 0, v3Sub: '', total: 0, disp: 0, dispSub: '', diffPress: 0, diffPressSub: '', hpAnn: 0, hpAnnSub: '', hpCsg: 0, hpCsgSub: '' });
  
  const [explanationModal, setExplanationModal] = useState<{ title: string, content: string, range?: string, formula?: string } | null>(null);

  const curRes1 = isApproximate ? res1Approx : res1;

  useEffect(() => {
    const h = parseFloat(g1Hole) || 0, od = parseFloat(g1CsgOD) || 0, id = parseFloat(g1CsgID) || 0, d = parseFloat(g1Depth) || 0, e = 1 + (parseFloat(g1Excess) || 0)/100, s = parseFloat(g1Shoe) || 0, r = parseFloat(g1Rat) || 0;
    const v1 = ((h**2 - od**2) / K) * d * e, v2 = (h**2 / K) * r * e, v3 = (id**2 / K) * s, disp = (id**2 / K) * (d - s);

    const md = parseFloat(mudDens) || 0, td = parseFloat(tailDens) || 0;
    const hpAnn = td * d * 0.052;
    const hpCsg = (md * (d - s) * 0.052) + (td * s * 0.052);
    const diffPress = hpAnn - hpCsg;

    setRes1({ 
      v1, v1Sub: `V = \\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${d} \\times ${e}`, 
      v2, v2Sub: `V = \\frac{${h}^2}{${K}} \\times ${r} \\times ${e}`, 
      v3, v3Sub: `V = \\frac{${id}^2}{${K}} \\times ${s}`, 
      total: v1+v2+v3, 
      disp, dispSub: `Disp = \\frac{${id}^2}{${K}} \\times (${d} - ${s})`,
      diffPress,
      diffPressSub: `\\Delta P = ${hpAnn.toFixed(0)} - ${hpCsg.toFixed(0)}`,
      hpAnn,
      hpAnnSub: `HP_{Ann} = ${td} \\times ${d} \\times 0.052`,
      hpCsg,
      hpCsgSub: `HP_{Csg} = (${md} \\times ${(d-s).toFixed(0)} \\times 0.052) + (${td} \\times ${s} \\times 0.052)`
    });

    const v3_approx = (od**2 / K) * s;
    const disp_approx = (od**2 / K) * (d - s);
    setRes1Approx({
      v1, v1Sub: `V = \\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${d} \\times ${e}`, 
      v2, v2Sub: `V = \\frac{${h}^2}{${K}} \\times ${r} \\times ${e}`, 
      v3: v3_approx, v3Sub: `V = \\frac{${od}^2}{${K}} \\times ${s}`, 
      total: v1+v2+v3_approx, 
      disp: disp_approx, dispSub: `Disp = \\frac{${od}^2}{${K}} \\times (${d} - ${s})`,
      diffPress,
      diffPressSub: `\\Delta P = ${hpAnn.toFixed(0)} - ${hpCsg.toFixed(0)}`,
      hpAnn,
      hpAnnSub: `HP_{Ann} = ${td} \\times ${d} \\times 0.052`,
      hpCsg,
      hpCsgSub: `HP_{Csg} = (${md} \\times ${(d-s).toFixed(0)} \\times 0.052) + (${td} \\times ${s} \\times 0.052)`
    });
  }, [g1Hole, g1CsgOD, g1CsgID, g1Depth, g1Excess, g1Shoe, g1Rat, mudDens, tailDens]);

  const [res2, setRes2] = useState({ v1: 0, v1Sub: '', v2: 0, v2Sub: '', v3: 0, v3Sub: '', v4: 0, v4Sub: '', v5: 0, v5Sub: '', total: 0, disp: 0, dispSub: '', leadTotal: 0, tailTotal: 0, diffPress: 0, diffPressSub: '', hpAnn: 0, hpAnnSub: '', hpCsg: 0, hpCsgSub: '' });
  const [res2Approx, setRes2Approx] = useState({ v1: 0, v1Sub: '', v2: 0, v2Sub: '', v3: 0, v3Sub: '', v4: 0, v4Sub: '', v5: 0, v5Sub: '', total: 0, disp: 0, dispSub: '', leadTotal: 0, tailTotal: 0, diffPress: 0, diffPressSub: '', hpAnn: 0, hpAnnSub: '', hpCsg: 0, hpCsgSub: '' });

  const curRes2 = isApproximate ? res2Approx : res2;

  useEffect(() => {
    const h = parseFloat(g2Hole) || 0, pid = parseFloat(g2PrevID) || 0, pod = parseFloat(g2PrevOD) || 0, od = parseFloat(g2CsgOD) || 0, id = parseFloat(g2CsgID) || 0, td_depth = parseFloat(g2TotalDepth) || 0, ps = parseFloat(g2PrevShoe) || 0, ti = parseFloat(g2TailH) || 0, e = 1 + (parseFloat(g2Excess) || 0)/100, s = parseFloat(g2Shoe) || 0, r = parseFloat(g2Rat) || 0;
    const lOH = Math.max(0, td_depth - ti - ps);
    const v1 = ((pid**2 - od**2) / K) * ps, v2 = ((h**2 - od**2) / K) * lOH * e, v3 = ((h**2 - od**2) / K) * ti * e, v4 = (h**2 / K) * r * e, v5 = (id**2 / K) * s, disp = (id**2 / K) * (td_depth - s);
    
    const md = parseFloat(mudDens) || 0, ld = parseFloat(leadDens) || 0, td_dens = parseFloat(tailDens) || 0;
    const hpAnn = (ld * (td_depth - ti) * 0.052) + (td_dens * ti * 0.052);
    const hpCsg = (md * (td_depth - s) * 0.052) + (td_dens * s * 0.052);
    const diffPress = hpAnn - hpCsg;

    setRes2({ 
      v1, v1Sub: `V = \\frac{(${pid}^2 - ${od}^2)}{${K}} \\times ${ps}`, 
      v2, v2Sub: `V = \\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${lOH.toFixed(1)} \\times ${e}`, 
      v3, v3Sub: `V = \\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${ti} \\times ${e}`, 
      v4, v4Sub: `V = \\frac{${h}^2}{${K}} \\times ${r} \\times ${e}`, 
      v5, v5Sub: `V = \\frac{${id}^2}{${K}} \\times ${s}`, 
      total: v1+v2+v3+v4+v5, 
      disp, dispSub: `Disp = \\frac{${id}^2}{${K}} \\times (${td_depth} - ${s})`, 
      leadTotal: v1+v2, tailTotal: v3+v4+v5,
      diffPress,
      diffPressSub: `\\Delta P = ${hpAnn.toFixed(0)} - ${hpCsg.toFixed(0)}`,
      hpAnn,
      hpAnnSub: `HP_{Ann} = (${ld} \\times ${(td_depth-ti).toFixed(0)} \\times 0.052) + (${td_dens} \\times ${ti} \\times 0.052)`,
      hpCsg,
      hpCsgSub: `HP_{Csg} = (${md} \\times ${(td_depth-s).toFixed(0)} \\times 0.052) + (${td_dens} \\times ${s} \\times 0.052)`
    });

    const v1_approx = ((pod**2 - od**2) / K) * ps;
    const v5_approx = (od**2 / K) * s;
    const disp_approx = (od**2 / K) * (td_depth - s);

    setRes2Approx({
      v1: v1_approx, v1Sub: `V = \\frac{(${pod}^2 - ${od}^2)}{${K}} \\times ${ps}`, 
      v2, v2Sub: `V = \\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${lOH.toFixed(1)} \\times ${e}`, 
      v3, v3Sub: `V = \\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${ti} \\times ${e}`, 
      v4, v4Sub: `V = \\frac{${h}^2}{${K}} \\times ${r} \\times ${e}`, 
      v5: v5_approx, v5Sub: `V = \\frac{${od}^2}{${K}} \\times ${s}`, 
      total: v1_approx+v2+v3+v4+v5_approx, 
      disp: disp_approx, dispSub: `Disp = \\frac{${od}^2}{${K}} \\times (${td_depth} - ${s})`, 
      leadTotal: v1_approx+v2, tailTotal: v3+v4+v5_approx,
      diffPress,
      diffPressSub: `\\Delta P = ${hpAnn.toFixed(0)} - ${hpCsg.toFixed(0)}`,
      hpAnn,
      hpAnnSub: `HP_{Ann} = (${ld} \\times ${(td_depth-ti).toFixed(0)} \\times 0.052) + (${td_dens} \\times ${ti} \\times 0.052)`,
      hpCsg,
      hpCsgSub: `HP_{Csg} = (${md} \\times ${(td_depth-s).toFixed(0)} \\times 0.052) + (${td_dens} \\times ${s} \\times 0.052)`
    });
  }, [g2Hole, g2PrevOD, g2PrevID, g2CsgOD, g2CsgID, g2TotalDepth, g2PrevShoe, g2TailH, g2Rat, g2Shoe, g2Excess, mudDens, leadDens, tailDens]);

  const [res3, setRes3] = useState({ vC: 0, vCSub: '', vS2OH: 0, vS2OHSub: '', vL: 0, vLSub: '', vT: 0, vTSub: '', vR: 0, vRSub: '', vS: 0, vSSub: '', total: 0, d1: 0, d1Sub: '', d2: 0, d2Sub: '', leadTotal: 0, tailTotal: 0, diffPress: 0, diffPressSub: '', diffPressS2: 0, diffPressS2Sub: '', hpAnn: 0, hpAnnSub: '', hpCsg: 0, hpCsgSub: '', hpAnnS2: 0, hpAnnS2Sub: '', hpCsgS2: 0, hpCsgS2Sub: '' });
  const [res3Approx, setRes3Approx] = useState({ vC: 0, vCSub: '', vS2OH: 0, vS2OHSub: '', vL: 0, vLSub: '', vT: 0, vTSub: '', vR: 0, vRSub: '', vS: 0, vSSub: '', total: 0, d1: 0, d1Sub: '', d2: 0, d2Sub: '', leadTotal: 0, tailTotal: 0, diffPress: 0, diffPressSub: '', diffPressS2: 0, diffPressS2Sub: '', hpAnn: 0, hpAnnSub: '', hpCsg: 0, hpCsgSub: '', hpAnnS2: 0, hpAnnS2Sub: '', hpCsgS2: 0, hpCsgS2Sub: '' });

  const curRes3 = isApproximate ? res3Approx : res3;

  useEffect(() => {
    const h = parseFloat(g3Hole) || 0, od = parseFloat(g3CsgOD) || 0, id = parseFloat(g3CsgID) || 0, pid = parseFloat(g3PrevID) || 0, pod = parseFloat(g3PrevOD) || 0, td_depth = parseFloat(g3TotalDepth) || 0, ps = parseFloat(g3PrevShoe) || 0, dv = parseFloat(g3DvDepth) || 0, ti = parseFloat(g3TailH) || 0, e = 1 + (parseFloat(g3Excess) || 0)/100, s = parseFloat(g3Shoe) || 0, r = parseFloat(g3Rat) || 0;
    const lCH = ps, lS2OH = Math.max(0, dv - ps), lLead = Math.max(0, (td_depth - ti) - dv), lTail = ti;
    const vC = ((pid**2 - od**2) / K) * lCH, vS2OH = ((h**2 - od**2) / K) * lS2OH * e, vL = ((h**2 - od**2) / K) * lLead * e, vT = ((h**2 - od**2) / K) * lTail * e, vR = (h**2 / K) * r * e, vS = (id**2 / K) * s;
    
    // DP for Stage 1
    const md = parseFloat(mudDens) || 0, ld = parseFloat(leadDens) || 0, td_dens = parseFloat(tailDens) || 0;
    const hpAnn = (md * dv * 0.052) + (ld * (td_depth - ti - dv) * 0.052) + (td_dens * ti * 0.052);
    const hpCsg = (md * (td_depth - s) * 0.052) + (td_dens * s * 0.052);
    const diffPress = hpAnn - hpCsg;

    // DP for Stage 2 (at DV tool finish)
    const hpAnnS2 = ld * dv * 0.052;
    const hpCsgS2 = md * dv * 0.052;
    const diffPressS2 = hpAnnS2 - hpCsgS2;

    setRes3({ 
      vC, vCSub: `V = \\frac{(${pid}^2 - ${od}^2)}{${K}} \\times ${lCH}`, 
      vS2OH, vS2OHSub: `V = \\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${lS2OH.toFixed(1)} \\times ${e}`, 
      vL, vLSub: `V = \\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${lLead.toFixed(1)} \\times ${e}`, 
      vT, vTSub: `V = \\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${lTail} \\times ${e}`, 
      vR, vRSub: `V = \\frac{${h}^2}{${K}} \\times ${r} \\times ${e}`, 
      vS, vSSub: `V = \\frac{${id}^2}{${K}} \\times ${s}`, 
      total: vC+vS2OH+vL+vT+vR+vS, 
      d1: (id**2/K)*(td_depth-s), d1Sub: `Disp_1 = \\frac{${id}^2}{${K}} \\times (${td_depth} - ${s})`, 
      d2: (id**2/K)*dv, d2Sub: `Disp_2 = \\frac{${id}^2}{${K}} \\times ${dv}`, 
      leadTotal: vC+vS2OH+vL, tailTotal: vT+vR+vS,
      diffPress,
      diffPressSub: `\\Delta P_1 = ${hpAnn.toFixed(0)} - ${hpCsg.toFixed(0)}`,
      diffPressS2,
      diffPressS2Sub: `\\Delta P_2 = ${hpAnnS2.toFixed(0)} - ${hpCsgS2.toFixed(0)}`,
      hpAnn,
      hpAnnSub: `HP_{Ann} = (${md} \\times ${dv} \\times 0.052) + (${ld} \\times ${(td_depth-ti-dv).toFixed(0)} \\times 0.052) + (${td_dens} \\times ${ti} \\times 0.052)`,
      hpCsg,
      hpCsgSub: `HP_{Csg} = (${md} \\times ${(td_depth-s).toFixed(0)} \\times 0.052) + (${td_dens} \\times ${s} \\times 0.052)`,
      hpAnnS2,
      hpAnnS2Sub: `HP_{Ann} = ${ld} \\times ${dv} \\times 0.052`,
      hpCsgS2,
      hpCsgS2Sub: `HP_{Csg} = ${md} \\times ${dv} \\times 0.052`
    });

    const vC_approx = ((pod**2 - od**2) / K) * lCH;
    const vS_approx = (od**2 / K) * s;
    const d1_approx = (od**2 / K) * (td_depth - s);
    const d2_approx = (od**2 / K) * dv;

    setRes3Approx({ 
      vC: vC_approx, vCSub: `V = \\frac{(${pod}^2 - ${od}^2)}{${K}} \\times ${lCH}`, 
      vS2OH, vS2OHSub: `V = \\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${lS2OH.toFixed(1)} \\times ${e}`, 
      vL, vLSub: `V = \\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${lLead.toFixed(1)} \\times ${e}`, 
      vT, vTSub: `V = \\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${lTail} \\times ${e}`, 
      vR, vRSub: `V = \\frac{${h}^2}{${K}} \\times ${r} \\times ${e}`, 
      vS: vS_approx, vSSub: `V = \\frac{${od}^2}{${K}} \\times ${s}`, 
      total: vC_approx+vS2OH+vL+vT+vR+vS_approx, 
      d1: d1_approx, d1Sub: `Disp_1 = \\frac{${od}^2}{${K}} \\times (${td_depth} - ${s})`, 
      d2: d2_approx, d2Sub: `Disp_2 = \\frac{${od}^2}{${K}} \\times ${dv}`, 
      leadTotal: vC_approx+vS2OH+vL, tailTotal: vT+vR+vS_approx,
      diffPress,
      diffPressSub: `\\Delta P_1 = ${hpAnn.toFixed(0)} - ${hpCsg.toFixed(0)}`,
      diffPressS2,
      diffPressS2Sub: `\\Delta P_2 = ${hpAnnS2.toFixed(0)} - ${hpCsgS2.toFixed(0)}`,
      hpAnn,
      hpAnnSub: `HP_{Ann} = (${md} \\times ${dv} \\times 0.052) + (${ld} \\times ${(td_depth-ti-dv).toFixed(0)} \\times 0.052) + (${td_dens} \\times ${ti} \\times 0.052)`,
      hpCsg,
      hpCsgSub: `HP_{Csg} = (${md} \\times ${(td_depth-s).toFixed(0)} \\times 0.052) + (${td_dens} \\times ${s} \\times 0.052)`,
      hpAnnS2,
      hpAnnS2Sub: `HP_{Ann} = ${ld} \\times ${dv} \\times 0.052`,
      hpCsgS2,
      hpCsgS2Sub: `HP_{Csg} = ${md} \\times ${dv} \\times 0.052`
    });
  }, [g3Hole, g3PrevOD, g3CsgOD, g3CsgID, g3PrevID, g3TotalDepth, g3PrevShoe, g3DvDepth, g3TailH, g3Excess, g3Shoe, g3Rat, mudDens, leadDens, tailDens]);

  const [res4, setRes4] = useState({ vOverlap: 0, vOverlapSub: '', vLeadOH: 0, vLeadOHSub: '', vTailOH: 0, vTailOHSub: '', vRat: 0, vRatSub: '', vShoe: 0, vShoeSub: '', total: 0, disp: 0, dispSub: '', leadTotal: 0, tailTotal: 0, diffPress: 0, diffPressSub: '', hpAnn: 0, hpAnnSub: '', hpCsg: 0, hpCsgSub: '' });
  const [res4Approx, setRes4Approx] = useState({ vOverlap: 0, vOverlapSub: '', vLeadOH: 0, vLeadOHSub: '', vTailOH: 0, vTailOHSub: '', vRat: 0, vRatSub: '', vShoe: 0, vShoeSub: '', total: 0, disp: 0, dispSub: '', leadTotal: 0, tailTotal: 0, diffPress: 0, diffPressSub: '', hpAnn: 0, hpAnnSub: '', hpCsg: 0, hpCsgSub: '' });

  const curRes4 = isApproximate ? res4Approx : res4;

  useEffect(() => {
    const h = parseFloat(g4Hole) || 0, od = parseFloat(g4CsgOD) || 0, id = parseFloat(g4CsgID) || 0, pid = parseFloat(g4PrevID) || 0, pod = parseFloat(g4PrevOD) || 0, td = parseFloat(g4TotalDepth) || 0, ps = parseFloat(g4PrevShoe) || 0, lt = parseFloat(g4LinerTop) || 0, ti = parseFloat(g4TailH) || 0, e = 1 + (parseFloat(g4Excess) || 0)/100, s = parseFloat(g4Shoe) || 0, r = parseFloat(g4Rat) || 0;
    const lOverlap = Math.max(0, ps - lt);
    const lLeadOH = Math.max(0, (td - ti) - ps);
    const lTailOH = ti;
    const vOverlap = ((pid**2 - od**2) / K) * lOverlap;
    const vLeadOH = ((h**2 - od**2) / K) * lLeadOH * e;
    const vTailOH = ((h**2 - od**2) / K) * lTailOH * e;
    const vRat = (h**2 / K) * r * e;
    const vShoe = (id**2 / K) * s;
    const dpID = parseFloat(g4DP_ID) || 0;
    const dispLiner = (id**2 / K) * (td - lt - s);
    const dispDP = (dpID**2 / K) * lt;
    const disp = dispDP + dispLiner; 

    // DP Calculation
    const md = parseFloat(mudDens) || 0, ld = parseFloat(leadDens) || 0, td_dens = parseFloat(tailDens) || 0;
    const hpAnn = (md * lt * 0.052) + (ld * (td - ti - lt) * 0.052) + (td_dens * ti * 0.052);
    const hpCsg = (md * (td - s) * 0.052) + (td_dens * s * 0.052);
    const diffPress = hpAnn - hpCsg;

    setRes4({ 
      vOverlap, vOverlapSub: `V = \\frac{(${pid}^2 - ${od}^2)}{${K}} \\times ${lOverlap}`, 
      vLeadOH, vLeadOHSub: `V = \\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${lLeadOH.toFixed(1)} \\times ${e}`, 
      vTailOH, vTailOHSub: `V = \\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${lTailOH} \\times ${e}`, 
      vRat, vRatSub: `V = \\frac{${h}^2}{${K}} \\times ${r} \\times ${e}`, 
      vShoe, vShoeSub: `V = \\frac{${id}^2}{${K}} \\times ${s}`, 
      total: vOverlap+vLeadOH+vTailOH+vRat+vShoe, 
      disp, 
      dispSub: `Disp = \\left(\\frac{${dpID}^2}{${K}} \\times ${lt}\\right) + \\left(\\frac{${id}^2}{${K}} \\times (${td} - ${lt} - ${s})\\right)`, 
      leadTotal: vOverlap+vLeadOH, 
      tailTotal: vTailOH+vRat+vShoe,
      diffPress,
      diffPressSub: `\\Delta P = ${hpAnn.toFixed(0)} - ${hpCsg.toFixed(0)}`,
      hpAnn,
      hpAnnSub: `HP_{Ann} = (${md} \\times ${lt} \\times 0.052) + (${ld} \\times ${(td-ti-lt).toFixed(0)} \\times 0.052) + (${td_dens} \\times ${ti} \\times 0.052)`,
      hpCsg,
      hpCsgSub: `HP_{Csg} = (${md} \\times ${(td-s).toFixed(0)} \\times 0.052) + (${td_dens} \\times ${s} \\times 0.052)`
    });

    const vOverlap_approx = ((pod**2 - od**2) / K) * lOverlap;
    const vShoe_approx = (od**2 / K) * s;
    const dispLiner_approx = (od**2 / K) * (td - lt - s);
    const dispDP_approx = (5.0**2 / K) * lt;
    const disp_approx = dispDP_approx + dispLiner_approx;

    setRes4Approx({
      vOverlap: vOverlap_approx, vOverlapSub: `V = \\frac{(${pod}^2 - ${od}^2)}{${K}} \\times ${lOverlap}`,
      vLeadOH, vLeadOHSub: `V = \\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${lLeadOH.toFixed(1)} \\times ${e}`,
      vTailOH, vTailOHSub: `V = \\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${lTailOH} \\times ${e}`,
      vRat, vRatSub: `V = \\frac{${h}^2}{${K}} \\times ${r} \\times ${e}`,
      vShoe: vShoe_approx, vShoeSub: `V = \\frac{${od}^2}{${K}} \\times ${s}`,
      total: vOverlap_approx+vLeadOH+vTailOH+vRat+vShoe_approx,
      disp: disp_approx,
      dispSub: `Disp = \\left(\\frac{5.0^2}{${K}} \\times ${lt}\\right) + \\left(\\frac{${od}^2}{${K}} \\times (${td} - ${lt} - ${s})\\right)`,
      leadTotal: vOverlap_approx+vLeadOH,
      tailTotal: vTailOH+vRat+vShoe_approx,
      diffPress,
      diffPressSub: `\\Delta P = ${hpAnn.toFixed(0)} - ${hpCsg.toFixed(0)}`,
      hpAnn,
      hpAnnSub: `HP_{Ann} = (${md} \\times ${lt} \\times 0.052) + (${ld} \\times ${(td-ti-lt).toFixed(0)} \\times 0.052) + (${td_dens} \\times ${ti} \\times 0.052)`,
      hpCsg,
      hpCsgSub: `HP_{Csg} = (${md} \\times ${(td-s).toFixed(0)} \\times 0.052) + (${td_dens} \\times ${s} \\times 0.052)`
    });
  }, [g4Hole, g4CsgOD, g4CsgID, g4PrevID, g4PrevOD, g4TotalDepth, g4PrevShoe, g4LinerTop, g4TailH, g4Excess, g4Shoe, g4Rat, g4DP_ID, mudDens, leadDens, tailDens]);

  const handleSave = () => {
    const cur = activeTab === 'SEC1' ? curRes1 : activeTab === 'SEC2' ? curRes2 : activeTab === 'SEC3' ? curRes3 : curRes4;
    onResult({ 
      id: Date.now().toString(), 
      type: CalcType.TOTAL_CEMENT, 
      title: `إجمالي السيمنت الشامل - ${activeTab}${isApproximate ? ' - تقريبي' : ''}`, 
      inputs: { 
        Tab: activeTab, 
        isApproximate: String(isApproximate),
        Volume: cur.total.toFixed(2),
        mudDens, leadDens, tailDens,
        g1Hole, g1CsgOD, g1CsgID, g1Depth, g1Excess, g1Shoe, g1Rat,
        g2TotalDepth, g2PrevShoe, g2TailH, g2Hole, g2PrevOD, g2PrevID, g2CsgOD, g2CsgID, g2Excess, g2Shoe, g2Rat,
        g3TotalDepth, g3PrevShoe, g3DvDepth, g3TailH, g3Hole, g3PrevOD, g3PrevID, g3CsgOD, g3CsgID, g3Excess, g3Shoe, g3Rat,
        g4TotalDepth, g4LinerTop, g4PrevShoe, g4TailH, g4Hole, g4PrevID, g4PrevOD, g4CsgOD, g4CsgID, g4Excess, g4Shoe, g4Rat, g4DP_ID
      }, 
      result: cur.total, 
      timestamp: Date.now() 
    });
    alert('تم حفظ التقرير');
  };

  const diagramData = {
    holeSize: parseFloat(activeTab === 'SEC1' ? g1Hole : activeTab === 'SEC2' ? g2Hole : activeTab === 'SEC3' ? g3Hole : g4Hole) || 0,
    casingOD: parseFloat(activeTab === 'SEC1' ? g1CsgOD : activeTab === 'SEC2' ? g2CsgOD : activeTab === 'SEC3' ? g3CsgOD : g4CsgOD) || 0,
    casingID: isApproximate 
      ? (parseFloat(activeTab === 'SEC1' ? g1CsgOD : activeTab === 'SEC2' ? g2CsgOD : activeTab === 'SEC3' ? g3CsgOD : g4CsgOD) || 0) 
      : (parseFloat(activeTab === 'SEC1' ? g1CsgID : activeTab === 'SEC2' ? g2CsgID : activeTab === 'SEC3' ? g3CsgID : g4CsgID) || 0),
    casingDepth: parseFloat(activeTab === 'SEC1' ? g1Depth : activeTab === 'SEC2' ? g2TotalDepth : activeTab === 'SEC3' ? g3TotalDepth : g4TotalDepth) || 0,
    holeDepth: (parseFloat(activeTab === 'SEC1' ? g1Depth : activeTab === 'SEC2' ? g2TotalDepth : activeTab === 'SEC3' ? g3TotalDepth : g4TotalDepth) || 0) + (parseFloat(activeTab === 'SEC1' ? g1Rat : activeTab === 'SEC2' ? g2Rat : activeTab === 'SEC3' ? g3Rat : g4Rat) || 0),
    shoeTrack: parseFloat(activeTab === 'SEC1' ? g1Shoe : activeTab === 'SEC2' ? g2Shoe : activeTab === 'SEC3' ? g3Shoe : g4Shoe) || 0,
    ratHole: parseFloat(activeTab === 'SEC1' ? g1Rat : activeTab === 'SEC2' ? g2Rat : activeTab === 'SEC3' ? g3Rat : g4Rat) || 0,
    displacement: activeTab === 'SEC1' ? curRes1.disp : activeTab === 'SEC2' ? curRes2.disp : activeTab === 'SEC3' ? curRes3.d1 : curRes4.disp,
    floatCollarDepth: activeTab === 'SEC1' ? (parseFloat(g1Depth) - parseFloat(g1Shoe)) : activeTab === 'SEC2' ? (parseFloat(g2TotalDepth) - parseFloat(g2Shoe)) : activeTab === 'SEC3' ? (parseFloat(g3TotalDepth) - parseFloat(g3Shoe)) : (parseFloat(g4TotalDepth) - parseFloat(g4Shoe)),
    annularVolume: activeTab === 'SEC1' ? (curRes1.v1 + curRes1.v2) : activeTab === 'SEC2' ? (curRes2.v1 + curRes2.v2 + curRes2.v3 + curRes2.v4) : activeTab === 'SEC3' ? (curRes3.vC + curRes3.vS2OH + curRes3.vL + curRes3.vT + curRes3.vR) : (curRes4.vOverlap + curRes4.vLeadOH + curRes4.vTailOH + curRes4.vRat),
    excess: parseFloat(activeTab === 'SEC1' ? g1Excess : activeTab === 'SEC2' ? g2Excess : activeTab === 'SEC3' ? g3Excess : g4Excess) || 0,
    tailDepth: activeTab === 'SEC1' ? (parseFloat(g1Depth) - parseFloat(g1Depth)) : activeTab === 'SEC2' ? (parseFloat(g2TotalDepth) - parseFloat(g2TailH)) : activeTab === 'SEC3' ? (parseFloat(g3TotalDepth) - parseFloat(g3TailH)) : activeTab === 'SEC4' ? (parseFloat(g4TotalDepth) - parseFloat(g4TailH)) : undefined,
    leadDepth: activeTab === 'SEC1' ? undefined : activeTab === 'SEC2' ? 0 : activeTab === 'SEC3' ? parseFloat(g3PrevShoe) : activeTab === 'SEC4' ? parseFloat(g4LinerTop) : undefined,
    dvToolDepth: activeTab === 'SEC3' ? parseFloat(g3DvDepth) : undefined,
    prevCasingDepth: activeTab === 'SEC2' ? parseFloat(g2PrevShoe) : activeTab === 'SEC3' ? parseFloat(g3PrevShoe) : activeTab === 'SEC4' ? parseFloat(g4PrevShoe) : undefined,
    prevCasingOD: activeTab === 'SEC2' ? parseFloat(g2PrevOD) : activeTab === 'SEC3' ? parseFloat(g3PrevOD) : activeTab === 'SEC4' ? parseFloat(g4PrevOD) : undefined,
    prevCasingID: isApproximate 
      ? (activeTab === 'SEC2' ? parseFloat(g2PrevOD) : activeTab === 'SEC3' ? parseFloat(g3PrevOD) : activeTab === 'SEC4' ? parseFloat(g4PrevOD) : undefined)
      : (activeTab === 'SEC2' ? parseFloat(g2PrevID) : activeTab === 'SEC3' ? parseFloat(g3PrevID) : activeTab === 'SEC4' ? parseFloat(g4PrevID) : undefined),
    linerTopDepth: activeTab === 'SEC4' ? parseFloat(g4LinerTop) : undefined,
    mudDens: parseFloat(mudDens) || 0,
    leadDens: parseFloat(activeTab === 'SEC1' ? '0' : leadDens) || 0,
    tailDens: parseFloat(tailDens) || 0
  };

  return (
    <div className="space-y-6 text-right pb-32">
      <header className="text-center relative">
        <h1 
          onPointerDown={handleDevDown}
          onPointerUp={handleDevUp}
          className="text-3xl font-black mb-1 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent italic tracking-tighter uppercase cursor-pointer select-none"
        >
          SECTION MASTER PRO
        </h1>
        <AnimatePresence mode="wait">
          {showDev && (
            <motion.div 
              key={devIdx}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl mt-2 inline-block mx-auto"
            >
              <span className="text-[10px] font-black text-blue-400 italic uppercase">
                Developer: {developers[devIdx]}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex bg-slate-900/60 p-1 rounded-2xl border border-slate-800 backdrop-blur-md mt-4 max-w-sm mx-auto overflow-x-auto no-scrollbar">
           <button onClick={() => setActiveTab('SEC1')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black transition-all ${activeTab === 'SEC1' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>السكشن الأول</button>
           <button onClick={() => setActiveTab('SEC2')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black transition-all ${activeTab === 'SEC2' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>السكشن الثاني</button>
           <button onClick={() => setActiveTab('SEC3')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black transition-all ${activeTab === 'SEC3' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500'}`}>السكشن الثالث</button>
           <button onClick={() => setActiveTab('SEC4')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black transition-all ${activeTab === 'SEC4' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}>السكشن الرابع</button>
        </div>

        {/* Toggle for Approximate Mode */}
        <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md mt-4 max-w-sm mx-auto overflow-x-auto no-scrollbar justify-center items-center gap-2">
          <button
            onClick={() => setIsApproximate(false)}
            className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black transition-all ${!isApproximate ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-400'}`}
          >
            الحساب الدقيق
          </button>
          <button
            onClick={() => setIsApproximate(true)}
            className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black transition-all ${isApproximate ? 'bg-amber-600 text-white shadow' : 'text-slate-500 hover:text-slate-400'}`}
          >
            الحساب التقريبي
          </button>
        </div>
      </header>

      {/* Dashboard Results */}
      <div className={`p-6 rounded-[2.5rem] border shadow-2xl relative overflow-hidden transition-all duration-500 bg-cyan-900/20 border-cyan-500/30`}>
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mt-16 blur-3xl"></div>
        <div className="flex flex-col items-center relative z-10 text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">إجمالي الحجم لـ {activeTab}</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-6xl font-black text-white">{(activeTab === 'SEC1' ? curRes1.total : activeTab === 'SEC2' ? curRes2.total : activeTab === 'SEC3' ? curRes3.total : curRes4.total).toFixed(1)}</span>
            <span className="text-2xl font-bold text-cyan-400 italic">bbl</span>
          </div>

          <div className="bg-slate-800/80 w-full px-4 py-3 rounded-2xl border border-slate-700 flex flex-col items-center gap-3">
             <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic tracking-wider">ملخص النتائج النهائية (Final Results Summary)</span>
             
             {/* Displacement Section */}
             <div className="w-full flex flex-col items-center border-b border-slate-700/50 pb-2 mb-1">
                <span className="text-[8px] text-slate-500 font-black uppercase mb-1">بيانات الإزاحة (Displacement)</span>
                {activeTab === 'SEC3' ? (
                  <div className="grid grid-cols-2 gap-4 w-full">
                     <div><span className="block text-[8px] text-cyan-400 font-bold italic uppercase tracking-widest">إزاحة م1 (Collar)</span><span className="text-lg font-black text-white">{curRes3.d1.toFixed(1)} <span className="text-[10px]">bbl</span></span></div>
                     <div className="border-r border-slate-700"><span className="block text-[8px] text-cyan-400 font-bold italic uppercase tracking-widest">إزاحة م2 (DV)</span><span className="text-lg font-black text-white">{curRes3.d2.toFixed(1)} <span className="text-[10px]">bbl</span></span></div>
                  </div>
                ) : (
                  <span className="text-2xl text-cyan-400 font-black">{(activeTab === 'SEC1' ? curRes1.disp : activeTab === 'SEC2' ? curRes2.disp : curRes4.disp).toFixed(1)} <span className="text-sm">bbl</span></span>
                )}
             </div>

             {/* Lead & Tail Section (Only for SEC2, SEC3, SEC4) */}
             {(activeTab === 'SEC2' || activeTab === 'SEC3' || activeTab === 'SEC4') && (
               <div className="grid grid-cols-2 gap-4 w-full">
                  <div>
                     <span className="block text-[8px] text-blue-400 font-black uppercase italic mb-0.5">إجمالي الليد (Lead)</span>
                     <span className="text-xl font-black text-white">{(activeTab === 'SEC2' ? curRes2.leadTotal : activeTab === 'SEC3' ? curRes3.leadTotal : curRes4.leadTotal).toFixed(1)} <span className="text-[10px]">bbl</span></span>
                  </div>
                  <div className="border-r border-slate-700">
                     <span className="block text-[8px] text-emerald-400 font-black uppercase italic mb-0.5">إجمالي الذيل (Tail)</span>
                     <span className="text-xl font-black text-white">{(activeTab === 'SEC2' ? curRes2.tailTotal : activeTab === 'SEC3' ? curRes3.tailTotal : curRes4.tailTotal).toFixed(1)} <span className="text-[10px]">bbl</span></span>
                  </div>
               </div>
             )}

             {/* Differential Pressure Section */}
             <div className="w-full flex flex-col items-center border-t border-slate-700/50 pt-2 mt-1">
                <span className="text-[8px] text-purple-400 font-black uppercase mb-1">الضغط التفاضلي (Differential Pressure)</span>
                {activeTab === 'SEC3' ? (
                  <div className="grid grid-cols-2 gap-4 w-full">
                     <div><span className="block text-[8px] text-purple-400/60 font-bold italic uppercase tracking-widest">م1 (Stage 1)</span><span className="text-lg font-black text-white">{curRes3.diffPress.toFixed(0)} <span className="text-[10px]">psi</span></span></div>
                     <div className="border-r border-slate-700"><span className="block text-[8px] text-purple-400/60 font-bold italic uppercase tracking-widest">م2 (Stage 2)</span><span className="text-lg font-black text-white">{curRes3.diffPressS2.toFixed(0)} <span className="text-[10px]">psi</span></span></div>
                  </div>
                ) : (
                  <span className="text-2xl text-purple-400 font-black">{(activeTab === 'SEC1' ? curRes1.diffPress : activeTab === 'SEC2' ? curRes2.diffPress : curRes4.diffPress).toFixed(0)} <span className="text-sm">psi</span></span>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Drawing Diagram */}
      <SectionDiagram 
        {...diagramData}
        type={activeTab}
      />

      <div className={`bg-slate-800/20 border ${expanded === 'global' ? 'border-blue-500/50 shadow-lg' : 'border-slate-800'} rounded-[2rem] overflow-hidden transition-all duration-300`}>
        <button onClick={() => setExpanded(expanded === 'global' ? null : 'global')} className="w-full p-5 flex items-center justify-between">
          {expanded === 'global' ? <ChevronUp className="text-blue-400 w-4 h-4" /> : <ChevronDown className="text-slate-500 w-4 h-4" />}
          <div className="flex items-center gap-3">
            <div className="text-right"><span className="block font-black text-xs text-white uppercase tracking-wider">Parameters Configuration</span><span className="block text-[9px] text-slate-500 font-bold italic">إعدادات التحكم الشامل</span></div>
            <Settings2 className={`w-5 h-5 ${expanded === 'global' ? 'text-blue-400' : 'text-slate-600'}`} />
          </div>
        </button>
        {expanded === 'global' && (
          <div className="p-6 pt-0 space-y-4 animate-in fade-in">
            <div className={`bg-slate-800/20 border border-slate-800 rounded-[2rem] overflow-hidden transition-all duration-300 mb-4`}>
              <div className="p-4 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase italic">Densities (lb/gal)</span>
                <span className="text-[10px] font-black text-slate-500 italic uppercase">بيانات الكثافة</span>
              </div>
              <div className="p-4 grid grid-cols-3 gap-3">
                <Input label="Mud (ppg)" val={mudDens} set={setMudDens} />
                <Input label="Lead (ppg)" val={leadDens} set={setLeadDens} />
                <Input label="Tail (ppg)" val={tailDens} set={setTailDens} />
              </div>
            </div>

            {activeTab === 'SEC1' ? (
              <>
                <div className="grid grid-cols-2 gap-4"><Input label="Hole Size (in)" val={g1Hole} set={setG1Hole} /><Input label="Hole Depth (ft)" val={g1Depth} set={setG1Depth} /></div>
                <div className="space-y-2 bg-slate-800/30 p-3 rounded-2xl border border-slate-700/40">
                  <CasingSelector label="الكيسينق الحالي (Current Csg)" currentOD={g1CsgOD} currentID={g1CsgID} onSelect={(od, id) => { setG1CsgOD(od); setG1CsgID(id); }} variant="current" />
                  <div className="grid grid-cols-2 gap-4"><Input label="Csg OD (in)" val={g1CsgOD} set={setG1CsgOD} /><Input label="Csg ID (in)" val={g1CsgID} set={setG1CsgID} /></div>
                </div>
                <div className="grid grid-cols-3 gap-2"><Input label="Excess (%)" val={g1Excess} set={setG1Excess} /><Input label="Shoe Track (ft)" val={g1Shoe} set={setG1Shoe} /><Input label="Rat Hole (ft)" val={g1Rat} set={setG1Rat} /></div>
              </>
            ) : activeTab === 'SEC2' ? (
              <>
                <div className="grid grid-cols-2 gap-4"><Input label="Total Depth (ft)" val={g2TotalDepth} set={setG2TotalDepth} /><Input label="Prev. Shoe (ft)" val={g2PrevShoe} set={setG2PrevShoe} /></div>
                <div className="grid grid-cols-2 gap-4"><Input label="Tail Interval (ft)" val={g2TailH} set={setG2TailH} /><Input label="Hole Size (in)" val={g2Hole} set={setG2Hole} /></div>
                <div className="space-y-2 bg-slate-800/30 p-3 rounded-2xl border border-amber-500/20">
                  <CasingSelector label="الكيسينق السابق (Prev Csg)" currentOD={g2PrevOD} currentID={g2PrevID} onSelect={(od, id) => { setG2PrevOD(od); setG2PrevID(id); }} variant="previous" />
                  <div className="grid grid-cols-2 gap-4"><Input label="Prev OD (in)" val={g2PrevOD} set={setG2PrevOD} /><Input label="Prev ID (in)" val={g2PrevID} set={setG2PrevID} /></div>
                </div>
                <div className="space-y-2 bg-slate-800/30 p-3 rounded-2xl border border-blue-500/20">
                  <CasingSelector label="الكيسينق الحالي (New Csg)" currentOD={g2CsgOD} currentID={g2CsgID} onSelect={(od, id) => { setG2CsgOD(od); setG2CsgID(id); }} variant="current" />
                  <div className="grid grid-cols-2 gap-4"><Input label="New Csg OD (in)" val={g2CsgOD} set={setG2CsgOD} /><Input label="New Csg ID (in)" val={g2CsgID} set={setG2CsgID} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4"><Input label="Shoe Track (ft)" val={g2Shoe} set={setG2Shoe} /><Input label="Rat Hole (ft)" val={g2Rat} set={setG2Rat} /></div>
                <div className="w-full"><Input label="Excess (%)" val={g2Excess} set={setG2Excess} /></div>
              </>
            ) : activeTab === 'SEC3' ? (
              <>
                <div className="grid grid-cols-2 gap-4"><Input label="Total Depth (ft)" val={g3TotalDepth} set={setG3TotalDepth} /><Input label="Prev. Shoe (ft)" val={g3PrevShoe} set={setG3PrevShoe} /></div>
                <div className="grid grid-cols-2 gap-4"><Input label="DV Tool (ft)" val={g3DvDepth} set={setG3DvDepth} /><Input label="Tail Interval (ft)" val={g3TailH} set={setG3TailH} /></div>
                <div className="space-y-2 bg-slate-800/30 p-3 rounded-2xl border border-amber-500/20">
                  <CasingSelector label="الكيسينق السابق (Prev Csg)" currentOD={g3PrevOD} currentID={g3PrevID} onSelect={(od, id) => { setG3PrevOD(od); setG3PrevID(id); }} variant="previous" />
                  <div className="grid grid-cols-2 gap-4"><Input label="Prev OD (in)" val={g3PrevOD} set={setG3PrevOD} /><Input label="Prev ID (in)" val={g3PrevID} set={setG3PrevID} /></div>
                </div>
                <div className="space-y-2 bg-slate-800/30 p-3 rounded-2xl border border-blue-500/20">
                  <CasingSelector label="الكيسينق الحالي (Current Csg)" currentOD={g3CsgOD} currentID={g3CsgID} onSelect={(od, id) => { setG3CsgOD(od); setG3CsgID(id); }} variant="current" />
                  <div className="grid grid-cols-2 gap-4"><Input label="Csg OD (in)" val={g3CsgOD} set={setG3CsgOD} /><Input label="Csg ID (in)" val={g3CsgID} set={setG3CsgID} /></div>
                </div>
                <div className="grid grid-cols-3 gap-2"><Input label="Hole Size (in)" val={g3Hole} set={setG3Hole} /><Input label="Shoe Track (ft)" val={g3Shoe} set={setG3Shoe} /><Input label="Rat Hole (ft)" val={g3Rat} set={setG3Rat} /></div>
                <div className="w-full"><Input label="Excess (%)" val={g3Excess} set={setG3Excess} /></div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4"><Input label="TD (ft)" val={g4TotalDepth} set={setG4TotalDepth} /><Input label="Liner Top (ft)" val={g4LinerTop} set={setG4LinerTop} /></div>
                <div className="grid grid-cols-2 gap-4"><Input label="Prev. Shoe (ft)" val={g4PrevShoe} set={setG4PrevShoe} /><Input label="Tail Interval (ft)" val={g4TailH} set={setG4TailH} /></div>
                <div className="grid grid-cols-2 gap-4"><Input label="Hole Size (in)" val={g4Hole} set={setG4Hole} /><Input label="Excess (%)" val={g4Excess} set={setG4Excess} /></div>
                <div className="grid grid-cols-2 gap-4"><Input label="Shoe Track (ft)" val={g4Shoe} set={setG4Shoe} /><Input label="Rat Hole (ft)" val={g4Rat} set={setG4Rat} /></div>
                <div className="space-y-2 bg-slate-800/30 p-3 rounded-2xl border border-amber-500/20">
                  <CasingSelector label="الكيسينق السابق (Prev Csg)" currentOD={g4PrevOD} currentID={g4PrevID} onSelect={(od, id) => { setG4PrevOD(od); setG4PrevID(id); }} variant="previous" />
                  <div className="grid grid-cols-2 gap-4"><Input label="Prev Csg OD (in)" val={g4PrevOD} set={setG4PrevOD} /><Input label="Prev Csg ID (in)" val={g4PrevID} set={setG4PrevID} /></div>
                </div>
                <div className="space-y-2 bg-slate-800/30 p-3 rounded-2xl border border-pink-500/20">
                  <CasingSelector label="اللاينر الحالي (Liner Csg)" currentOD={g4CsgOD} currentID={g4CsgID} onSelect={(od, id) => { setG4CsgOD(od); setG4CsgID(id); }} variant="liner" />
                  <div className="grid grid-cols-2 gap-4"><Input label="Liner OD (in)" val={g4CsgOD} set={setG4CsgOD} /><Input label="Liner ID (in)" val={g4CsgID} set={setG4CsgID} /></div>
                </div>
                <div className="bg-emerald-500/5 p-4 rounded-3xl border border-emerald-500/10 flex flex-col gap-3">
                  <CasingSelector label="أنبوب الحفر (Drill Pipe)" currentOD="5" currentID={g4DP_ID} onSelect={(_od, id) => setG4DP_ID(id)} variant="current" compact />
                  <Input label='DP 5" ID (in)' val={g4DP_ID} set={setG4DP_ID} />
                  <span className="text-[10px] text-slate-500 font-bold italic text-center">الإزاحة تتم عبر Drill Pipe من السطح</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {activeTab === 'SEC1' ? (
          <>
            <StepLaw num="1" title="V1 Annular OH" law="V = \frac{(Hole^2 - OD^2)}{1029.4} \times L \times Exc" substituted={curRes1.v1Sub} result={curRes1.v1} color="cyan" diagramType="ANNULAR" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'casingOD', 'casingDepth']} onShowExplanation={() => setExplanationModal({ title: "V1 Annular OH", content: `حساب حجم الفراغ الحلقي في الحفرة المفتوحة (Open Hole) من السطح حتى عمق الكيسينق. يتم ضرب مساحة المقطع العرضي في الطول ومعامل الزيادة.`, range: `0 ft → ${g1Depth} ft`, formula: `V = \\frac{(Hole^2 - OD^2)}{1029.4} \\times Length \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <StepLaw num="2" title="V2 Rat Hole" law="V = \frac{Hole^2}{1029.4} \times L \times Exc" substituted={curRes1.v2Sub} result={curRes1.v2} color="cyan" diagramType="RAT_HOLE" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'ratHole']} onShowExplanation={() => setExplanationModal({ title: "V2 Rat Hole", content: `حساب حجم الحفرة المفتوحة أسفل الكيسينق (Rat Hole).`, range: `${g1Depth} ft → ${(parseFloat(g1Depth) + parseFloat(g1Rat)).toFixed(0)} ft`, formula: `V = \\frac{Hole^2}{1029.4} \\times Length \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <StepLaw num="3" title="V3 Shoe Track" law="V = \frac{ID^2}{1029.4} \times L" substituted={curRes1.v3Sub} result={curRes1.v3} color="cyan" diagramType="SHOE_TRACK" sectionType={activeTab} diagramData={diagramData} activeInputs={['casingID', 'shoeTrack']} onShowExplanation={() => setExplanationModal({ title: "V3 Shoe Track", content: `حساب حجم السيمنت المتبقي داخل الكيسينق (Shoe Track) بين الفلوت كولار وحذاء الكيسينق.`, range: `${(parseFloat(g1Depth) - parseFloat(g1Shoe)).toFixed(0)} ft → ${g1Depth} ft`, formula: `V = \\frac{ID^2}{1029.4} \\times Length` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للكيسنج بدلاً من الداخلي (ID) في الحساب التقريبي" />
            <StepLaw num="4" title="Displacement" law="Disp = \frac{ID^2}{1029.4} \times (Depth - Shoe)" substituted={curRes1.dispSub} result={curRes1.disp} color="cyan" diagramType="DISPLACEMENT" sectionType={activeTab} diagramData={diagramData} activeInputs={['casingID', 'casingDepth', 'shoeTrack']} onShowExplanation={() => setExplanationModal({ title: "Displacement", content: `حساب حجم سائل الإزاحة المطلوب لضخ السيمنت من السطح حتى الوصول إلى الفلوت كولار.`, range: `0 ft → ${(parseFloat(g1Depth) - parseFloat(g1Shoe)).toFixed(0)} ft`, formula: `Disp = \\frac{ID^2}{1029.4} \\times (Total\\ Depth - Shoe\\ Track)` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للكيسنج بدلاً من الداخلي (ID) في الحساب التقريبي" />
            <StepLaw num="5" title="Differential Pressure" law="\Delta P = HP_{Ann} - HP_{Csg}" substituted={curRes1.diffPressSub} result={curRes1.diffPress} unit="psi" color="purple" diagramType="DIFF_PRESSURE" sectionType={activeTab} diagramData={diagramData} activeInputs={['mudDens', 'tailDens']} mudDens={mudDens} tailDens={tailDens} dpBreakdown={{ ann: curRes1.hpAnn, csg: curRes1.hpCsg, annSub: curRes1.hpAnnSub, csgSub: curRes1.hpCsgSub }} onShowExplanation={() => setExplanationModal({ title: "Differential Pressure", content: `حساب الضغط التفاضلي عند قاع البئر في نهاية العملية. هو الفرق بين الضغط الهيدروستاتيكي لعمود السيمنت في الفراغ الحلقي وبين ضغط سائل الإزاحة والسيمنت داخل الكيسينق.`, range: `${g1Depth} ft`, formula: `\\Delta P = HP_{Annulus} - HP_{Casing}` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للكيسنج بدلاً من الداخلي (ID) لحساب ضغط سائل الإزاحة وتسميت داخل الكيسنج في الحساب التقريبي" />
          </>
        ) : activeTab === 'SEC2' ? (
          <>
            <StepLaw num="1" title="V1 Lead (Cased)" law="V = \frac{(PrevID^2 - OD^2)}{1029.4} \times L" substituted={curRes2.v1Sub} result={curRes2.v1} color="cyan" diagramType="ANNULAR_CASED" sectionType={activeTab} diagramData={diagramData} activeInputs={['prevID', 'casingOD', 'prevCasingDepth']} onShowExplanation={() => setExplanationModal({ title: "V1 Lead (Cased)", content: `حساب حجم السيمنت في منطقة التداخل (Overlap) بين الكيسينق السابق والحالي.`, range: `0 ft → ${g2PrevShoe} ft`, formula: `V = \\frac{(PrevID^2 - OD^2)}{1029.4} \\times Overlap\\ Length` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (Prev OD) بدلاً من الداخلي (Prev ID) للكيسنج السابق في الحساب التقريبي" />
            <StepLaw num="2" title="V2 Lead (OH)" law="V = \frac{(Hole^2 - OD^2)}{1029.4} \times L \times Exc" substituted={curRes2.v2Sub} result={curRes2.v2} color="cyan" diagramType="ANNULAR_LEAD_OH" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'casingOD', 'casingDepth', 'tailInterval', 'prevCasingDepth']} onShowExplanation={() => setExplanationModal({ title: "V2 Lead (OH)", content: `حساب حجم السيمنت (Lead) في الحفرة المفتوحة، من حذاء الكيسينق السابق حتى بداية منطقة الذيل.`, range: `${g2PrevShoe} ft → ${(parseFloat(g2TotalDepth) - parseFloat(g2TailH)).toFixed(0)} ft`, formula: `V = \\frac{(Hole^2 - OD^2)}{1029.4} \\times Length \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <StepLaw num="3" title="V3 Tail (OH)" law="V = \frac{(Hole^2 - OD^2)}{1029.4} \times L \times Exc" substituted={curRes2.v3Sub} result={curRes2.v3} color="cyan" diagramType="ANNULAR_TAIL_OH" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'casingOD', 'tailInterval']} onShowExplanation={() => setExplanationModal({ title: "V3 Tail (OH)", content: `حساب حجم السيمنت (Tail) عالي الكثافة في الحفرة المفتوحة.`, range: `${(parseFloat(g2TotalDepth) - parseFloat(g2TailH)).toFixed(0)} ft → ${g2TotalDepth} ft`, formula: `V = \\frac{(Hole^2 - OD^2)}{1029.4} \\times Tail\\ Height \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <StepLaw num="4" title="V4 Rat Hole" law="V = \frac{Hole^2}{1029.4} \times L \times Exc" substituted={curRes2.v4Sub} result={curRes2.v4} color="cyan" diagramType="RAT_HOLE" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'ratHole']} onShowExplanation={() => setExplanationModal({ title: "V4 Rat Hole", content: `حساب حجم الحفرة المفتوحة أسفل الكيسينق.`, range: `${g2TotalDepth} ft → ${(parseFloat(g2TotalDepth) + parseFloat(g2Rat)).toFixed(0)} ft`, formula: `V = \\frac{Hole^2}{1029.4} \\times Rat\\ Hole\\ Length \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <StepLaw num="5" title="V5 Shoe Track" law="V = \frac{ID^2}{1029.4} \times L" substituted={curRes2.v5Sub} result={curRes2.v5} color="cyan" diagramType="SHOE_TRACK" sectionType={activeTab} diagramData={diagramData} activeInputs={['casingID', 'shoeTrack']} onShowExplanation={() => setExplanationModal({ title: "V5 Shoe Track", content: `حساب حجم السيمنت المتبقي داخل الكيسينق.`, range: `${(parseFloat(g2TotalDepth) - parseFloat(g2Shoe)).toFixed(0)} ft → ${g2TotalDepth} ft`, formula: `V = \\frac{ID^2}{1029.4} \\times Shoe\\ Track\\ Length` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للكيسنج بدلاً من الداخلي (ID) في الحساب التقريبي" />
            <StepLaw num="6" title="Displacement" law="Disp = \frac{ID^2}{1029.4} \times (Depth - Shoe)" substituted={curRes2.dispSub} result={curRes2.disp} color="cyan" diagramType="DISPLACEMENT" sectionType={activeTab} diagramData={diagramData} activeInputs={['casingID', 'casingDepth', 'shoeTrack']} onShowExplanation={() => setExplanationModal({ title: "Displacement", content: `حساب حجم سائل الإزاحة من السطح حتى الفلوت كولار.`, range: `0 ft → ${(parseFloat(g2TotalDepth) - parseFloat(g2Shoe)).toFixed(0)} ft`, formula: `Disp = \\frac{ID^2}{1029.4} \\times (Total\\ Depth - Shoe\\ Track)` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للكيسنج بدلاً من الداخلي (ID) في الحساب التقريبي" />
            <StepLaw num="7" title="Differential Pressure" law="\Delta P = HP_{Ann} - HP_{Csg}" substituted={curRes2.diffPressSub} result={curRes2.diffPress} unit="psi" color="purple" diagramType="DIFF_PRESSURE" sectionType={activeTab} diagramData={diagramData} activeInputs={['mudDens', 'leadDens', 'tailDens']} mudDens={mudDens} leadDens={leadDens} tailDens={tailDens} dpBreakdown={{ ann: curRes2.hpAnn, csg: curRes2.hpCsg, annSub: curRes2.hpAnnSub, csgSub: curRes2.hpCsgSub }} onShowExplanation={() => setExplanationModal({ title: "Differential Pressure", content: `حساب الضغط التفاضلي في نهاية العملية.`, range: `${g2TotalDepth} ft`, formula: `\\Delta P = HP_{Annulus} - HP_{Casing}` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للكيسنج بدلاً من الداخلي (ID) لحساب ضغط سائل الإزاحة والسيمنت داخل الكيسنج في الحساب التقريبي" />
          </>
        ) : activeTab === 'SEC3' ? (
          <>
            <StepLaw num="1" title="V1 Stage 2 (Cased)" law="V = \frac{(PrevID^2 - OD^2)}{1029.4} \times L" substituted={curRes3.vCSub} result={curRes3.vC} color="cyan" diagramType="ANNULAR_STAGE2_CASED" sectionType={activeTab} diagramData={diagramData} activeInputs={['prevID', 'casingOD', 'prevCasingDepth']} onShowExplanation={() => setExplanationModal({ title: "V1 Stage 2 (Cased)", content: `حساب حجم السيمنت للمرحلة الثانية في منطقة التداخل.`, range: `0 ft → ${g3PrevShoe} ft`, formula: `V = \\frac{(PrevID^2 - OD^2)}{1029.4} \\times Overlap\\ Length` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (Prev OD) بدلاً من الداخلي (Prev ID) للكيسنج السابق في الحساب التقريبي" />
            <StepLaw num="2" title="V2 Stage 2 (OH)" law="V = \frac{(Hole^2 - OD^2)}{1029.4} \times L \times Exc" substituted={curRes3.vS2OHSub} result={curRes3.vS2OH} color="cyan" diagramType="ANNULAR_STAGE2_OH" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'casingOD', 'dvToolDepth', 'prevCasingDepth']} onShowExplanation={() => setExplanationModal({ title: "V2 Stage 2 (OH)", content: `حساب حجم السيمنت للمرحلة الثانية في الحفرة المفتوحة حتى الـ DV Tool.`, range: `${g3PrevShoe} ft → ${g3DvDepth} ft`, formula: `V = \\frac{(Hole^2 - OD^2)}{1029.4} \\times Length \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <StepLaw num="3" title="V3 Phase 1 Lead" law="V = \frac{(Hole^2 - OD^2)}{1029.4} \times L \times Exc" substituted={curRes3.vLSub} result={curRes3.vL} color="cyan" diagramType="ANNULAR_STAGE1_LEAD" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'casingOD', 'casingDepth', 'tailInterval', 'dvToolDepth']} onShowExplanation={() => setExplanationModal({ title: "V3 Phase 1 Lead", content: `حساب حجم السيمنت (Lead) للمرحلة الأولى، من عمق الـ DV Tool حتى بداية منطقة الذيل.`, range: `${g3DvDepth} ft → ${(parseFloat(g3TotalDepth) - parseFloat(g3TailH)).toFixed(0)} ft`, formula: `V = \\frac{(Hole^2 - OD^2)}{1029.4} \\times Length \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <StepLaw num="4" title="V4 Tail Phase 1" law="V = \frac{(Hole^2 - OD^2)}{1029.4} \times L \times Exc" substituted={curRes3.vTSub} result={curRes3.vT} color="cyan" diagramType="ANNULAR_STAGE1_TAIL" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'tailInterval']} onShowExplanation={() => setExplanationModal({ title: "V4 Tail Phase 1", content: `حساب حجم السيمنت (Tail) للمرحلة الأولى.`, range: `${(parseFloat(g3TotalDepth) - parseFloat(g3TailH)).toFixed(0)} ft → ${g3TotalDepth} ft`, formula: `V = \\frac{(Hole^2 - OD^2)}{1029.4} \\times Tail\\ Height \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <StepLaw num="5" title="V5 Rat Hole" law="V = \frac{Hole^2}{1029.4} \times L \times Exc" substituted={curRes3.vRSub} result={curRes3.vR} color="cyan" diagramType="RAT_HOLE" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'ratHole']} onShowExplanation={() => setExplanationModal({ title: "V5 Rat Hole", content: `حساب حجم الحفرة المفتوحة أسفل الكيسينق.`, range: `${g3TotalDepth} ft → ${(parseFloat(g3TotalDepth) + parseFloat(g3Rat)).toFixed(0)} ft`, formula: `V = \\frac{Hole^2}{1029.4} \\times Rat\\ Hole\\ Length \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <StepLaw num="6" title="V6 Shoe Track" law="V = \frac{ID^2}{1029.4} \times L" substituted={curRes3.vSSub} result={curRes3.vS} color="cyan" diagramType="SHOE_TRACK" sectionType={activeTab} diagramData={diagramData} activeInputs={['casingID', 'shoeTrack']} onShowExplanation={() => setExplanationModal({ title: "V6 Shoe Track", content: `حساب حجم السيمنت المتبقي داخل الكيسينق.`, range: `${(parseFloat(g3TotalDepth) - parseFloat(g3Shoe)).toFixed(0)} ft → ${g3TotalDepth} ft`, formula: `V = \\frac{ID^2}{1029.4} \\times Shoe\\ Track\\ Length` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للكيسنج بدلاً من الداخلي (ID) في الحساب التقريبي" />
            <StepLaw num="7" title="Disp Stage 1 (To Shoe)" law="Disp_1 = \frac{ID^2}{1029.4} \times (TD - Shoe)" substituted={curRes3.d1Sub} result={curRes3.d1} color="cyan" diagramType="DISPLACEMENT_STAGE1" sectionType={activeTab} diagramData={diagramData} activeInputs={['casingID', 'casingDepth', 'shoeTrack']} onShowExplanation={() => setExplanationModal({ title: "Disp Stage 1", content: `حساب حجم إزاحة المرحلة الأولى من السطح حتى الفلوت كولار.`, range: `0 ft → ${(parseFloat(g3TotalDepth) - parseFloat(g3Shoe)).toFixed(0)} ft`, formula: `Disp_1 = \\frac{ID^2}{1029.4} \\times (Total\\ Depth - Shoe\\ Track)` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للكيسنج بدلاً من الداخلي (ID) في الحساب التقريبي" />
            <StepLaw num="8" title="Disp Stage 2 (To DV)" law="Disp_2 = \frac{ID^2}{1029.4} \times DV_{Depth}" substituted={curRes3.d2Sub} result={curRes3.d2} color="cyan" diagramType="DISPLACEMENT_STAGE2" sectionType={activeTab} diagramData={diagramData} activeInputs={['casingID', 'dvToolDepth']} onShowExplanation={() => setExplanationModal({ title: "Disp Stage 2", content: `حساب حجم إزاحة المرحلة الثانية من السطح حتى الـ DV Tool.`, range: `0 ft → ${g3DvDepth} ft`, formula: `Disp_2 = \\frac{ID^2}{1029.4} \\times DV_{Depth}` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للكيسنج بدلاً من الداخلي (ID) في الحساب التقريبي" />
            <StepLaw num="9" title="Differential Pressure (Stage 1)" law="\Delta P_1 = HP_{Ann} - HP_{Csg}" substituted={curRes3.diffPressSub} result={curRes3.diffPress} unit="psi" color="purple" diagramType="DIFF_PRESSURE" sectionType={activeTab} diagramData={diagramData} activeInputs={['mudDens', 'leadDens', 'tailDens']} mudDens={mudDens} leadDens={leadDens} tailDens={tailDens} dpBreakdown={{ ann: curRes3.hpAnn, csg: curRes3.hpCsg, annSub: curRes3.hpAnnSub, csgSub: curRes3.hpCsgSub }} onShowExplanation={() => setExplanationModal({ title: "Differential Pressure S1", content: `حساب الضغط التفاضلي في نهاية المرحلة الأولى عند قاع البئر.`, range: `${g3TotalDepth} ft`, formula: `\\Delta P_1 = HP_{Annulus} - HP_{Casing}` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للكيسنج بدلاً من الداخلي (ID) في الحساب التقريبي" />
            <StepLaw num="10" title="Differential Pressure (Stage 2)" law="\Delta P_2 = HP_{Ann} - HP_{Csg}" substituted={curRes3.diffPressS2Sub} result={curRes3.diffPressS2} unit="psi" color="purple" diagramType="DIFF_PRESSURE" sectionType={activeTab} diagramData={diagramData} activeInputs={['mudDens', 'leadDens']} mudDens={mudDens} leadDens={leadDens} dpPoint="DV" dpBreakdown={{ ann: curRes3.hpAnnS2, csg: curRes3.hpCsgS2, annSub: curRes3.hpAnnS2Sub, csgSub: curRes3.hpCsgS2Sub }} onShowExplanation={() => setExplanationModal({ title: "Differential Pressure S2", content: `حساب الضغط التفاضلي في نهاية المرحلة الثانية عند عمق الـ DV Tool.`, range: `${g3DvDepth} ft`, formula: `\\Delta P_2 = HP_{Annulus} - HP_{Casing}` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للكيسنج بدلاً من الداخلي (ID) في الحساب التقريبي" />
          </>
        ) : (
          <>
            <StepLaw num="1" title="V1 Overlap (Liner Hanger)" law="V = \frac{(PrevID^2 - OD^2)}{1029.4} \times L" substituted={curRes4.vOverlapSub} result={curRes4.vOverlap} color="cyan" diagramType="ANNULAR_CASED" sectionType={activeTab} diagramData={diagramData} activeInputs={['prevCasingID', 'casingOD', 'linerTopDepth', 'prevCasingDepth']} onShowExplanation={() => setExplanationModal({ title: "V1 Overlap (Cased)", content: `حساب حجم السيمنت في منطقة التداخل تحت مكان التعليق (Hanger) وحتى حذاء الكيسينق السابق.`, range: `${g4LinerTop} ft → ${g4PrevShoe} ft`, formula: `V = \\frac{(PrevID^2 - OD^2)}{1029.4} \\times Overlap\\ Length` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (Prev OD) بدلاً من الداخلي (Prev ID) للكيسنج السابق في الحساب التقريبي" />
            <StepLaw num="2" title="V2 Lead (OH)" law="V = \frac{(Hole^2 - OD^2)}{1029.4} \times L \times Exc" substituted={curRes4.vLeadOHSub} result={curRes4.vLeadOH} color="cyan" diagramType="ANNULAR_LEAD_OH" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'casingOD', 'excess']} onShowExplanation={() => setExplanationModal({ title: "V2 Lead (OH)", content: `حساب حجم السيمنت (Lead) في الحفرة المفتوحة أسفل الكيسينق السابق.`, range: `${g4PrevShoe} ft → ${(parseFloat(g4TotalDepth) - parseFloat(g4TailH)).toFixed(0)} ft`, formula: `V = \\frac{(Hole^2 - OD^2)}{1029.4} \\times Length \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <StepLaw num="3" title="V3 Tail (OH)" law="V = \frac{(Hole^2 - OD^2)}{1029.4} \times L \times Exc" substituted={curRes4.vTailOHSub} result={curRes4.vTailOH} color="cyan" diagramType="ANNULAR_TAIL_OH" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'casingOD', 'tailInterval', 'excess']} onShowExplanation={() => setExplanationModal({ title: "V3 Tail (OH)", content: `حساب حجم السيمنت (Tail) في الحفرة المفتوحة عند قاع البئر.`, range: `${(parseFloat(g4TotalDepth) - parseFloat(g4TailH)).toFixed(0)} ft → ${g4TotalDepth} ft`, formula: `V = \\frac{(Hole^2 - OD^2)}{1029.4} \\times Tail\\ Interval \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <StepLaw num="4" title="V4 Rat Hole" law="V = \frac{Hole^2}{1029.4} \times L \times Exc" substituted={curRes4.vRatSub} result={curRes4.vRat} color="cyan" diagramType="RAT_HOLE" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'ratHole', 'excess']} onShowExplanation={() => setExplanationModal({ title: "V4 Rat Hole", content: `حساب حجم الحفرة المفتوحة أسفل اللاينر.`, range: `${g4TotalDepth} ft → ${(parseFloat(g4TotalDepth) + parseFloat(g4Rat)).toFixed(0)} ft`, formula: `V = \\frac{Hole^2}{1029.4} \\times Rat\\ Length \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <StepLaw num="5" title="V5 Shoe Track" law="V = \frac{ID^2}{1029.4} \times L" substituted={curRes4.vShoeSub} result={curRes4.vShoe} color="cyan" diagramType="SHOE_TRACK" sectionType={activeTab} diagramData={diagramData} activeInputs={['casingID', 'shoeTrack']} onShowExplanation={() => setExplanationModal({ title: "V5 Shoe Track", content: `حساب حجم السيمنت داخل اللاينر (Shoe Track).`, range: `${(parseFloat(g4TotalDepth) - parseFloat(g4Shoe)).toFixed(0)} ft → ${g4TotalDepth} ft`, formula: `V = \\frac{ID^2}{1029.4} \\times Shoe\\ Length` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للاينر بدلاً من الداخلي (ID) في الحساب التقريبي" />
            <StepLaw num="6" title="Displacement" law="Disp = \left(\frac{DP_{ID}^2}{1029.4} \times L_{DP}\right) + \left(\frac{ID^2}{1029.4} \times L_{Liner}\right)" substituted={curRes4.dispSub} result={curRes4.disp} color="cyan" diagramType="DISPLACEMENT" sectionType={activeTab} diagramData={diagramData} activeInputs={['casingID', 'shoeTrack']} onShowExplanation={() => setExplanationModal({ title: "Displacement", content: `حساب حجم الإزاحة الكلي. يتكون من حجم الـ Drill Pipe من السطح حتى قمة اللاينر، مضافاً إليه الحجم الداخلي للاينر من القمة حتى الفلوت كولار.`, range: `0 ft → ${(parseFloat(g4TotalDepth) - parseFloat(g4Shoe)).toFixed(0)} ft`, formula: `Disp = \\left(\\frac{DP_{ID}^2}{1029.4} \\times LinerTop\\right) + \\left(\\frac{Liner_{ID}^2}{1029.4} \\times (LinerLength - ShoeTrack)\\right)` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للاينر بدلاً من الداخلي (ID)، واستخدام القطر الخارجي 5.0&quot; للـ DP بدلاً من الداخلي في الحساب التقريبي" />
            <StepLaw num="7" title="Differential Pressure" law="\Delta P = HP_{Ann} - HP_{Csg}" substituted={curRes4.diffPressSub} result={curRes4.diffPress} unit="psi" color="purple" diagramType="DIFF_PRESSURE" sectionType={activeTab} diagramData={diagramData} activeInputs={['mudDens', 'leadDens', 'tailDens']} mudDens={mudDens} leadDens={leadDens} tailDens={tailDens} dpBreakdown={{ ann: curRes4.hpAnn, csg: curRes4.hpCsg, annSub: curRes4.hpAnnSub, csgSub: curRes4.hpCsgSub }} onShowExplanation={() => setExplanationModal({ title: "Differential Pressure", content: `حساب الضغط التفاضلي عند قاع البئر في نهاية عملية تسميت البطانة.`, range: `${g4TotalDepth} ft`, formula: `\\Delta P = HP_{Annulus} - HP_{Casing}` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للاينر بدلاً من الداخلي (ID) في الحساب التقريبي" />
          </>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 pt-6">
        <button onClick={() => window.location.reload()} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 font-black active:scale-95 transition-all shadow-xl backdrop-blur-md"><RefreshCw className="w-5 h-5" /> تصفير</button>
        <button onClick={handleSave} className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all"><Save className="w-5 h-5" /> حفظ التقرير</button>
      </div>

      {/* Explanation Drawer */}
      <AnimatePresence>
        {explanationModal && (
          <>
            <motion.div 
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 right-0 z-[101] bg-slate-900/95 border-b border-slate-800 rounded-b-[2.5rem] shadow-2xl overflow-hidden h-[30vh] flex flex-col backdrop-blur-md"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
                <button onClick={() => setExplanationModal(null)} className="p-1.5 hover:bg-slate-700 rounded-xl transition-colors bg-slate-800 border border-slate-700"><X className="w-5 h-5 text-slate-400" /></button>
                <div className="text-right">
                  <h3 className="text-sm font-black text-white italic uppercase tracking-wider">{explanationModal.title}</h3>
                  <span className="text-[8px] text-blue-400 font-bold uppercase tracking-widest italic">Technical Breakdown</span>
                </div>
              </div>

              <div className="p-4 overflow-y-auto space-y-4 text-right flex-1 no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Range Card */}
                  {explanationModal.range && (
                    <div className="bg-blue-500/5 border border-blue-500/20 p-3 rounded-2xl relative overflow-hidden flex flex-col justify-center">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                      <div className="flex items-center justify-between mb-1">
                         <Target className="w-3 h-3 text-blue-400" />
                         <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest italic">نطاق العمق</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                         <span className="text-sm font-black text-white tracking-tighter">{explanationModal.range.split('→')[0]}</span>
                         <ArrowRight className="w-3 h-3 text-slate-600" />
                         <span className="text-sm font-black text-white tracking-tighter">{explanationModal.range.split('→')[1]}</span>
                      </div>
                    </div>
                  )}

                  {/* Logic Section */}
                  <div className="space-y-1 md:col-span-2">
                     <div className="flex items-center justify-end gap-2 text-slate-500">
                        <span className="text-[8px] font-black uppercase tracking-widest italic">المنطق الحسابي</span>
                        <Info className="w-3 h-3" />
                     </div>
                     <p className="text-slate-300 leading-tight text-xs font-medium bg-slate-800/30 p-3 rounded-2xl border border-slate-800/50">{explanationModal.content}</p>
                  </div>
                </div>

                {/* Formula Section */}
                {explanationModal.formula && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-end gap-2 text-slate-500">
                      <span className="text-[8px] font-black uppercase tracking-widest italic">القانون المستخدم</span>
                      <Settings2 className="w-3 h-3" />
                    </div>
                    <div className="bg-black/40 p-3 rounded-2xl border border-slate-800 flex items-center justify-center">
                      <MathFormula math={explanationModal.formula} className="text-blue-400 text-sm sm:text-base" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const StepLaw: React.FC<{ 
  num: string, 
  title: string, 
  law: string, 
  substituted: string, 
  result: number, 
  unit?: string,
  color: string,
  diagramType?: 'ANNULAR' | 'SHOE_TRACK' | 'RAT_HOLE' | 'DISPLACEMENT' | 'ANNULAR_STAGE1' | 'ANNULAR_STAGE2' | 'DISPLACEMENT_STAGE1' | 'DISPLACEMENT_STAGE2' | 'ANNULAR_CASED' | 'ANNULAR_LEAD_OH' | 'ANNULAR_TAIL_OH' | 'ANNULAR_STAGE2_CASED' | 'ANNULAR_STAGE2_OH' | 'ANNULAR_STAGE1_LEAD' | 'ANNULAR_STAGE1_TAIL' | 'DIFF_PRESSURE' | 'HP_ANN' | 'HP_CSG',
  sectionType?: 'SEC1' | 'SEC2' | 'SEC3' | 'SEC4',
  diagramData?: any,
  activeInputs?: string[],
  mudDens?: string,
  leadDens?: string,
  tailDens?: string,
  dpPoint?: 'SHOE' | 'DV',
  dpBreakdown?: { ann: number, csg: number, annSub: string, csgSub: string },
  onShowExplanation?: () => void,
  isApproximate?: boolean,
  diffNote?: string
}> = ({ num, title, law, substituted, result, unit = 'bbl', color, diagramType, sectionType, diagramData, activeInputs, mudDens, leadDens, tailDens, dpPoint = 'SHOE', dpBreakdown, onShowExplanation, isApproximate, diffNote }) => {
  const [dpMode, setDpMode] = useState<'FINAL' | 'OUT' | 'IN'>('FINAL');

  const colorMap: any = { 
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20', 
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', 
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20', 
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', 
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20', 
    slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20', 
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
  };
  const activeColorClass = colorMap[color] || colorMap.blue;

  const currentResult = dpMode === 'OUT' ? (dpBreakdown?.ann || 0) : dpMode === 'IN' ? (dpBreakdown?.csg || 0) : result;
  const currentSub = dpMode === 'OUT' ? (dpBreakdown?.annSub || substituted) : dpMode === 'IN' ? (dpBreakdown?.csgSub || substituted) : substituted;
  const currentLaw = dpMode === 'OUT' ? 'HP_{Ann} = MW_{Ann} \\times TVD \\times 0.052' : dpMode === 'IN' ? 'HP_{Csg} = (MW_{Mud} \\times L_{Mud} \\times 0.052) + (MW_{Tail} \\times L_{Shoe} \\times 0.052)' : law;
  const currentHighlight: any = dpMode === 'OUT' ? 'HP_ANN' : dpMode === 'IN' ? 'HP_CSG' : diagramType;

  return (
    <div className="bg-slate-900/40 p-3 rounded-[2rem] border border-slate-800 space-y-2 text-right group animate-in slide-in-from-bottom-2">
      {isApproximate && (
        <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-amber-400 text-center flex items-center justify-center gap-1.5 animate-in fade-in">
          <Info className="w-3.5 h-3.5 shrink-0 animate-pulse text-amber-400" />
          <span>{diffNote || 'لا يوجد اختلاف'}</span>
        </div>
      )}
      <div className="flex items-center justify-between px-1">
         <div className="flex items-center gap-2">
           <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${activeColorClass}`}>{num}</span>
           <h3 className="text-xs font-black text-white italic uppercase break-words">{title}</h3>
           {onShowExplanation && (
             <button onClick={onShowExplanation} className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-blue-400">
               <Eye className="w-3.5 h-3.5" />
             </button>
           )}
         </div>
         <CheckCircle2 className={`w-3.5 h-3.5 ${result > 0 ? 'text-emerald-500' : 'text-slate-800'}`} />
      </div>

      {diagramType === 'DIFF_PRESSURE' && (
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700 mx-auto w-fit gap-1 mb-2">
          <button 
            onClick={() => setDpMode('OUT')} 
            className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${dpMode === 'OUT' ? 'bg-purple-600 text-white' : 'text-slate-500'}`}
          >
            Out (Ann)
          </button>
          <button 
            onClick={() => setDpMode('IN')} 
            className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${dpMode === 'IN' ? 'bg-purple-600 text-white' : 'text-slate-500'}`}
          >
            In (Csg)
          </button>
          <button 
            onClick={() => setDpMode('FINAL')} 
            className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${dpMode === 'FINAL' ? 'bg-purple-600 text-white' : 'text-slate-500'}`}
          >
            Final DP
          </button>
        </div>
      )}
      
      <div className="flex flex-col gap-2 items-center">
        <div className="w-full bg-[#0a0f1e]/90 p-4 rounded-2xl border border-slate-800/80 space-y-3 shadow-inner">
          <div>
            <span className="block text-[10px] text-slate-300 font-bold mb-1 tracking-wide text-left" dir="ltr">
              Formula <span className="text-slate-500 text-[9px]">({dpMode === 'FINAL' ? 'القانون' : dpMode === 'OUT' ? 'ضغط الفراغ الحلقي' : 'ضغط الكيسينق'})</span>
            </span>
            <MathFormula math={currentLaw} className="text-white text-sm sm:text-base py-1" />
          </div>
          {currentResult !== 0 && (
            <div className="pt-3 border-t border-slate-800/80">
              <span className="block text-[10px] text-slate-300 font-bold mb-1 tracking-wide text-left" dir="ltr">
                Substitution <span className="text-slate-500 text-[9px]">(التعويض)</span>
              </span>
              <MathFormula math={currentSub} className="text-white text-sm sm:text-base py-1" />
            </div>
          )}
        </div>

        {diagramType && sectionType && diagramData && (
          <div className="w-full">
            <SectionDiagram 
              {...diagramData}
              type={sectionType}
              highlight={currentHighlight}
              dpPoint={dpPoint}
              activeInputs={activeInputs}
              isMini={true}
            />
          </div>
        )}
      </div>

      <div className={`flex justify-between items-center px-4 py-2 rounded-2xl border ${activeColorClass}`}><span className="text-[8px] font-black uppercase tracking-widest italic">النتيجة {dpMode === 'FINAL' ? '' : dpMode === 'OUT' ? '(Out)' : '(In)'}</span><span className="text-lg font-black">{currentResult.toFixed(currentResult > 100 || dpMode === 'FINAL' ? 0 : 2)} <span className="text-[9px]">{unit}</span></span></div>
    </div>
  );
};

export default TotalCementCalc;
