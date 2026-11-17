
import React, { useState, useEffect, useRef } from 'react';
import { CalcType, CalculationRecord } from '../types';
import { 
  RefreshCw, 
  Save, 
  ChevronDown, 
  ChevronUp, 
  Trash2,
  CheckCircle2,
  Eye,
  X,
  Info,
  ArrowRight,
  Target,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SectionDiagram from '../components/SectionDiagram';
import MathFormula from '../components/MathFormula';
import CasingSelector from '../components/CasingSelector';

const Input: React.FC<{ label: string, val: string, set: (v: string) => void }> = ({ label, val, set }) => (
  <div className="space-y-1 text-right"><label className="text-[9px] font-bold text-slate-500 uppercase px-1 italic">{label}</label><input className="input-field !p-3 !text-sm !bg-slate-800/40 border-slate-700/50 font-bold" type="number" value={val} onChange={e => set(e.target.value)} /></div>
);

interface Segment {
  id: string;
  id_val: string;
  from: string;
  to: string;
  od: string;
}

const CompleteSectionCalc: React.FC<{ onResult: (record: CalculationRecord) => void, initialData?: CalculationRecord | null }> = ({ onResult, initialData }) => {
  const [activeTab, setActiveTab] = useState<'SEC1' | 'SEC2' | 'SEC3' | 'SEC4'>('SEC1');
  const [expanded, setExpanded] = useState<string | null>('global');

  useEffect(() => {
    if (initialData && initialData.type === CalcType.COMPLETE_SECTION) {
      const { inputs } = initialData;
      if (inputs.Tab) setActiveTab(inputs.Tab as any);
      if (inputs.isApproximate) setIsApproximate(inputs.isApproximate === 'true');
      
      // Section 1
      if (inputs.s1Hole) setS1Hole(String(inputs.s1Hole));
      if (inputs.s1Excess) setS1Excess(String(inputs.s1Excess));
      if (inputs.s1ShoeLen) setS1ShoeLen(String(inputs.s1ShoeLen));
      if (inputs.s1RatLen) setS1RatLen(String(inputs.s1RatLen));
      if (inputs.s1Segments) setS1Segments(JSON.parse(String(inputs.s1Segments)));

      // Section 2
      if (inputs.s2TotalDepth) setS2TotalDepth(String(inputs.s2TotalDepth));
      if (inputs.s2TailInterval) setS2TailInterval(String(inputs.s2TailInterval));
      if (inputs.s2Hole) setS2Hole(String(inputs.s2Hole));
      if (inputs.s2Excess) setS2Excess(String(inputs.s2Excess));
      if (inputs.s2ShoeLen) setS2ShoeLen(String(inputs.s2ShoeLen));
      if (inputs.s2RatLen) setS2RatLen(String(inputs.s2RatLen));
      if (inputs.s2PrevSegments) setS2PrevSegments(JSON.parse(String(inputs.s2PrevSegments)));
      if (inputs.s2Segments) setS2Segments(JSON.parse(String(inputs.s2Segments)));

      // Section 3
      if (inputs.s3TotalDepth) setS3TotalDepth(String(inputs.s3TotalDepth));
      if (inputs.s3DvTool) setS3DvTool(String(inputs.s3DvTool));
      if (inputs.s3TailInterval) setS3TailInterval(String(inputs.s3TailInterval));
      if (inputs.s3Hole) setS3Hole(String(inputs.s3Hole));
      if (inputs.s3Excess) setS3Excess(String(inputs.s3Excess));
      if (inputs.s3ShoeLen) setS3ShoeLen(String(inputs.s3ShoeLen));
      if (inputs.s3RatLen) setS3RatLen(String(inputs.s3RatLen));
      if (inputs.s3PrevSegments) setS3PrevSegments(JSON.parse(String(inputs.s3PrevSegments)));
      if (inputs.s3Segments) setS3Segments(JSON.parse(String(inputs.s3Segments)));

      // Section 4
      if (inputs.s4TotalDepth) setS4TotalDepth(String(inputs.s4TotalDepth));
      if (inputs.s4LinerTop) setS4LinerTop(String(inputs.s4LinerTop));
      if (inputs.s4TailInterval) setS4TailInterval(String(inputs.s4TailInterval));
      if (inputs.s4Hole) setS4Hole(String(inputs.s4Hole));
      if (inputs.s4Excess) setS4Excess(String(inputs.s4Excess));
      if (inputs.s4ShoeLen) setS4ShoeLen(String(inputs.s4ShoeLen));
      if (inputs.s4RatLen) setS4RatLen(String(inputs.s4RatLen));
      if (inputs.s4DP_ID) setS4DP_ID(String(inputs.s4DP_ID));
      if (inputs.s4PrevSegments) setS4PrevSegments(JSON.parse(String(inputs.s4PrevSegments)));
      if (inputs.s4Segments) setS4Segments(JSON.parse(String(inputs.s4Segments)));
    }
  }, [initialData]);

  // --- السكشن الأول ---
  const [s1Hole, setS1Hole] = useState<string>('24');
  const [s1Excess, setS1Excess] = useState<string>('100');
  const [s1ShoeLen, setS1ShoeLen] = useState<string>('20');
  const [s1RatLen, setS1RatLen] = useState<string>('3');
  const [s1Segments, setS1Segments] = useState<Segment[]>([
    { id: 's1-1', from: '0', to: '150', od: '18.625', id_val: '17.755' },
    { id: 's1-2', from: '150', to: '250', od: '18.625', id_val: '16.000' }
  ]);

  // --- السكشن الثاني ---
  const [s2TotalDepth, setS2TotalDepth] = useState<string>('3200');
  const [s2TailInterval, setS2TailInterval] = useState<string>('500');
  const [s2Hole, setS2Hole] = useState<string>('17.5');
  const [s2Excess, setS2Excess] = useState<string>('20');
  const [s2ShoeLen, setS2ShoeLen] = useState<string>('90');
  const [s2RatLen, setS2RatLen] = useState<string>('5');
  const [s2PrevSegments, setS2PrevSegments] = useState<Segment[]>([
    { id: 'p-1', from: '0', to: '150', od: '18.625', id_val: '17.755' },
    { id: 'p-2', from: '150', to: '350', od: '18.625', id_val: '16.125' }
  ]);
  const [s2Segments, setS2Segments] = useState<Segment[]>([
    { id: 's2-1', from: '0', to: '3200', od: '13.375', id_val: '12.347' }
  ]);

  // --- السكشن الثالث ---
  const [s3TotalDepth, setS3TotalDepth] = useState<string>('8528');
  const [s3DvTool, setS3DvTool] = useState<string>('3600');
  const [s3TailInterval, setS3TailInterval] = useState<string>('500');
  const [s3Hole, setS3Hole] = useState<string>('12.25');
  const [s3Excess, setS3Excess] = useState<string>('20');
  const [s3ShoeLen, setS3ShoeLen] = useState<string>('87');
  const [s3RatLen, setS3RatLen] = useState<string>('5');
  const [s3PrevSegments, setS3PrevSegments] = useState<Segment[]>([
    { id: 'p3-1', from: '0', to: '3200', od: '13.375', id_val: '12.347' }
  ]);
  const [s3Segments, setS3Segments] = useState<Segment[]>([
    { id: 's3-1', from: '0', to: '8528', od: '9.625', id_val: '8.681' }
  ]);

  // --- السكشن الرابع (Liner) ---
  const [s4TotalDepth, setS4TotalDepth] = useState<string>('11504');
  const [s4LinerTop, setS4LinerTop] = useState<string>('8228');
  const [s4TailInterval, setS4TailInterval] = useState<string>('1000');
  const [s4Hole, setS4Hole] = useState<string>('8.5');
  const [s4Excess, setS4Excess] = useState<string>('20');
  const [s4ShoeLen, setS4ShoeLen] = useState<string>('40');
  const [s4RatLen, setS4RatLen] = useState<string>('5');
  const [s4DP_ID, setS4DP_ID] = useState<string>('4.276');
  const [s4PrevSegments, setS4PrevSegments] = useState<Segment[]>([
    { id: 'p4-1', from: '0', to: '8528', od: '9.625', id_val: '8.681' }
  ]);
  const [s4Segments, setS4Segments] = useState<Segment[]>([
    { id: 's4-1', from: '8228', to: '11504', od: '7', id_val: '6.184' }
  ]);

  const K = 1029.4;

  const [isApproximate, setIsApproximate] = useState<boolean>(false);

  const [res1, setRes1] = useState({ vAnn: 0, vAnnSub: '', vRat: 0, vRatSub: '', vShoe: 0, vShoeSub: '', total: 0, disp: 0, dispSub: '', floatCollar: 0 });
  const [res2, setRes2] = useState({ vCased: 0, vCasedSub: '', vLead: 0, vLeadSub: '', vTail: 0, vTailSub: '', vRat: 0, vRatSub: '', vShoe: 0, vShoeSub: '', total: 0, disp: 0, dispSub: '', floatCollar: 0, leadTotal: 0, tailTotal: 0 });
  const [res3, setRes3] = useState({ vCased: 0, vCasedSub: '', vStage2OH: 0, vStage2OHSub: '', vLead: 0, vLeadSub: '', vTail: 0, vTailSub: '', vRat: 0, vRatSub: '', vShoe: 0, vShoeSub: '', total: 0, disp1: 0, disp1Sub: '', disp2: 0, disp2Sub: '', floatCollar: 0, leadTotal: 0, tailTotal: 0 });
  const [res4, setRes4] = useState({ vCased: 0, vCasedSub: '', vLead: 0, vLeadSub: '', vTail: 0, vTailSub: '', vRat: 0, vRatSub: '', vShoe: 0, vShoeSub: '', total: 0, disp: 0, dispSub: '', floatCollar: 0, leadTotal: 0, tailTotal: 0 });

  const [res1Approx, setRes1Approx] = useState({ vAnn: 0, vAnnSub: '', vRat: 0, vRatSub: '', vShoe: 0, vShoeSub: '', total: 0, disp: 0, dispSub: '', floatCollar: 0 });
  const [res2Approx, setRes2Approx] = useState({ vCased: 0, vCasedSub: '', vLead: 0, vLeadSub: '', vTail: 0, vTailSub: '', vRat: 0, vRatSub: '', vShoe: 0, vShoeSub: '', total: 0, disp: 0, dispSub: '', floatCollar: 0, leadTotal: 0, tailTotal: 0 });
  const [res3Approx, setRes3Approx] = useState({ vCased: 0, vCasedSub: '', vStage2OH: 0, vStage2OHSub: '', vLead: 0, vLeadSub: '', vTail: 0, vTailSub: '', vRat: 0, vRatSub: '', vShoe: 0, vShoeSub: '', total: 0, disp1: 0, disp1Sub: '', disp2: 0, disp2Sub: '', floatCollar: 0, leadTotal: 0, tailTotal: 0 });
  const [res4Approx, setRes4Approx] = useState({ vCased: 0, vCasedSub: '', vLead: 0, vLeadSub: '', vTail: 0, vTailSub: '', vRat: 0, vRatSub: '', vShoe: 0, vShoeSub: '', total: 0, disp: 0, dispSub: '', floatCollar: 0, leadTotal: 0, tailTotal: 0 });

  const [explanationModal, setExplanationModal] = useState<{ title: string, content: string, range?: string, formula?: string } | null>(null);

  const curRes1 = isApproximate ? res1Approx : res1;
  const curRes2 = isApproximate ? res2Approx : res2;
  const curRes3 = isApproximate ? res3Approx : res3;
  const curRes4 = isApproximate ? res4Approx : res4;

  useEffect(() => {
    const h = parseFloat(s1Hole) || 0, exc = (parseFloat(s1Excess) || 0) / 100, shoeL = parseFloat(s1ShoeLen) || 0, ratL = parseFloat(s1RatLen) || 0;
    let vA = 0, vASub: string[] = [], vD = 0, vDSub: string[] = [], lastID = 0, maxD = 0;
    
    // Approximate computation help vars
    let vD_approx = 0, vDSub_approx: string[] = [], lastOD = 0;

    s1Segments.forEach(s => { if (parseFloat(s.to) > maxD) maxD = parseFloat(s.to); });
    const fc = maxD - shoeL;
    s1Segments.forEach(s => {
      const f = parseFloat(s.from) || 0, t = parseFloat(s.to) || 0, od = parseFloat(s.od) || 0, id = parseFloat(s.id_val) || 0, len = t - f;
      if (len > 0) {
        vA += ((h**2 - od**2) / K) * len * (1 + exc);
        vASub.push(`\\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${len} \\times ${1 + exc}`);
        
        const dL = Math.max(0, Math.min(t, fc) - Math.max(f, 0));
        if (dL > 0) { 
          vD += (id**2 / K) * dL; 
          vDSub.push(`\\frac{${id}^2}{${K}} \\times ${dL.toFixed(1)}`); 
          
          vD_approx += (od**2 / K) * dL;
          vDSub_approx.push(`\\frac{${od}^2}{${K}} \\times ${dL.toFixed(1)}`);
        }
        lastID = id;
        lastOD = od;
      }
    });
    const vr = (h**2 / K) * ratL * (1 + exc), vs = (lastID**2 / K) * shoeL;
    setRes1({ vAnn: vA, vAnnSub: `V = ${vASub.join(' + ')}`, vRat: vr, vRatSub: `V = \\frac{${h}^2}{${K}} \\times ${ratL} \\times ${1 + exc}`, vShoe: vs, vShoeSub: `V = \\frac{${lastID}^2}{${K}} \\times ${shoeL}`, total: vA + vr + vs, disp: vD, dispSub: `Disp = ${vDSub.join(' + ')}`, floatCollar: fc });

    const vs_approx = (lastOD**2 / K) * shoeL;
    setRes1Approx({ vAnn: vA, vAnnSub: `V = ${vASub.join(' + ')}`, vRat: vr, vRatSub: `V = \\frac{${h}^2}{${K}} \\times ${ratL} \\times ${1 + exc}`, vShoe: vs_approx, vShoeSub: `V = \\frac{${lastOD}^2}{${K}} \\times ${shoeL}`, total: vA + vr + vs_approx, disp: vD_approx, dispSub: `Disp = ${vDSub_approx.join(' + ')}`, floatCollar: fc });
  }, [s1Hole, s1Excess, s1ShoeLen, s1RatLen, s1Segments]);

  useEffect(() => {
    const h = parseFloat(s2Hole) || 0, td = parseFloat(s2TotalDepth) || 0, ti = parseFloat(s2TailInterval) || 0, exc = (parseFloat(s2Excess) || 0) / 100, sl = parseFloat(s2ShoeLen) || 0, rl = parseFloat(s2RatLen) || 0, ts = td - ti, fc = td - sl;
    let vc = 0, vcSub: string[] = [], vl = 0, vlSub: string[] = [], vt = 0, vtSub: string[] = [], vd = 0, vdSub: string[] = [], lastID = 0, pShoeMax = 0;
    
    // Approximate fields
    let vc_approx = 0, vcSub_approx: string[] = [], vd_approx = 0, vdSub_approx: string[] = [], lastOD = 0;

    s2PrevSegments.forEach(ps => { if (parseFloat(ps.to) > pShoeMax) pShoeMax = parseFloat(ps.to); });
    s2Segments.forEach(seg => {
      const f = parseFloat(seg.from) || 0, t = parseFloat(seg.to) || 0, od = parseFloat(seg.od) || 0, id = parseFloat(seg.id_val) || 0; 
      lastID = id;
      lastOD = od;

      s2PrevSegments.forEach(ps => {
        const intersection = Math.max(0, Math.min(t, parseFloat(ps.to)) - Math.max(f, parseFloat(ps.from)));
        if (intersection > 0) {
          const pid = parseFloat(ps.id_val) || 0;
          vc += ((pid**2 - od**2) / K) * intersection;
          vcSub.push(`\\frac{(${pid}^2 - ${od}^2)}{${K}} \\times ${intersection.toFixed(1)}`);

          const pod = parseFloat(ps.od) || 0;
          vc_approx += ((pod**2 - od**2) / K) * intersection;
          vcSub_approx.push(`\\frac{(${pod}^2 - ${od}^2)}{${K}} \\times ${intersection.toFixed(1)}`);
        }
      });
      const loh = Math.max(0, Math.min(t, ts) - Math.max(f, pShoeMax));
      if (loh > 0) { 
        vl += ((h**2 - od**2) / K) * loh * (1 + exc); 
        vlSub.push(`\\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${loh.toFixed(1)} \\times ${1+exc}`); 
      }
      const toh = Math.max(0, Math.min(t, td) - Math.max(f, ts));
      if (toh > 0) { 
        vt += ((h**2 - od**2) / K) * toh * (1 + exc); 
        vtSub.push(`\\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${toh.toFixed(1)} \\times ${1+exc}`); 
      }
      const dL = Math.max(0, Math.min(t, fc) - Math.max(f, 0));
      if (dL > 0) { 
        vd += (id**2 / K) * dL; 
        vdSub.push(`\\frac{${id}^2}{${K}} \\times ${dL.toFixed(1)}`); 

        vd_approx += (od**2 / K) * dL; 
        vdSub_approx.push(`\\frac{${od}^2}{${K}} \\times ${dL.toFixed(1)}`); 
      }
    });
    const vr = (h**2 / K) * rl * (1 + exc), vs = (lastID**2 / K) * sl;
    setRes2({ vCased: vc, vCasedSub: `V = ${vcSub.join(' + ')}`, vLead: vl, vLeadSub: `V = ${vlSub.join(' + ')}`, vTail: vt, vTailSub: `V = ${vtSub.join(' + ')}`, vRat: vr, vRatSub: `V = \\frac{${h}^2}{${K}} \\times ${rl} \\times ${1+exc}`, vShoe: vs, vShoeSub: `V = \\frac{${lastID}^2}{${K}} \\times ${sl}`, total: vc + vl + vt + vr + vs, disp: vd, dispSub: `Disp = ${vdSub.join(' + ')}`, floatCollar: fc, leadTotal: vc + vl, tailTotal: vt + vr + vs });

    const vs_approx = (lastOD**2 / K) * sl;
    setRes2Approx({ vCased: vc_approx, vCasedSub: `V = ${vcSub_approx.join(' + ')}`, vLead: vl, vLeadSub: `V = ${vlSub.join(' + ')}`, vTail: vt, vTailSub: `V = ${vtSub.join(' + ')}`, vRat: vr, vRatSub: `V = \\frac{${h}^2}{${K}} \\times ${rl} \\times ${1+exc}`, vShoe: vs_approx, vShoeSub: `V = \\frac{${lastOD}^2}{${K}} \\times ${sl}`, total: vc_approx + vl + vt + vr + vs_approx, disp: vd_approx, dispSub: `Disp = ${vdSub_approx.join(' + ')}`, floatCollar: fc, leadTotal: vc_approx + vl, tailTotal: vt + vr + vs_approx });
  }, [s2Hole, s2TotalDepth, s2TailInterval, s2Excess, s2ShoeLen, s2RatLen, s2Segments, s2PrevSegments]);

  useEffect(() => {
    const h = parseFloat(s3Hole) || 0, td = parseFloat(s3TotalDepth) || 0, dv = parseFloat(s3DvTool) || 0, ti = parseFloat(s3TailInterval) || 0, exc = (parseFloat(s3Excess) || 0) / 100, sl = parseFloat(s3ShoeLen) || 0, rl = parseFloat(s3RatLen) || 0, ts = td - ti, fc = td - sl;
    let vc = 0, vcSub: string[] = [], vs2o = 0, vs2oSub: string[] = [], vl = 0, vlSub: string[] = [], vt = 0, vtSub: string[] = [], lastID = 0, pShoeMax = 0, vd1 = 0, vd1Sub: string[] = [], vd2 = 0, vd2Sub: string[] = [];
    
    // Approximate fields
    let vc_approx = 0, vcSub_approx: string[] = [], vd1_approx = 0, vd1Sub_approx: string[] = [], vd2_approx = 0, vd2Sub_approx: string[] = [], lastOD = 0;

    s3PrevSegments.forEach(ps => { if (parseFloat(ps.to) > pShoeMax) pShoeMax = parseFloat(ps.to); });
    s3Segments.forEach(seg => {
      const f = parseFloat(seg.from) || 0, t = parseFloat(seg.to) || 0, od = parseFloat(seg.od) || 0, id = parseFloat(seg.id_val) || 0; 
      lastID = id;
      lastOD = od;

      s3PrevSegments.forEach(ps => {
        const intersection = Math.max(0, Math.min(t, parseFloat(ps.to)) - Math.max(f, parseFloat(ps.from)));
        if (intersection > 0) {
          const pid = parseFloat(ps.id_val) || 0;
          vc += ((pid**2 - od**2) / K) * intersection;
          vcSub.push(`\\frac{(${pid}^2 - ${od}^2)}{${K}} \\times ${intersection.toFixed(1)}`);

          const pod = parseFloat(ps.od) || 0;
          vc_approx += ((pod**2 - od**2) / K) * intersection;
          vcSub_approx.push(`\\frac{(${pod}^2 - ${od}^2)}{${K}} \\times ${intersection.toFixed(1)}`);
        }
      });
      const loh2 = Math.max(0, Math.min(t, dv) - Math.max(f, pShoeMax));
      if (loh2 > 0) { vs2o += ((h**2 - od**2) / K) * loh2 * (1 + exc); vs2oSub.push(`\\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${loh2.toFixed(1)} \\times ${1+exc}`); }
      const lLead = Math.max(0, Math.min(t, ts) - Math.max(f, dv));
      if (lLead > 0) { vl += ((h**2 - od**2) / K) * lLead * (1 + exc); vlSub.push(`\\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${lLead.toFixed(1)} \\times ${1+exc}`); }
      const lTail = Math.max(0, Math.min(t, td) - Math.max(f, ts));
      if (lTail > 0) { vt += ((h**2 - od**2) / K) * lTail * (1 + exc); vtSub.push(`\\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${lTail.toFixed(1)} \\times ${1+exc}`); }
      
      const d1L = Math.max(0, Math.min(t, fc) - Math.max(f, 0));
      if (d1L > 0) { 
        vd1 += (id**2 / K) * d1L; 
        vd1Sub.push(`\\frac{${id}^2}{${K}} \\times ${d1L.toFixed(1)}`); 

        vd1_approx += (od**2 / K) * d1L;
        vd1Sub_approx.push(`\\frac{${od}^2}{${K}} \\times ${d1L.toFixed(1)}`);
      }
      const d2L = Math.max(0, Math.min(t, dv) - Math.max(f, 0));
      if (d2L > 0) { 
        vd2 += (id**2 / K) * d2L; 
        vd2Sub.push(`\\frac{${id}^2}{${K}} \\times ${d2L.toFixed(1)}`); 

        vd2_approx += (od**2 / K) * d2L;
        vd2Sub_approx.push(`\\frac{${od}^2}{${K}} \\times ${d2L.toFixed(1)}`);
      }
    });
    const vr = (h**2 / K) * rl * (1 + exc), vs = (lastID**2 / K) * sl;
    setRes3({ vCased: vc, vCasedSub: `V = ${vcSub.join(' + ')}`, vStage2OH: vs2o, vStage2OHSub: `V = ${vs2oSub.join(' + ')}`, vLead: vl, vLeadSub: `V = ${vlSub.join(' + ')}`, vTail: vt, vTailSub: `V = ${vtSub.join(' + ')}`, vRat: vr, vRatSub: `V = \\frac{${h}^2}{${K}} \\times ${rl} \\times ${1+exc}`, vShoe: vs, vShoeSub: `V = \\frac{${lastID}^2}{${K}} \\times ${sl}`, total: vc + vs2o + vl + vt + vr + vs, disp1: vd1, disp1Sub: `Disp_1 = ${vd1Sub.join(' + ')}`, disp2: vd2, disp2Sub: `Disp_2 = ${vd2Sub.join(' + ')}`, floatCollar: fc, leadTotal: vc + vs2o + vl, tailTotal: vt + vr + vs });

    const vs_approx = (lastOD**2 / K) * sl;
    setRes3Approx({ vCased: vc_approx, vCasedSub: `V = ${vcSub_approx.join(' + ')}`, vStage2OH: vs2o, vStage2OHSub: `V = ${vs2oSub.join(' + ')}`, vLead: vl, vLeadSub: `V = ${vlSub.join(' + ')}`, vTail: vt, vTailSub: `V = ${vtSub.join(' + ')}`, vRat: vr, vRatSub: `V = \\frac{${h}^2}{${K}} \\times ${rl} \\times ${1+exc}`, vShoe: vs_approx, vShoeSub: `V = \\frac{${lastOD}^2}{${K}} \\times ${sl}`, total: vc_approx + vs2o + vl + vt + vr + vs_approx, disp1: vd1_approx, disp1Sub: `Disp_1 = ${vd1Sub_approx.join(' + ')}`, disp2: vd2_approx, disp2Sub: `Disp_2 = ${vd2Sub_approx.join(' + ')}`, floatCollar: fc, leadTotal: vc_approx + vs2o + vl, tailTotal: vt + vr + vs_approx });
  }, [s3Hole, s3TotalDepth, s3DvTool, s3TailInterval, s3Excess, s3ShoeLen, s3RatLen, s3Segments, s3PrevSegments]);

  useEffect(() => {
    const h = parseFloat(s4Hole) || 0, td = parseFloat(s4TotalDepth) || 0, lt = parseFloat(s4LinerTop) || 0, ti = parseFloat(s4TailInterval) || 0, exc = (parseFloat(s4Excess) || 0) / 100, sl = parseFloat(s4ShoeLen) || 0, rl = parseFloat(s4RatLen) || 0, ts = td - ti, fc = td - sl, dpID = parseFloat(s4DP_ID) || 0;
    let vc = 0, vcSub: string[] = [], vl = 0, vlSub: string[] = [], vt = 0, vtSub: string[] = [], vd = 0, vdSub: string[] = [], lastID = 0, pShoeMax = 0;
    
    // Approximate fields
    let vc_approx = 0, vcSub_approx: string[] = [], vd_approx = 0, vdSub_approx: string[] = [], lastOD = 0;
    const dpOD = 5.0; // standard 5" drill pipe outer diameter

    // Displacement in Drill Pipe (from surface to liner top)
    if (lt > 0 && dpID > 0) {
      vd += (dpID**2 / K) * lt;
      vdSub.push(`\\frac{${dpID}^2}{${K}} \\times ${lt.toFixed(1)}`);

      vd_approx += (dpOD**2 / K) * lt;
      vdSub_approx.push(`\\frac{${dpOD}^2}{${K}} \\times ${lt.toFixed(1)}`);
    }

    s4PrevSegments.forEach(ps => { if (parseFloat(ps.to) > pShoeMax) pShoeMax = parseFloat(ps.to); });
    s4Segments.forEach(seg => {
      const f = parseFloat(seg.from) || 0, t = parseFloat(seg.to) || 0, od = parseFloat(seg.od) || 0, id = parseFloat(seg.id_val) || 0; 
      lastID = id;
      lastOD = od;

      s4PrevSegments.forEach(ps => {
        const intersection = Math.max(0, Math.min(t, Math.min(parseFloat(ps.to), pShoeMax)) - Math.max(f, Math.max(parseFloat(ps.from), lt)));
        if (intersection > 0) {
          const pid = parseFloat(ps.id_val) || 0;
          vc += ((pid**2 - od**2) / K) * intersection;
          vcSub.push(`\\frac{(${pid}^2 - ${od}^2)}{${K}} \\times ${intersection.toFixed(1)}`);

          const pod = parseFloat(ps.od) || 0;
          vc_approx += ((pod**2 - od**2) / K) * intersection;
          vcSub_approx.push(`\\frac{(${pod}^2 - ${od}^2)}{${K}} \\times ${intersection.toFixed(1)}`);
        }
      });
      const loh = Math.max(0, Math.min(t, ts) - Math.max(f, pShoeMax));
      if (loh > 0) { vl += ((h**2 - od**2) / K) * loh * (1 + exc); vlSub.push(`\\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${loh.toFixed(1)} \\times ${1+exc}`); }
      const toh = Math.max(0, Math.min(t, td) - Math.max(f, ts));
      if (toh > 0) { vt += ((h**2 - od**2) / K) * toh * (1 + exc); vtSub.push(`\\frac{(${h}^2 - ${od}^2)}{${K}} \\times ${toh.toFixed(1)} \\times ${1+exc}`); }
      
      const dL = Math.max(0, Math.min(t, fc) - Math.max(f, lt));
      if (dL > 0) { 
        vd += (id**2 / K) * dL; 
        vdSub.push(`\\frac{${id}^2}{${K}} \\times ${dL.toFixed(1)}`); 

        vd_approx += (od**2 / K) * dL;
        vdSub_approx.push(`\\frac{${od}^2}{${K}} \\times ${dL.toFixed(1)}`);
      }
    });
    const vr = (h**2 / K) * rl * (1 + exc), vs = (lastID**2 / K) * sl;
    setRes4({ vCased: vc, vCasedSub: `V = ${vcSub.join(' + ')}`, vLead: vl, vLeadSub: `V = ${vlSub.join(' + ')}`, vTail: vt, vTailSub: `V = ${vtSub.join(' + ')}`, vRat: vr, vRatSub: `V = \\frac{${h}^2}{${K}} \\times ${rl} \\times ${1+exc}`, vShoe: vs, vShoeSub: `V = \\frac{${lastID}^2}{${K}} \\times ${sl}`, total: vc + vl + vt + vr + vs, disp: vd, dispSub: `Disp = ${vdSub.join(' + ')}`, floatCollar: fc, leadTotal: vc + vl, tailTotal: vt + vr + vs });

    const vs_approx = (lastOD**2 / K) * sl;
    setRes4Approx({ vCased: vc_approx, vCasedSub: `V = ${vcSub_approx.join(' + ')}`, vLead: vl, vLeadSub: `V = ${vlSub.join(' + ')}`, vTail: vt, vTailSub: `V = ${vtSub.join(' + ')}`, vRat: vr, vRatSub: `V = \\frac{${h}^2}{${K}} \\times ${rl} \\times ${1+exc}`, vShoe: vs_approx, vShoeSub: `V = \\frac{${lastOD}^2}{${K}} \\times ${sl}`, total: vc_approx + vl + vt + vr + vs_approx, disp: vd_approx, dispSub: `Disp = ${vdSub_approx.join(' + ')}`, floatCollar: fc, leadTotal: vc_approx + vl, tailTotal: vt + vr + vs_approx });
  }, [s4Hole, s4TotalDepth, s4LinerTop, s4TailInterval, s4Excess, s4ShoeLen, s4RatLen, s4Segments, s4PrevSegments, s4DP_ID]);

  const addSeg = (tab: string) => {
    const nextId = Date.now().toString();
    if (tab === 'SEC1') setS1Segments([...s1Segments, { id: nextId, from: s1Segments[s1Segments.length-1]?.to || '0', to: (parseFloat(s1Segments[s1Segments.length-1]?.to || '0') + 100).toString(), od: '18.625', id_val: '17.755' }]);
    else if (tab === 'SEC2') setS2Segments([...s2Segments, { id: nextId, from: s2Segments[s2Segments.length-1]?.to || '0', to: (parseFloat(s2Segments[s2Segments.length-1]?.to || '0') + 100).toString(), od: '13.375', id_val: '12.347' }]);
    else if (tab === 'PREV2') setS2PrevSegments([...s2PrevSegments, { id: nextId, from: s2PrevSegments[s2PrevSegments.length-1]?.to || '0', to: (parseFloat(s2PrevSegments[s2PrevSegments.length-1]?.to || '0') + 100).toString(), od: '18.625', id_val: '17.755' }]);
    else if (tab === 'SEC3') setS3Segments([...s3Segments, { id: nextId, from: s3Segments[s3Segments.length-1]?.to || '0', to: (parseFloat(s3Segments[s3Segments.length-1]?.to || '0') + 100).toString(), od: '9.625', id_val: '8.681' }]);
    else if (tab === 'PREV3') setS3PrevSegments([...s3PrevSegments, { id: nextId, from: s3PrevSegments[s3PrevSegments.length-1]?.to || '0', to: (parseFloat(s3PrevSegments[s3PrevSegments.length-1]?.to || '0') + 100).toString(), od: '13.375', id_val: '12.347' }]);
    else if (tab === 'SEC4') setS4Segments([...s4Segments, { id: nextId, from: s4Segments[s4Segments.length-1]?.to || '0', to: (parseFloat(s4Segments[s4Segments.length-1]?.to || '0') + 100).toString(), od: '7', id_val: '6.184' }]);
    else if (tab === 'PREV4') setS4PrevSegments([...s4PrevSegments, { id: nextId, from: s4PrevSegments[s4PrevSegments.length-1]?.to || '0', to: (parseFloat(s4PrevSegments[s4PrevSegments.length-1]?.to || '0') + 100).toString(), od: '9.625', id_val: '8.681' }]);
  };

  const handleSave = () => {
    const cur = activeTab === 'SEC1' ? curRes1 : activeTab === 'SEC2' ? curRes2 : activeTab === 'SEC3' ? curRes3 : curRes4;
    onResult({ 
      id: Date.now().toString(), 
      type: CalcType.COMPLETE_SECTION, 
      title: `تقرير السكشن المتعدد (${activeTab === 'SEC1' ? 'الأول' : activeTab === 'SEC2' ? 'الثاني' : activeTab === 'SEC3' ? 'الثالث' : 'الرابع'})${isApproximate ? ' - تقريبي' : ''}`, 
      inputs: { 
        Tab: activeTab, 
        Volume: cur.total.toFixed(2),
        Mode: 'SEGMENTED',
        isApproximate: String(isApproximate),
        s1Hole, s1Excess, s1ShoeLen, s1RatLen, s1Segments: JSON.stringify(s1Segments),
        s2TotalDepth, s2TailInterval, s2Hole, s2Excess, s2ShoeLen, s2RatLen, s2PrevSegments: JSON.stringify(s2PrevSegments), s2Segments: JSON.stringify(s2Segments),
        s3TotalDepth, s3DvTool, s3TailInterval, s3Hole, s3Excess, s3ShoeLen, s3RatLen, s3PrevSegments: JSON.stringify(s3PrevSegments), s3Segments: JSON.stringify(s3Segments),
        s4TotalDepth, s4LinerTop, s4TailInterval, s4Hole, s4Excess, s4ShoeLen, s4RatLen, s4DP_ID, s4PrevSegments: JSON.stringify(s4PrevSegments), s4Segments: JSON.stringify(s4Segments)
      }, 
      result: cur.total, 
      timestamp: Date.now() 
    });
    alert('تم الحفظ بنجاح');
  };

  const s1TotalDepth = s1Segments[s1Segments.length - 1]?.to || '0';
  const s2PrevShoeVal = Math.max(...s2PrevSegments.map(s => parseFloat(s.to) || 0), 0);
  const s3PrevShoeVal = Math.max(...s3PrevSegments.map(s => parseFloat(s.to) || 0), 0);
  const s4PrevShoeVal = Math.max(...s4PrevSegments.map(s => parseFloat(s.to) || 0), 0);

  const diagramData = {
    holeSize: parseFloat(activeTab === 'SEC1' ? s1Hole : activeTab === 'SEC2' ? s2Hole : activeTab === 'SEC3' ? s3Hole : s4Hole) || 0,
    casingOD: parseFloat(activeTab === 'SEC1' ? s1Segments[s1Segments.length-1]?.od : activeTab === 'SEC2' ? s2Segments[s2Segments.length-1]?.od : activeTab === 'SEC3' ? s3Segments[s3Segments.length-1]?.od : s4Segments[s4Segments.length-1]?.od) || 0,
    casingID: isApproximate ? (parseFloat(activeTab === 'SEC1' ? s1Segments[s1Segments.length-1]?.od : activeTab === 'SEC2' ? s2Segments[s2Segments.length-1]?.od : activeTab === 'SEC3' ? s3Segments[s3Segments.length-1]?.od : s4Segments[s4Segments.length-1]?.od) || 0) : (parseFloat(activeTab === 'SEC1' ? s1Segments[s1Segments.length-1]?.id_val : activeTab === 'SEC2' ? s2Segments[s2Segments.length-1]?.id_val : activeTab === 'SEC3' ? s3Segments[s3Segments.length-1]?.id_val : s4Segments[s4Segments.length-1]?.id_val) || 0),
    casingDepth: parseFloat(activeTab === 'SEC1' ? s1Segments[s1Segments.length-1]?.to : activeTab === 'SEC2' ? s2TotalDepth : activeTab === 'SEC3' ? s3TotalDepth : s4TotalDepth) || 0,
    holeDepth: (parseFloat(activeTab === 'SEC1' ? s1Segments[s1Segments.length-1]?.to : activeTab === 'SEC2' ? s2TotalDepth : activeTab === 'SEC3' ? s3TotalDepth : s4TotalDepth) || 0) + (parseFloat(activeTab === 'SEC1' ? s1RatLen : activeTab === 'SEC2' ? s2RatLen : activeTab === 'SEC3' ? s3RatLen : s4RatLen) || 0),
    shoeTrack: parseFloat(activeTab === 'SEC1' ? s1ShoeLen : activeTab === 'SEC2' ? s2ShoeLen : activeTab === 'SEC3' ? s3ShoeLen : s4ShoeLen) || 0,
    ratHole: parseFloat(activeTab === 'SEC1' ? s1RatLen : activeTab === 'SEC2' ? s2RatLen : activeTab === 'SEC3' ? s3RatLen : s4RatLen) || 0,
    displacement: activeTab === 'SEC1' ? curRes1.disp : activeTab === 'SEC2' ? curRes2.disp : activeTab === 'SEC3' ? curRes3.disp1 : curRes4.disp,
    floatCollarDepth: activeTab === 'SEC1' ? curRes1.floatCollar : activeTab === 'SEC2' ? curRes2.floatCollar : activeTab === 'SEC3' ? curRes3.floatCollar : curRes4.floatCollar,
    annularVolume: activeTab === 'SEC1' ? curRes1.vAnn : activeTab === 'SEC2' ? (curRes2.vCased + curRes2.vLead + curRes2.vTail) : activeTab === 'SEC3' ? (curRes3.vCased + curRes3.vStage2OH + curRes3.vLead + curRes3.vTail) : (curRes4.vCased + curRes4.vLead + curRes4.vTail),
    excess: parseFloat(activeTab === 'SEC1' ? s1Excess : activeTab === 'SEC2' ? s2Excess : activeTab === 'SEC3' ? s3Excess : s4Excess) || 0,
    tailDepth: activeTab === 'SEC2' ? (parseFloat(s2TotalDepth) - parseFloat(s2TailInterval)) : activeTab === 'SEC3' ? (parseFloat(s3TotalDepth) - parseFloat(s3TailInterval)) : activeTab === 'SEC4' ? (parseFloat(s4TotalDepth) - parseFloat(s4TailInterval)) : undefined,
    leadDepth: activeTab === 'SEC1' ? undefined : activeTab === 'SEC2' ? 0 : activeTab === 'SEC3' ? s3PrevShoeVal : activeTab === 'SEC4' ? parseFloat(s4LinerTop) : undefined,
    dvToolDepth: activeTab === 'SEC3' ? parseFloat(s3DvTool) : undefined,
    prevCasingDepth: activeTab === 'SEC2' ? s2PrevShoeVal : activeTab === 'SEC3' ? s3PrevShoeVal : activeTab === 'SEC4' ? s4PrevShoeVal : undefined,
    prevID: isApproximate ? (parseFloat(activeTab === 'SEC2' ? s2PrevSegments[s2PrevSegments.length-1]?.od : activeTab === 'SEC3' ? s3PrevSegments[s3PrevSegments.length-1]?.od : s4PrevSegments[s4PrevSegments.length-1]?.od) || 0) : (parseFloat(activeTab === 'SEC2' ? s2PrevSegments[s2PrevSegments.length-1]?.id_val : activeTab === 'SEC3' ? s3PrevSegments[s3PrevSegments.length-1]?.id_val : s4PrevSegments[s4PrevSegments.length-1]?.id_val) || 0),
    prevCasingOD: activeTab === 'SEC2' ? (parseFloat(s2PrevSegments[s2PrevSegments.length-1]?.od) || 0) : activeTab === 'SEC3' ? (parseFloat(s3PrevSegments[s3PrevSegments.length-1]?.od) || 0) : activeTab === 'SEC4' ? (parseFloat(s4PrevSegments[s4PrevSegments.length-1]?.od) || 0) : undefined,
    prevCasingID: isApproximate ? (parseFloat(activeTab === 'SEC2' ? s2PrevSegments[s2PrevSegments.length-1]?.od : activeTab === 'SEC3' ? s3PrevSegments[s3PrevSegments.length-1]?.od : s4PrevSegments[s4PrevSegments.length-1]?.od) || 0) : (parseFloat(activeTab === 'SEC2' ? s2PrevSegments[s2PrevSegments.length-1]?.id_val : activeTab === 'SEC3' ? s3PrevSegments[s3PrevSegments.length-1]?.id_val : s4PrevSegments[s4PrevSegments.length-1]?.id_val) || 0),
    linerTopDepth: activeTab === 'SEC4' ? parseFloat(s4LinerTop) : undefined
  };

  return (
    <div className="space-y-6 text-right pb-32 animate-in fade-in duration-500">
      <header className="text-center relative">
        <h1 
          className="text-3xl font-black mb-1 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent italic tracking-tighter uppercase cursor-pointer select-none"
        >
          COMPLETE SECTION PRO
        </h1>
        <div className="flex bg-slate-900/60 p-1 rounded-2xl border border-slate-800 backdrop-blur-md mt-4 max-w-sm mx-auto overflow-x-auto no-scrollbar">
           <button onClick={() => setActiveTab('SEC1')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black transition-all ${activeTab === 'SEC1' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>السكشن الأول</button>
           <button onClick={() => setActiveTab('SEC2')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black transition-all ${activeTab === 'SEC2' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>السكشن الثاني</button>
           <button onClick={() => setActiveTab('SEC3')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black transition-all ${activeTab === 'SEC3' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500'}`}>السكشن الثالث</button>
           <button onClick={() => setActiveTab('SEC4')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black transition-all ${activeTab === 'SEC4' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-500'}`}>السكشن الرابع</button>
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

      <div className={`p-8 rounded-[2.5rem] border shadow-2xl relative overflow-hidden transition-all duration-500 ${activeTab === 'SEC1' ? 'bg-blue-900/20 border-blue-500/30' : activeTab === 'SEC2' ? 'bg-indigo-900/20 border-indigo-500/30' : activeTab === 'SEC3' ? 'bg-purple-900/20 border-purple-500/30' : 'bg-pink-900/20 border-pink-500/30'}`}>
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mt-16 blur-3xl"></div>
        <div className="flex flex-col items-center relative z-10 text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">إجمالي الحجم للسكشن {activeTab}</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-7xl font-black text-white">{(activeTab === 'SEC1' ? curRes1.total : activeTab === 'SEC2' ? curRes2.total : activeTab === 'SEC3' ? curRes3.total : curRes4.total).toFixed(1)}</span>
            <span className="text-2xl font-bold text-blue-400 italic">bbl</span>
          </div>

          <div className="bg-slate-800/80 w-full px-4 py-3 rounded-2xl border border-slate-700 flex flex-col items-center gap-3">
             <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic tracking-wider">ملخص النتائج النهائية (Final Results Summary)</span>
             
             {/* Displacement Section */}
             <div className="w-full flex flex-col items-center border-b border-slate-700/50 pb-2 mb-1">
                <span className="text-[8px] text-slate-500 font-black uppercase mb-1">بيانات الإزاحة (Displacement)</span>
                {activeTab === 'SEC3' ? (
                  <div className="grid grid-cols-2 gap-4 w-full">
                     <div><span className="block text-[8px] text-emerald-500/70 font-bold italic uppercase">إزاحة م1 (Collar)</span><span className="text-lg font-black text-emerald-400">{curRes3.disp1.toFixed(1)} <span className="text-[10px]">bbl</span></span></div>
                     <div className="border-r border-slate-700"><span className="block text-[8px] text-amber-500/70 font-bold italic uppercase">إزاحة م2 (DV)</span><span className="text-lg font-black text-amber-400">{curRes3.disp2.toFixed(1)} <span className="text-[10px]">bbl</span></span></div>
                  </div>
                ) : (
                  <span className="text-2xl text-emerald-400 font-black">{(activeTab === 'SEC1' ? curRes1.disp : activeTab === 'SEC2' ? curRes2.disp : curRes4.disp).toFixed(1)} <span className="text-sm">bbl</span></span>
                )}
             </div>

             {/* Lead & Tail Section (Only for SEC2, SEC3 & SEC4) */}
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
          </div>
        </div>
      </div>

      {/* Drawing Diagram */}
      <SectionDiagram 
        {...diagramData}
        type={activeTab}
      />

      <div className={`bg-slate-900/40 border ${expanded === 'global' ? 'border-blue-500/50 shadow-lg' : 'border-slate-800'} rounded-[2rem] overflow-hidden transition-all duration-300`}>
        <button onClick={() => setExpanded(expanded === 'global' ? null : 'global')} className="w-full p-5 flex items-center justify-between">
          {expanded === 'global' ? <ChevronUp className="text-blue-400 w-4 h-4" /> : <ChevronDown className="text-slate-500 w-4 h-4" />}
          <div className="flex items-center gap-3">
            <div className="text-right"><span className="block font-black text-xs text-white uppercase tracking-wider">Parameters Configuration</span><span className="block text-[9px] text-slate-500 font-bold italic">إعدادات التحكم الشامل</span></div>
            <Settings2 className={`w-5 h-5 ${expanded === 'global' ? 'text-blue-400' : 'text-slate-600'}`} />
          </div>
        </button>
        {expanded === 'global' && (
          <div className="p-6 pt-0 space-y-6 animate-in fade-in">
             {activeTab === 'SEC1' ? (
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4"><Input label="Hole Size (in)" val={s1Hole} set={setS1Hole} /><Input label="Excess (%)" val={s1Excess} set={setS1Excess} /></div>
                  <div className="grid grid-cols-2 gap-4"><Input label="Shoe Track (ft)" val={s1ShoeLen} set={setS1ShoeLen} /><Input label="Rat Hole (ft)" val={s1RatLen} set={setS1RatLen} /></div>
                  <div className="space-y-4 pt-4 border-t border-slate-800 text-center">
                    <button onClick={() => addSeg('SEC1')} className="text-[9px] font-black text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-all">+ إضافة قطعة كيسنج</button>
                    {s1Segments.map((s, idx) => (<SegmentRow key={s.id} idx={idx} seg={s} variant="current" onSelectCasing={(od, id_val) => setS1Segments(s1Segments.map(seg => seg.id === s.id ? {...seg, od, id_val} : seg))} onUpdate={(f, v) => setS1Segments(s1Segments.map(seg => seg.id === s.id ? {...seg, [f]: v} : seg))} onRemove={() => setS1Segments(s1Segments.filter(seg => seg.id !== s.id))} />))}
                  </div>
               </div>
             ) : activeTab === 'SEC2' ? (
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4"><Input label="Total Depth (ft)" val={s2TotalDepth} set={setS2TotalDepth} /><Input label="Tail Interval (ft)" val={s2TailInterval} set={setS2TailInterval} /></div>
                  <div className="grid grid-cols-2 gap-4"><Input label="Hole Size (in)" val={s2Hole} set={setS2Hole} /><Input label="Excess (%)" val={s2Excess} set={setS2Excess} /></div>
                  <div className="grid grid-cols-2 gap-4"><Input label="Shoe Track (ft)" val={s2ShoeLen} set={setS2ShoeLen} /><Input label="Rat Hole (ft)" val={s2RatLen} set={setS2RatLen} /></div>
                  <div className="space-y-4 pt-4 border-t border-slate-800 text-center">
                    <button onClick={() => addSeg('PREV2')} className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 hover:bg-amber-500/20 transition-all">+ إضافة قطعة للسلسلة السابقة</button>
                    {s2PrevSegments.map((s, idx) => (<SegmentRow key={s.id} idx={idx} seg={s} variant="previous" onSelectCasing={(od, id_val) => setS2PrevSegments(s2PrevSegments.map(seg => seg.id === s.id ? {...seg, od, id_val} : seg))} onUpdate={(f, v) => setS2PrevSegments(s2PrevSegments.map(seg => seg.id === s.id ? {...seg, [f]: v} : seg))} onRemove={() => setS2PrevSegments(s2PrevSegments.filter(seg => seg.id !== s.id))} />))}
                  </div>
                  <div className="space-y-4 pt-4 border-t border-slate-800 text-center">
                    <button onClick={() => addSeg('SEC2')} className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20 hover:bg-indigo-500/20 transition-all">+ إضافة قطعة للسلسلة الحالية</button>
                    {s2Segments.map((s, idx) => (<SegmentRow key={s.id} idx={idx} seg={s} variant="current" onSelectCasing={(od, id_val) => setS2Segments(s2Segments.map(seg => seg.id === s.id ? {...seg, od, id_val} : seg))} onUpdate={(f, v) => setS2Segments(s2Segments.map(seg => seg.id === s.id ? {...seg, [f]: v} : seg))} onRemove={() => setS2Segments(s2Segments.filter(seg => seg.id !== s.id))} />))}
                  </div>
               </div>
             ) : activeTab === 'SEC3' ? (
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 bg-purple-500/5 p-4 rounded-3xl border border-purple-500/10">
                    <Input label="Total Depth (ft)" val={s3TotalDepth} set={setS3TotalDepth} /><Input label="Tail Interval (ft)" val={s3TailInterval} set={setS3TailInterval} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 text-right"><label className="text-[9px] font-bold text-amber-500 uppercase px-1 flex items-center gap-1 justify-end italic">DV Tool Depth (ft) <Target className="w-2.5 h-2.5" /></label><input className="input-field !p-3 !text-sm !bg-amber-500/10 border-amber-500/30 text-amber-400 font-black" type="number" value={s3DvTool} onChange={e => setS3DvTool(e.target.value)} /></div>
                    <Input label="Hole Size (in)" val={s3Hole} set={setS3Hole} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input label="Shoe Track (ft)" val={s3ShoeLen} set={setS3ShoeLen} />
                    <Input label="Rat Hole (ft)" val={s3RatLen} set={setS3RatLen} />
                    <Input label="Excess (%)" val={s3Excess} set={setS3Excess} />
                  </div>
                  <div className="space-y-4 pt-4 border-t border-slate-800 text-center">
                    <button onClick={() => addSeg('PREV3')} className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 hover:bg-amber-500/20 transition-all">+ إضافة قطعة للسلسلة السابقة</button>
                    {s3PrevSegments.map((s, idx) => (<SegmentRow key={s.id} idx={idx} seg={s} variant="previous" onSelectCasing={(od, id_val) => setS3PrevSegments(s3PrevSegments.map(seg => seg.id === s.id ? {...seg, od, id_val} : seg))} onUpdate={(f, v) => setS3PrevSegments(s3PrevSegments.map(seg => seg.id === s.id ? {...seg, [f]: v} : seg))} onRemove={() => setS3PrevSegments(s3PrevSegments.filter(seg => seg.id !== s.id))} />))}
                  </div>
                  <div className="space-y-4 pt-4 border-t border-slate-800 text-center">
                    <button onClick={() => addSeg('SEC3')} className="text-[9px] font-black text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20 hover:bg-purple-500/20 transition-all">+ إضافة قطعة للسلسلة الحالية</button>
                    {s3Segments.map((s, idx) => (<SegmentRow key={s.id} idx={idx} seg={s} variant="current" onSelectCasing={(od, id_val) => setS3Segments(s3Segments.map(seg => seg.id === s.id ? {...seg, od, id_val} : seg))} onUpdate={(f, v) => setS3Segments(s3Segments.map(seg => seg.id === s.id ? {...seg, [f]: v} : seg))} onRemove={() => setS3Segments(s3Segments.filter(seg => seg.id !== s.id))} />))}
                  </div>
               </div>
             ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 bg-pink-500/5 p-4 rounded-3xl border border-pink-500/10">
                    <Input label="Total Depth (ft)" val={s4TotalDepth} set={setS4TotalDepth} /><Input label="Liner Top (ft)" val={s4LinerTop} set={setS4LinerTop} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Tail Interval (ft)" val={s4TailInterval} set={setS4TailInterval} /><Input label="Hole Size (in)" val={s4Hole} set={setS4Hole} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 bg-emerald-500/5 p-4 rounded-3xl border border-emerald-500/10">
                    <Input label='DP 5" ID (in)' val={s4DP_ID} set={setS4DP_ID} />
                    <div className="flex flex-col justify-center px-1 gap-1.5">
                      <CasingSelector label="أنبوب الحفر (DP)" currentOD="5" currentID={s4DP_ID} onSelect={(_od, id) => setS4DP_ID(id)} variant="current" compact />
                      <span className="text-[10px] text-slate-500 font-bold italic">الإزاحة تتم عبر DP</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input label="Shoe Track (ft)" val={s4ShoeLen} set={setS4ShoeLen} />
                    <Input label="Rat Hole (ft)" val={s4RatLen} set={setS4RatLen} />
                    <Input label="Excess (%)" val={s4Excess} set={setS4Excess} />
                  </div>
                  <div className="space-y-4 pt-4 border-t border-slate-800 text-center">
                    <button onClick={() => addSeg('PREV4')} className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 hover:bg-amber-500/20 transition-all">+ إضافة قطعة للسلسلة السابقة</button>
                    {s4PrevSegments.map((s, idx) => (<SegmentRow key={s.id} idx={idx} seg={s} variant="previous" onSelectCasing={(od, id_val) => setS4PrevSegments(s4PrevSegments.map(seg => seg.id === s.id ? {...seg, od, id_val} : seg))} onUpdate={(f, v) => setS4PrevSegments(s4PrevSegments.map(seg => seg.id === s.id ? {...seg, [f]: v} : seg))} onRemove={() => setS4PrevSegments(s4PrevSegments.filter(seg => seg.id !== s.id))} />))}
                  </div>
                  <div className="space-y-4 pt-4 border-t border-slate-800 text-center">
                    <button onClick={() => addSeg('SEC4')} className="text-[9px] font-black text-pink-400 bg-pink-500/10 px-3 py-1.5 rounded-xl border border-pink-500/20 hover:bg-pink-500/20 transition-all">+ إضافة قطعة للسلسلة الحالية</button>
                    {s4Segments.map((s, idx) => (<SegmentRow key={s.id} idx={idx} seg={s} variant="liner" onSelectCasing={(od, id_val) => setS4Segments(s4Segments.map(seg => seg.id === s.id ? {...seg, od, id_val} : seg))} onUpdate={(f, v) => setS4Segments(s4Segments.map(seg => seg.id === s.id ? {...seg, [f]: v} : seg))} onRemove={() => setS4Segments(s4Segments.filter(seg => seg.id !== s.id))} />))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {activeTab === 'SEC1' ? (
          <>
            <Step num="1" title="V1 Annular OH" law="V = \sum \frac{(Hole^2 - OD^2)}{1029.4} \times L \times Exc" substituted={curRes1.vAnnSub} result={curRes1.vAnn} color="blue" diagramType="ANNULAR" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'casingOD', 'casingDepth']} onShowExplanation={() => setExplanationModal({ title: "V1 Annular OH", content: `حساب حجم الفراغ الحلقي في الحفرة المفتوحة لكافة قطع الكيسينق من السطح حتى عمق الحذاء.`, range: `0 ft → ${s1TotalDepth} ft`, formula: `V = \\sum \\frac{(Hole^2 - OD^2)}{1029.4} \\times Length \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <Step num="2" title="V2 Rat Hole" law="V = \frac{Hole^2}{1029.4} \times L \times Exc" substituted={curRes1.vRatSub} result={curRes1.vRat} color="indigo" diagramType="RAT_HOLE" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'ratHole']} onShowExplanation={() => setExplanationModal({ title: "V2 Rat Hole", content: `حساب حجم الحفرة المفتوحة أسفل الكيسينق.`, range: `${s1TotalDepth} ft → ${(parseFloat(s1TotalDepth) + parseFloat(s1RatLen)).toFixed(0)} ft`, formula: `V = \\frac{Hole^2}{1029.4} \\times L_{Rat} \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <Step num="3" title="V3 Shoe Track" law="V = \frac{ID_{last}^2}{1029.4} \times L" substituted={curRes1.vShoeSub} result={curRes1.vShoe} color="amber" diagramType="SHOE_TRACK" sectionType={activeTab} diagramData={diagramData} activeInputs={['casingID', 'shoeTrack']} onShowExplanation={() => setExplanationModal({ title: "V3 Shoe Track", content: `حساب حجم السيمنت المتبقي داخل الكيسينق في منطقة الـ Shoe Track.`, range: `${(parseFloat(s1TotalDepth) - parseFloat(s1ShoeLen)).toFixed(0)} ft → ${s1TotalDepth} ft`, formula: `V = \\frac{ID_{last}^2}{1029.4} \\times L_{Shoe}` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للكيسنج بدلاً من الداخلي (ID) في الحساب التقريبي" />
            <Step num="4" title="Displacement" law="Disp = \sum \frac{ID^2}{1029.4} \times L_{eff}" substituted={curRes1.dispSub} result={curRes1.disp} color="emerald" note={`محسوبة حتى عمق ${curRes1.floatCollar} قدم.`} diagramType="DISPLACEMENT" sectionType={activeTab} diagramData={diagramData} activeInputs={['casingID', 'casingDepth', 'shoeTrack']} onShowExplanation={() => setExplanationModal({ title: "Displacement", content: `حساب حجم سائل الإزاحة المطلوب لضخ السيمنت حتى الفلوت كولار.`, range: `0 ft → ${(parseFloat(s1TotalDepth) - parseFloat(s1ShoeLen)).toFixed(0)} ft`, formula: `Disp = \\sum \\frac{ID^2}{1029.4} \\times L_{eff}` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للكيسنج بدلاً من الداخلي (ID) في الحساب التقريبي" />
          </>
        ) : activeTab === 'SEC2' ? (
          <>
            <Step num="1" title="V1 Cased (Overlap)" law="V = \sum \frac{(PrevID^2 - OD^2)}{1029.4} \times L" substituted={curRes2.vCasedSub} result={curRes2.vCased} color="blue" diagramType="ANNULAR_CASED" sectionType={activeTab} diagramData={diagramData} activeInputs={['prevID', 'casingOD', 'prevShoe']} onShowExplanation={() => setExplanationModal({ title: "V1 Cased (Overlap)", content: `حساب حجم السيمنت في منطقة التداخل بين الكيسينق السابق والحالي.`, range: `0 ft → ${s2PrevShoeVal} ft`, formula: `V = \\sum \\frac{(PrevID^2 - OD^2)}{1029.4} \\times L_{Overlap}` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (Prev OD) بدلاً من الداخلي (Prev ID) للكيسنج السابق في الحساب التقريبي" />
            <Step num="2" title="V2 Lead (Open Hole)" law="V = \sum \frac{(Hole^2 - OD^2)}{1029.4} \times L \times Exc" substituted={curRes2.vLeadSub} result={curRes2.vLead} color="indigo" diagramType="ANNULAR_LEAD_OH" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'casingOD', 'totalDepth', 'tailInterval', 'prevShoe']} onShowExplanation={() => setExplanationModal({ title: "V2 Lead (OH)", content: `حساب حجم السيمنت (Lead) في الحفرة المفتوحة من حذاء الكيسينق السابق حتى بداية منطقة الذيل.`, range: `${s2PrevShoeVal} ft → ${(parseFloat(s2TotalDepth) - parseFloat(s2TailInterval)).toFixed(0)} ft`, formula: `V = \\sum \\frac{(Hole^2 - OD^2)}{1029.4} \\times Length \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <Step num="3" title="V3 Tail (Open Hole)" law="V = \sum \frac{(Hole^2 - OD^2)}{1029.4} \times L \times Exc" substituted={curRes2.vTailSub} result={curRes2.vTail} color="emerald" diagramType="ANNULAR_TAIL_OH" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'casingOD', 'tailInterval']} onShowExplanation={() => setExplanationModal({ title: "V3 Tail (OH)", content: `حساب حجم السيمنت (Tail) في الحفرة المفتوحة.`, range: `${(parseFloat(s2TotalDepth) - parseFloat(s2TailInterval)).toFixed(0)} ft → ${s2TotalDepth} ft`, formula: `V = \\sum \\frac{(Hole^2 - OD^2)}{1029.4} \\times L_{Tail} \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <Step num="4" title="V4 Rat Hole" law="V = \frac{Hole^2}{1029.4} \times L \times Exc" substituted={curRes2.vRatSub} result={curRes2.vRat} color="slate" diagramType="RAT_HOLE" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'ratHole']} onShowExplanation={() => setExplanationModal({ title: "V4 Rat Hole", content: `حساب حجم الحفرة المفتوحة أسفل الكيسينق.`, range: `${s2TotalDepth} ft → ${(parseFloat(s2TotalDepth) + parseFloat(s2RatLen)).toFixed(0)} ft`, formula: `V = \\frac{Hole^2}{1029.4} \\times L_{Rat} \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <Step num="5" title="V5 Shoe Track" law="V = \frac{ID_{last}^2}{1029.4} \times L" substituted={curRes2.vShoeSub} result={curRes2.vShoe} color="amber" diagramType="SHOE_TRACK" sectionType={activeTab} diagramData={diagramData} activeInputs={['casingID', 'shoeTrack']} onShowExplanation={() => setExplanationModal({ title: "V5 Shoe Track", content: `حساب حجم السيمنت المتبقي داخل الكيسينق.`, range: `${(parseFloat(s2TotalDepth) - parseFloat(s2ShoeLen)).toFixed(0)} ft → ${s2TotalDepth} ft`, formula: `V = \\frac{ID_{last}^2}{1029.4} \\times L_{Shoe}` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للكيسنج بدلاً من الداخلي (ID) في الحساب التقريبي" />
            <Step num="6" title="Displacement (إلى Float Collar)" law="Disp = \sum \frac{ID^2}{1029.4} \times L_{eff}" substituted={curRes2.dispSub} result={curRes2.disp} color="emerald" note={`محسوبة حتى عمق ${curRes2.floatCollar} قدم.`} diagramType="DISPLACEMENT" sectionType={activeTab} diagramData={diagramData} activeInputs={['casingID', 'totalDepth', 'shoeTrack']} onShowExplanation={() => setExplanationModal({ title: "Displacement", content: `حساب حجم سائل الإزاحة من السطح حتى الفلوت كولار.`, range: `0 ft → ${(parseFloat(s2TotalDepth) - parseFloat(s2ShoeLen)).toFixed(0)} ft`, formula: `Disp = \\sum \\frac{ID^2}{1029.4} \\times L_{eff}` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للكيسنج بدلاً من الداخلي (ID) في الحساب التقريبي" />
          </>
        ) : activeTab === 'SEC3' ? (
          <>
            <Step num="1" title="V1 Cased Hole (Overlap)" law="V = \sum \frac{(PrevID^2 - OD^2)}{1029.4} \times L" substituted={curRes3.vCasedSub} result={curRes3.vCased} color="blue" diagramType="ANNULAR_STAGE2_CASED" sectionType={activeTab} diagramData={diagramData} activeInputs={['prevID', 'casingOD', 'prevShoe']} onShowExplanation={() => setExplanationModal({ title: "V1 Cased Hole (Overlap)", content: `حساب حجم السيمنت للمرحلة الثانية في منطقة التداخل.`, range: `0 ft → ${s3PrevShoeVal} ft`, formula: `V = \\sum \\frac{(PrevID^2 - OD^2)}{1029.4} \\times L_{Overlap}` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (Prev OD) بدلاً من الداخلي (Prev ID) للكيسنج السابق في الحساب التقريبي" />
            <Step num="2" title="V2 Stage 2 (Open Hole)" law="V = \sum \frac{(Hole^2 - OD^2)}{1029.4} \times L \times Exc" substituted={curRes3.vStage2OHSub} result={curRes3.vStage2OH} color="indigo" diagramType="ANNULAR_STAGE2_OH" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'casingOD', 'dvToolDepth', 'prevShoe']} onShowExplanation={() => setExplanationModal({ title: "V2 Stage 2 (OH)", content: `حساب حجم السيمنت للمرحلة الثانية في الحفرة المفتوحة حتى الـ DV Tool.`, range: `${s3PrevShoeVal} ft → ${s3DvTool} ft`, formula: `V = \\sum \\frac{(Hole^2 - OD^2)}{1029.4} \\times Length \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <Step num="3" title="V3 Stage 1 Lead (Open Hole)" law="V = \sum \frac{(Hole^2 - OD^2)}{1029.4} \times L \times Exc" substituted={curRes3.vLeadSub} result={curRes3.vLead} color="purple" diagramType="ANNULAR_STAGE1_LEAD" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'casingOD', 'totalDepth', 'tailInterval', 'dvToolDepth']} onShowExplanation={() => setExplanationModal({ title: "V3 Stage 1 Lead (OH)", content: `حساب حجم السيمنت (Lead) للمرحلة الأولى من الـ DV Tool حتى بداية منطقة الذيل.`, range: `${s3DvTool} ft → ${(parseFloat(s3TotalDepth) - parseFloat(s3TailInterval)).toFixed(0)} ft`, formula: `V = \\sum \\frac{(Hole^2 - OD^2)}{1029.4} \\times Length \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <Step num="4" title="V4 Tail (Open Hole)" law="V = \sum \frac{(Hole^2 - OD^2)}{1029.4} \times L \times Exc" substituted={curRes3.vTailSub} result={curRes3.vTail} color="emerald" diagramType="ANNULAR_STAGE1_TAIL" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'casingOD', 'tailInterval']} onShowExplanation={() => setExplanationModal({ title: "V4 Tail (OH)", content: `حساب حجم السيمنت (Tail) للمرحلة الأولى.`, range: `${(parseFloat(s3TotalDepth) - parseFloat(s3TailInterval)).toFixed(0)} ft → ${s3TotalDepth} ft`, formula: `V = \\sum \\frac{(Hole^2 - OD^2)}{1029.4} \\times L_{Tail} \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <Step num="5" title="V5 Rat Hole" law="V = \frac{Hole^2}{1029.4} \times L \times Exc" substituted={curRes3.vRatSub} result={curRes3.vRat} color="slate" diagramType="RAT_HOLE" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'ratHole']} onShowExplanation={() => setExplanationModal({ title: "V5 Rat Hole", content: `حساب حجم الحفرة المفتوحة أسفل الكيسينق.`, range: `${s3TotalDepth} ft → ${(parseFloat(s3TotalDepth) + parseFloat(s3RatLen)).toFixed(0)} ft`, formula: `V = \\frac{Hole^2}{1029.4} \\times L_{Rat} \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <Step num="6" title="V6 Shoe Track" law="V = \frac{ID_{last}^2}{1029.4} \times L" substituted={curRes3.vShoeSub} result={curRes3.vShoe} color="amber" diagramType="SHOE_TRACK" sectionType={activeTab} diagramData={diagramData} activeInputs={['casingID', 'shoeTrack']} onShowExplanation={() => setExplanationModal({ title: "V6 Shoe Track", content: `حساب حجم السيمنت المتبقي داخل الكيسينق.`, range: `${(parseFloat(s3TotalDepth) - parseFloat(s3ShoeLen)).toFixed(0)} ft → ${s3TotalDepth} ft`, formula: `V = \\frac{ID_{last}^2}{1029.4} \\times L_{Shoe}` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للكيسنج بدلاً من الداخلي (ID) في الحساب التقريبي" />
            <Step num="7" title="Disp Stage 1 (إلى Float Collar)" law="Disp_1 = \sum \frac{ID^2}{1029.4} \times L_{eff}" substituted={curRes3.disp1Sub} result={curRes3.disp1} color="emerald" note={`محسوبة حتى عمق ${curRes3.floatCollar} قدم.`} diagramType="DISPLACEMENT_STAGE1" sectionType={activeTab} diagramData={diagramData} activeInputs={['casingID', 'totalDepth', 'shoeTrack']} onShowExplanation={() => setExplanationModal({ title: "Disp Stage 1", content: `حساب حجم إزاحة المرحلة الأولى حتى الفلوت كولار.`, range: `0 ft → ${(parseFloat(s3TotalDepth) - parseFloat(s3ShoeLen)).toFixed(0)} ft`, formula: `Disp_1 = \\sum \\frac{ID^2}{1029.4} \\times L_{eff}` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للكيسنج بدلاً من الداخلي (ID) في الحساب التقريبي" />
            <Step num="8" title="Disp Stage 2 (إلى DV Tool)" law="Disp_2 = \sum \frac{ID^2}{1029.4} \times L_{eff}" substituted={curRes3.disp2Sub} result={curRes3.disp2} color="teal" note={`محسوبة حتى عمق ${s3DvTool} قدم.`} diagramType="DISPLACEMENT_STAGE2" sectionType={activeTab} diagramData={diagramData} activeInputs={['casingID', 'dvToolDepth']} onShowExplanation={() => setExplanationModal({ title: "Disp Stage 2", content: `حساب حجم إزاحة المرحلة الثانية حتى الـ DV Tool.`, range: `0 ft → ${s3DvTool} ft`, formula: `Disp_2 = \\sum \\frac{ID^2}{1029.4} \\times L_{eff}` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للكيسنج بدلاً من الداخلي (ID) في الحساب التقريبي" />
          </>
        ) : (
          <>
            <Step num="1" title="V1 Overlap (Liner Hanger)" law="V = \sum \frac{(PrevID^2 - OD^2)}{1029.4} \times L" substituted={curRes4.vCasedSub} result={curRes4.vCased} color="blue" diagramType="ANNULAR_CASED" sectionType={activeTab} diagramData={diagramData} activeInputs={['prevCasingID', 'casingOD', 'linerTopDepth', 'prevCasingDepth']} onShowExplanation={() => setExplanationModal({ title: "V1 Overlap (Cased)", content: `حساب حجم السيمنت في منطقة التداخل تحت مكان التعليق (Hanger) وحتى حذاء الكيسينق السابق.`, range: `${s4LinerTop} ft → ${s4PrevShoeVal} ft`, formula: `V = \\sum \\frac{(PrevID^2 - OD^2)}{1029.4} \\times L_{Overlap}` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (Prev OD) بدلاً من الداخلي (Prev ID) للكيسنج السابق في الحساب التقريبي" />
            <Step num="2" title="V2 Lead (Open Hole)" law="V = \sum \frac{(Hole^2 - OD^2)}{1029.4} \times L \times Exc" substituted={curRes4.vLeadSub} result={curRes4.vLead} color="indigo" diagramType="ANNULAR_LEAD_OH" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'casingOD', 'totalDepth', 'tailInterval', 'prevShoe']} onShowExplanation={() => setExplanationModal({ title: "V2 Lead (OH)", content: `حساب حجم السيمنت (Lead) في الحفرة المفتوحة من حذاء الكيسينق السابق حتى بداية منطقة الذيل.`, range: `${s4PrevShoeVal} ft → ${(parseFloat(s4TotalDepth) - parseFloat(s4TailInterval)).toFixed(0)} ft`, formula: `V = \\sum \\frac{(Hole^2 - OD^2)}{1029.4} \\times Length \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <Step num="3" title="V3 Tail (Open Hole)" law="V = \sum \frac{(Hole^2 - OD^2)}{1029.4} \times L \times Exc" substituted={curRes4.vTailSub} result={curRes4.vTail} color="emerald" diagramType="ANNULAR_TAIL_OH" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'casingOD', 'tailInterval']} onShowExplanation={() => setExplanationModal({ title: "V3 Tail (OH)", content: `حساب حجم السيمنت (Tail) في الحفرة المفتوحة.`, range: `${(parseFloat(s4TotalDepth) - parseFloat(s4TailInterval)).toFixed(0)} ft → ${s4TotalDepth} ft`, formula: `V = \\sum \\frac{(Hole^2 - OD^2)}{1029.4} \\times L_{Tail} \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <Step num="4" title="V4 Rat Hole" law="V = \frac{Hole^2}{1029.4} \times L \times Exc" substituted={curRes4.vRatSub} result={curRes4.vRat} color="slate" diagramType="RAT_HOLE" sectionType={activeTab} diagramData={diagramData} activeInputs={['holeSize', 'ratHole']} onShowExplanation={() => setExplanationModal({ title: "V4 Rat Hole", content: `حساب حجم الحفرة المفتوحة أسفل اللاينر.`, range: `${s4TotalDepth} ft → ${(parseFloat(s4TotalDepth) + parseFloat(s4RatLen)).toFixed(0)} ft`, formula: `V = \\frac{Hole^2}{1029.4} \\times L_{Rat} \\times \\left(1 + \\frac{Excess}{100}\\right)` })} isApproximate={isApproximate} diffNote="لا يوجد اختلاف" />
            <Step num="5" title="V5 Shoe Track" law="V = \frac{ID_{last}^2}{1029.4} \times L" substituted={curRes4.vShoeSub} result={curRes4.vShoe} color="amber" diagramType="SHOE_TRACK" sectionType={activeTab} diagramData={diagramData} activeInputs={['casingID', 'shoeTrack']} onShowExplanation={() => setExplanationModal({ title: "V5 Shoe Track", content: `حساب حجم السيمنت المتبقي داخل اللاينر.`, range: `${(parseFloat(s4TotalDepth) - parseFloat(s4ShoeLen)).toFixed(0)} ft → ${s4TotalDepth} ft`, formula: `V = \\frac{ID_{last}^2}{1029.4} \\times L_{Shoe}` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للاينر بدلاً من الداخلي (ID) في الحساب التقريبي" />
            <Step num="6" title="Displacement (إلى Float Collar)" law="Disp = \sum \frac{ID^2}{1029.4} \times L_{eff}" substituted={curRes4.dispSub} result={curRes4.disp} color="emerald" note={`محسوبة من السطح عبر DP (قطر ${s4DP_ID} إنش) حتى عمق ${curRes4.floatCollar} قدم.`} diagramType="DISPLACEMENT" sectionType={activeTab} diagramData={diagramData} activeInputs={['casingID', 'totalDepth', 'shoeTrack']} onShowExplanation={() => setExplanationModal({ title: "Displacement", content: `حساب حجم سائل الإزاحة المطلوب. يتضمن حجم الـ Drill Pipe من السطح حتى قمة اللاينر، مضافاً إليه حجم اللاينر من القمة حتى الفلوت كولار.`, range: `0 ft → ${(parseFloat(s4TotalDepth) - parseFloat(s4ShoeLen)).toFixed(0)} ft`, formula: `Disp = \\left(\\frac{DP_{ID}^2}{1029.4} \\times LinerTop\\right) + \\sum \\left(\\frac{Liner_{ID}^2}{1029.4} \\times Length\\right)` })} isApproximate={isApproximate} diffNote="تم استخدام القطر الخارجي (OD) للاينر بدلاً من الداخلي (ID)، واستخدام القطر الخارجي 5.0&quot; للـ DP بدلاً من الداخلي في الحساب التقريبي" />
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
                      <MathFormula formula={explanationModal.formula} className="text-blue-400 text-sm" />
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

const SegmentRow: React.FC<{ idx: number, seg: Segment, variant?: 'previous' | 'current' | 'liner', onSelectCasing: (od: string, id_val: string) => void, onUpdate: (f: keyof Segment, v: string) => void, onRemove: () => void }> = ({ idx, seg, variant = 'current', onSelectCasing, onUpdate, onRemove }) => (
  <div className="bg-slate-800/30 p-5 rounded-3xl border border-slate-800 relative group text-right">
     <div className="flex justify-between items-center mb-3">
        <button onClick={onRemove} className="text-slate-600 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
        <span className="text-[9px] font-black text-slate-500 uppercase italic">{variant === 'previous' ? `كيسينق سابق - قطعة رقم ${idx + 1}` : variant === 'liner' ? `لاينر حالي - قطعة رقم ${idx + 1}` : `كيسينق حالي - قطعة رقم ${idx + 1}`}</span>
     </div>
     <div className="grid grid-cols-2 gap-3 mb-3">
        <Input label="From (ft)" val={seg.from} set={(v) => onUpdate('from', v)} />
        <Input label="To (ft)" val={seg.to} set={(v) => onUpdate('to', v)} />
     </div>
     <div className="mb-3">
        <CasingSelector
          label={variant === 'previous' ? `الكيسينق السابق (قطعة ${idx + 1})` : variant === 'liner' ? `اللاينر الحالي (قطعة ${idx + 1})` : `الكيسينق الحالي (قطعة ${idx + 1})`}
          currentOD={seg.od}
          currentID={seg.id_val}
          onSelect={(od, id_val) => onSelectCasing(od, id_val)}
          variant={variant}
          compact
        />
     </div>
     <div className="grid grid-cols-2 gap-3">
        <Input label="Csg OD (in)" val={seg.od} set={(v) => onUpdate('od', v)} />
        <Input label="Csg ID (in)" val={seg.id_val} set={(v) => onUpdate('id_val', v)} />
     </div>
  </div>
);

interface StepProps { 
  num: string; 
  title: string; 
  law: string; 
  substituted: string; 
  result: number; 
  color: string; 
  note?: string; 
  diagramType?: 'ANNULAR' | 'SHOE_TRACK' | 'RAT_HOLE' | 'DISPLACEMENT' | 'ANNULAR_STAGE1' | 'ANNULAR_STAGE2' | 'DISPLACEMENT_STAGE1' | 'DISPLACEMENT_STAGE2' | 'ANNULAR_CASED' | 'ANNULAR_LEAD_OH' | 'ANNULAR_TAIL_OH' | 'ANNULAR_STAGE2_CASED' | 'ANNULAR_STAGE2_OH' | 'ANNULAR_STAGE1_LEAD' | 'ANNULAR_STAGE1_TAIL'; 
  sectionType?: 'SEC1' | 'SEC2' | 'SEC3' | 'SEC4';
  diagramData?: any;
  activeInputs?: string[];
  onShowExplanation?: () => void;
  isApproximate?: boolean;
  diffNote?: string;
}
const Step: React.FC<StepProps> = ({ num, title, law, substituted, result, color, note, diagramType, sectionType, diagramData, activeInputs, onShowExplanation, isApproximate, diffNote }) => {
  const colorMap: Record<string, string> = { blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20', indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20', emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20', purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20', teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20' };
  const hexColorMap: Record<string, string> = { blue: '#3b82f6', indigo: '#6366f1', amber: '#f59e0b', emerald: '#10b981', slate: '#64748b', purple: '#a855f7', teal: '#14b8a6' };
  const activeColorClass = colorMap[color] || colorMap.blue;
  const hexColor = hexColorMap[color] || hexColorMap.blue;
  
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
           <h3 className="text-xs font-black text-white italic uppercase break-words leading-tight">{title}</h3>
           {onShowExplanation && (
             <button onClick={onShowExplanation} className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-blue-400">
               <Eye className="w-3.5 h-3.5" />
             </button>
           )}
         </div>
         <CheckCircle2 className={`w-3.5 h-3.5 ${result > 0 ? 'text-emerald-500' : 'text-slate-800'}`} />
      </div>
      
      <div className="flex flex-col gap-2 items-center">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="bg-black/20 p-3 rounded-2xl border border-slate-800/50">
            <span className="block text-[9px] text-slate-400 font-bold mb-1 tracking-wide text-left" dir="ltr">Formula</span>
            <MathFormula formula={law} className="text-slate-200 text-sm py-1" />
          </div>
          {result > 0 && (
            <div className="bg-blue-500/5 p-3 rounded-2xl border border-blue-500/10">
              <span className="block text-[9px] text-blue-400/80 font-bold mb-1 tracking-wide text-left" dir="ltr">Substitution</span>
              <MathFormula formula={substituted} className="text-blue-300 text-sm py-1" />
            </div>
          )}
          {note && result > 0 && (<p className="text-[10px] text-amber-500/80 font-bold italic px-1 col-span-full">{note}</p>)}
        </div>
        
        {diagramType && sectionType && diagramData && (
          <div className="w-full">
            <SectionDiagram 
              {...diagramData}
              type={sectionType}
              highlight={diagramType}
              activeInputs={activeInputs}
              isMini={true}
            />
          </div>
        )}
      </div>

      <div className={`flex justify-between items-center px-4 py-2 rounded-2xl border ${activeColorClass}`}>
        <span className="text-[8px] font-black uppercase tracking-widest italic">النتيجة الفرعية</span>
        <span className="text-lg font-black">{result.toFixed(2)} <span className="text-[9px]">bbl</span></span>
      </div>
    </div>
  );
};

export default CompleteSectionCalc;
