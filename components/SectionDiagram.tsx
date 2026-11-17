import React, { useId } from 'react';

interface SectionDiagramProps {
  type: 'SEC1' | 'SEC2' | 'SEC3' | 'SEC4';
  holeSize: number;
  casingOD: number;
  casingID: number;
  casingDepth: number;
  holeDepth: number;
  shoeTrack: number;
  ratHole: number;
  displacement: number;
  floatCollarDepth: number;
  annularVolume: number;
  excess?: number;
  tailDepth?: number;
  dvToolDepth?: number;
  prevCasingDepth?: number;
  prevCasingOD?: number;
  prevCasingID?: number;
  linerTopDepth?: number;
  leadDepth?: number;
  mudDens?: number;
  leadDens?: number;
  tailDens?: number;
  dpPoint?: 'SHOE' | 'DV';
  highlight?: 'ANNULAR' | 'SHOE_TRACK' | 'RAT_HOLE' | 'DISPLACEMENT' | 'ANNULAR_STAGE1' | 'ANNULAR_STAGE2' | 'DISPLACEMENT_STAGE1' | 'DISPLACEMENT_STAGE2' | 'ANNULAR_CASED' | 'ANNULAR_LEAD_OH' | 'ANNULAR_TAIL_OH' | 'ANNULAR_STAGE2_CASED' | 'ANNULAR_STAGE2_OH' | 'ANNULAR_STAGE1_LEAD' | 'ANNULAR_STAGE1_TAIL' | 'DIFF_PRESSURE' | 'HP_ANN' | 'HP_CSG';
  activeInputs?: string[];
  isMini?: boolean;
}

const SectionDiagram: React.FC<SectionDiagramProps> = ({
  type,
  holeSize,
  casingOD,
  casingID,
  casingDepth,
  holeDepth,
  shoeTrack,
  ratHole,
  displacement,
  floatCollarDepth,
  annularVolume,
  excess,
  tailDepth,
  dvToolDepth,
  prevCasingDepth,
  prevCasingOD,
  prevCasingID,
  linerTopDepth,
  leadDepth,
  mudDens,
  leadDens,
  tailDens,
  dpPoint = 'SHOE',
  highlight,
  activeInputs = [],
  isMini = false
}) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  // --- Standard Colors ---
  const HOLE_COLOR = '#ef4444'; // Red
  const CASING_COLOR = '#3b82f6'; // Blue
  const CEMENT_COLOR = '#94a3b8'; // Slate/Grey for default cement
  
  // --- Differential Pressure Fluid Colors ---
  const FLUID_MUD = '#64748b';  // Slate 500
  const FLUID_LEAD = '#3b82f6'; // Blue 500
  const FLUID_TAIL = '#f59e0b'; // Amber 500

  // Helper to convert decimal to fraction for common oilfield sizes
  const toFraction = (val: number) => {
    const whole = Math.floor(val);
    const frac = val - whole;
    if (frac === 0) return `${whole}`;
    
    // Common oilfield fractions
    if (Math.abs(frac - 0.625) < 0.01) return `${whole} 5/8`;
    if (Math.abs(frac - 0.375) < 0.01) return `${whole} 3/8`;
    if (Math.abs(frac - 0.5) < 0.01) return `${whole} 1/2`;
    if (Math.abs(frac - 0.25) < 0.01) return `${whole} 1/4`;
    if (Math.abs(frac - 0.75) < 0.01) return `${whole} 3/4`;
    if (Math.abs(frac - 0.125) < 0.01) return `${whole} 1/8`;
    if (Math.abs(frac - 0.875) < 0.01) return `${whole} 7/8`;
    
    return val.toString();
  };

  // Schematic heights (original 400 width preserved, surfaceY given top room so top text isn't clipped)
  const svgWidth = 400; 
  const svgHeight = isMini ? 330 : 390; 
  
  const surfaceY = isMini ? 18 : 22;
  const bottomY = svgHeight - (isMini ? 10 : 15);
  
  // We'll use a schematic scale where the bottom part is more detailed
  const casingEndY = bottomY - (isMini ? 70 : 80); // Shoe depth
  const holeEndY = bottomY - (isMini ? 5 : 10);   // Total depth
  
  // Consistent Depth-to-Y scaling function
  const getDepthY = (depth: number): number => {
    if (!depth || depth <= 0) return surfaceY;
    if (depth >= casingDepth) {
      // Scale within Rat Hole (casingDepth to holeDepth)
      const ratHoleDepth = Math.max(1, holeDepth - casingDepth);
      const progress = Math.min(1, (depth - casingDepth) / (ratHoleDepth || 1));
      return casingEndY + progress * (holeEndY - casingEndY);
    }
    // Scale within Casing (0 to casingDepth)
    // If it's a liner (SEC4), we should account for where it starts to make it longer
    if (type === 'SEC4' && linerTopDepth) {
      if (depth < linerTopDepth) {
        // Upper part takes 25% of the total casing height
        const upperSpace = (casingEndY - surfaceY) * 0.25;
        return surfaceY + (depth / linerTopDepth) * upperSpace;
      } else {
        // Liner area takes 75% of the space to make it "longer" and clearer
        const upperSpace = (casingEndY - surfaceY) * 0.25;
        const linerSpace = (casingEndY - surfaceY) * 0.75;
        const linerDepth = Math.max(1, casingDepth - linerTopDepth);
        const progress = (depth - linerTopDepth) / linerDepth;
        return surfaceY + upperSpace + progress * linerSpace;
      }
    }
    return surfaceY + (depth / (casingDepth || 1)) * (casingEndY - surfaceY);
  };

  const linerTopY = (type === 'SEC4' && linerTopDepth) ? getDepthY(linerTopDepth) : surfaceY;
  let floatCollarY = getDepthY(floatCollarDepth); // Float collar
  
  // Ensure minimum visual height for Shoe Track
  const minShoeTrackHeight = isMini ? 28 : 40;
  if (casingEndY - floatCollarY < minShoeTrackHeight && shoeTrack > 0) {
    floatCollarY = casingEndY - minShoeTrackHeight;
  }

  // DV Tool Y position
  const dvToolY = (dvToolDepth !== undefined && dvToolDepth !== null) ? getDepthY(dvToolDepth) : null;
  const tailY = (tailDepth !== undefined && tailDepth !== null) ? getDepthY(tailDepth) : null;
  const leadTopY = leadDepth !== undefined ? getDepthY(leadDepth) : null;
  
  // Zigzag hole path generator - Coordinate-based for perfect alignment between segments
  const generateZigzagPath = (x: number, startY: number, endY: number, side: 'left' | 'right') => {
    const height = Math.abs(endY - startY);
    if (height < 1) return `M ${x} ${startY} L ${x} ${endY}`;
    
    let path = `M ${x} ${startY}`;
    const stepHeight = 4; // Smoother segments
    const steps = Math.max(1, Math.ceil(height / stepHeight));
    const actualStepHeight = (endY - startY) / steps;
    const amplitude = 3; // Slightly more subtle
    const period = 15; // Tighter zigzag
    
    for (let i = 1; i <= steps; i++) {
      const currY = startY + i * actualStepHeight;
      // Use triangle wave based on absolute Y for consistent phase
      const phase = (currY % period) / period;
      const triangle = phase < 0.25 ? phase * 4 : 
                       phase < 0.75 ? 2 - phase * 4 : 
                       phase * 4 - 4;
      const offset = triangle * amplitude * (side === 'left' ? 1 : -1);
      path += ` L ${x + offset} ${currY}`;
    }
    return path;
  };

  // Adjust widths based on section type
  const holeWidth = (type === 'SEC1' ? 150 : type === 'SEC2' ? 125 : 100) * (isMini ? 1.15 : 1);
  const casingWidth = (type === 'SEC1' ? 96 : type === 'SEC2' ? 78 : 60) * (isMini ? 1.15 : 1);
  const prevCasingWidth = (type === 'SEC1' ? holeWidth : type === 'SEC2' ? 160 : 136) * (isMini ? 1.1 : 1);
  const centerX = 200; // Centered for better space utilization
  
  const leftHoleX = centerX - holeWidth / 2;
  const rightHoleX = centerX + holeWidth / 2;
  const leftCasingX = centerX - casingWidth / 2;
  const rightCasingX = centerX + casingWidth / 2;
  
  const leftPrevCasingX = centerX - prevCasingWidth / 2;
  const rightPrevCasingX = centerX + prevCasingWidth / 2;
  const prevCasingEndY = type === 'SEC1' ? surfaceY : (prevCasingDepth ? getDepthY(prevCasingDepth) : surfaceY);

  // Split hole paths into Annulus and Rat Hole segments
  const leftHoleAnnulusPath = generateZigzagPath(leftHoleX, prevCasingEndY, casingEndY, 'left');
  const rightHoleAnnulusPath = generateZigzagPath(rightHoleX, casingEndY, prevCasingEndY, 'right');
  
  const leftHoleRatPath = generateZigzagPath(leftHoleX, casingEndY, holeEndY, 'left');
  const rightHoleRatPath = generateZigzagPath(rightHoleX, holeEndY, casingEndY, 'right');

  // Full hole boundary for stroke only
  const leftHoleFullPath = generateZigzagPath(leftHoleX, prevCasingEndY, holeEndY, 'left');
  const rightHoleFullPath = generateZigzagPath(rightHoleX, holeEndY, prevCasingEndY, 'right');
  
  // Cement path (Annulus) - Stops at Casing Shoe (casingEndY)
  // For Liner (SEC4), we start from linerTopY in the upper annulus
  const cementStartY = type === 'SEC4' ? linerTopY : surfaceY;
  const cementPath = `
    M ${leftPrevCasingX} ${cementStartY}
    L ${leftPrevCasingX} ${prevCasingEndY}
    ${leftHoleAnnulusPath.replace('M', 'L')}
    ${rightHoleAnnulusPath.replace('M', 'L')}
    L ${rightPrevCasingX} ${prevCasingEndY}
    L ${rightPrevCasingX} ${cementStartY}
    L ${rightCasingX} ${linerTopY}
    L ${rightCasingX} ${casingEndY}
    L ${leftCasingX} ${casingEndY}
    L ${leftCasingX} ${linerTopY}
    Z
  `;

  // Full annulus path (Surface to Shoe) - For Hydrostatic visualization
  const fullAnnulusPath = `
    M ${leftPrevCasingX} ${surfaceY}
    L ${leftPrevCasingX} ${prevCasingEndY}
    ${leftHoleAnnulusPath.replace('M', 'L')}
    ${rightHoleAnnulusPath.replace('M', 'L')}
    L ${rightPrevCasingX} ${prevCasingEndY}
    L ${rightPrevCasingX} ${surfaceY}
    L ${rightCasingX} ${linerTopY}
    L ${rightCasingX} ${casingEndY}
    L ${leftCasingX} ${casingEndY}
    L ${leftCasingX} ${linerTopY}
    Z
  `;

  // Internal Fill Path (Mud/Displacement)
  // For SEC4, internal fill goes through the 5" Drill Pipe down to the liner top, then through liner
  const internalFillPath = type === 'SEC4' 
    ? `M ${centerX - 6} ${surfaceY} 
       L ${centerX + 6} ${surfaceY} 
       L ${centerX + 6} ${linerTopY} 
       L ${rightCasingX - 2} ${linerTopY} 
       L ${rightCasingX - 2} ${casingEndY} 
       L ${leftCasingX + 2} ${casingEndY} 
       L ${leftCasingX + 2} ${linerTopY} 
       L ${centerX - 6} ${linerTopY} Z`
    : `M ${leftCasingX} ${surfaceY} 
       L ${rightCasingX} ${surfaceY} 
       L ${rightCasingX} ${casingEndY} 
       L ${leftCasingX} ${casingEndY} Z`;

  const dispFillPath = type === 'SEC4'
    ? `M ${centerX - 6} ${surfaceY} 
       L ${centerX + 6} ${surfaceY} 
       L ${centerX + 6} ${linerTopY} 
       L ${rightCasingX - 2} ${linerTopY} 
       L ${rightCasingX - 2} ${highlight === 'DISPLACEMENT_STAGE2' && dvToolY ? dvToolY : floatCollarY} 
       L ${leftCasingX + 2} ${highlight === 'DISPLACEMENT_STAGE2' && dvToolY ? dvToolY : floatCollarY} 
       L ${leftCasingX + 2} ${linerTopY} 
       L ${centerX - 6} ${linerTopY} Z`
    : `M ${leftCasingX + 2} ${surfaceY} 
       L ${rightCasingX - 2} ${surfaceY} 
       L ${rightCasingX - 2} ${highlight === 'DISPLACEMENT_STAGE2' && dvToolY ? dvToolY : floatCollarY} 
       L ${leftCasingX + 2} ${highlight === 'DISPLACEMENT_STAGE2' && dvToolY ? dvToolY : floatCollarY} Z`;

  // Rat Hole Path - Follows zigzag from Shoe to TD
  const ratHolePath = `
    M ${leftHoleX} ${casingEndY}
    ${leftHoleRatPath.replace('M', 'L')}
    ${rightHoleRatPath.replace('M', 'L')}
    L ${rightHoleX} ${casingEndY}
    Z
  `;

  const isHighlighted = (part: string) => {
    if (!highlight) return false;
    if (highlight === part) return true;
    if (highlight === 'DIFF_PRESSURE') return true;
    if (highlight === 'HP_ANN' && part === 'ANNULAR') return true;
    if (highlight === 'HP_CSG' && (part === 'DISPLACEMENT' || part === 'SHOE_TRACK')) return true;
    if (part === 'ANNULAR' && (
      highlight.startsWith('ANNULAR_')
    )) return true;
    if (part === 'DISPLACEMENT' && (highlight === 'DISPLACEMENT_STAGE1' || highlight === 'DISPLACEMENT_STAGE2')) return true;
    return false;
  };

  const fadeOpacity = (part: string) => 1; // No fading as requested
  
  // Dynamic colors based on highlight type to match steps
  const getHighlightColor = () => {
    switch (highlight) {
      case 'ANNULAR':
      case 'ANNULAR_STAGE1':
      case 'ANNULAR_STAGE2':
      case 'ANNULAR_CASED':
      case 'ANNULAR_LEAD_OH':
      case 'ANNULAR_TAIL_OH':
      case 'ANNULAR_STAGE2_CASED':
      case 'ANNULAR_STAGE2_OH':
      case 'ANNULAR_STAGE1_LEAD':
      case 'ANNULAR_STAGE1_TAIL': return '#3b82f6'; // Blue
      case 'RAT_HOLE': return '#6366f1'; // Indigo
      case 'SHOE_TRACK': return '#f59e0b'; // Amber
      case 'DIFF_PRESSURE':
      case 'HP_ANN':
      case 'HP_CSG': return '#a855f7'; // Purple
      case 'DISPLACEMENT':
      case 'DISPLACEMENT_STAGE1':
      case 'DISPLACEMENT_STAGE2': return '#10b981'; // Emerald
      default: return '#3b82f6';
    }
  };

  const highlightColor = getHighlightColor();

  // Smart visibility for labels based on activeInputs (kept clearly readable)
  const getLabelOpacity = (inputKeys: string[]) => {
    if (!highlight) return 1;
    if (activeInputs.length === 0) return 0.75;
    return inputKeys.some(key => activeInputs.includes(key)) ? 1 : 0.75;
  };

  // Compute exact SVG clip coordinates for annular highlight intervals
  const getAnnularClipBounds = () => {
    const startY = type === 'SEC4' ? linerTopY : surfaceY;
    if (highlight === 'ANNULAR_STAGE1' && dvToolY) return { y: dvToolY, h: casingEndY - dvToolY };
    if (highlight === 'ANNULAR_STAGE2' && dvToolY) return { y: startY, h: dvToolY - startY };
    if ((highlight === 'ANNULAR_CASED' || highlight === 'ANNULAR_STAGE2_CASED') && prevCasingEndY) {
      return { y: startY, h: prevCasingEndY - startY };
    }
    if (highlight === 'ANNULAR_LEAD_OH' && prevCasingEndY && tailY) {
      return { y: prevCasingEndY, h: tailY - prevCasingEndY };
    }
    if ((highlight === 'ANNULAR_TAIL_OH' || highlight === 'ANNULAR_STAGE1_TAIL') && tailY) {
      return { y: tailY, h: casingEndY - tailY };
    }
    if (highlight === 'ANNULAR_STAGE2_OH' && prevCasingEndY && dvToolY) {
      return { y: prevCasingEndY, h: dvToolY - prevCasingEndY };
    }
    if (highlight === 'ANNULAR_STAGE1_LEAD' && dvToolY && tailY) {
      return { y: dvToolY, h: tailY - dvToolY };
    }
    return null;
  };

  const annularClipBounds = getAnnularClipBounds();

  // Ensure previous casing shoe label Y doesn't overlap with surface label Y
  const prevShoeLabelY = Math.max(surfaceY + 34, prevCasingEndY);
  // Ensure previous casing vertical title Y doesn't collide with surface or shoe label
  const prevCasingTitleY = prevCasingEndY - surfaceY > 65 ? surfaceY + 26 : prevCasingEndY + 28;

  // Left anchor X for surface and prev casing lines
  const leftLabelStartX = 6;
  const leftSurfaceLineEndX = (type === 'SEC1' ? leftHoleX : leftPrevCasingX) - leftLabelStartX - 2;
  const leftPrevShoeLineEndX = leftPrevCasingX - leftLabelStartX - 2;

  return (
    <div className={`w-full flex flex-col items-center bg-slate-900/40 rounded-[2rem] p-1 border border-slate-800/50 my-0.5 shadow-xl overflow-hidden ${isMini ? 'max-w-md !p-1 !my-0' : ''}`}>
      <div className={`w-full flex flex-col ${isMini ? 'gap-0' : 'md:flex-row justify-between items-start md:items-center mb-1 gap-2'}`}>
        {!isMini && (
          <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] italic flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            الرسم التخطيطي للسكشن {type} (Wellbore Schematic)
          </h3>
        )}
        
        <div className={`flex flex-wrap gap-2 bg-slate-800/40 rounded-2xl border border-slate-700/50 ${isMini ? 'p-1 mb-1 justify-center' : 'p-3'}`}>
          <div className="flex items-center gap-1.5 transition-all duration-500" style={{ 
            opacity: getLabelOpacity(['holeSize']),
            color: HOLE_COLOR
          }}>
            <div className={`rounded-sm border border-current/50 ${isMini ? 'w-1.5 h-1.5' : 'w-3 h-3'}`} style={{ backgroundColor: HOLE_COLOR }}></div>
            <div className="text-right">
              <span className={`block font-black leading-none uppercase italic ${isMini ? 'text-[7px]' : 'text-[10px]'}`}>{holeSize}" Hole Size</span>
            </div>
          </div>
          <div className={`w-px bg-slate-700 mx-0.5 ${isMini ? 'h-3' : 'h-6 hidden md:block'}`}></div>
          
          {/* Previous Casing Info */}
          {(type === 'SEC2' || type === 'SEC3' || type === 'SEC4') && prevCasingOD !== undefined && (
            <>
              <div className="flex items-center gap-1.5 transition-all duration-500" style={{ 
                opacity: getLabelOpacity(['prevCasingOD', 'prevCasingID', 'prevID']),
                color: '#94a3b8' // Slate color for previous casing
              }}>
                <div className={`rounded-sm border border-current/50 ${isMini ? 'w-1.5 h-1.5' : 'w-3 h-3'}`} style={{ backgroundColor: '#94a3b8' }}></div>
                <div className="text-right">
                  <span className={`block font-black leading-none uppercase italic ${isMini ? 'text-[7px]' : 'text-[10px]'}`}>{toFraction(prevCasingOD)}" Prev Casing</span>
                  <div className={`flex flex-col ${isMini ? 'text-[6px]' : 'text-[8px]'} font-bold text-slate-500 leading-tight`}>
                    <span>القطر الخارجي: {prevCasingOD}" | القطر الداخلي: {prevCasingID}"</span>
                  </div>
                </div>
              </div>
              <div className={`w-px bg-slate-700 mx-0.5 ${isMini ? 'h-3' : 'h-6 hidden md:block'}`}></div>
            </>
          )}

          <div className="flex items-center gap-1.5 transition-all duration-500" style={{ 
            opacity: getLabelOpacity(['casingOD', 'casingID']),
            color: CASING_COLOR
          }}>
            <div className={`rounded-sm border border-current/50 ${isMini ? 'w-1.5 h-1.5' : 'w-3 h-3'}`} style={{ backgroundColor: CASING_COLOR }}></div>
            <div className="text-right">
              <span className={`block font-black leading-none uppercase italic ${isMini ? 'text-[7px]' : 'text-[10px]'}`}>{toFraction(casingOD)}" Casing</span>
              <div className={`flex flex-col ${isMini ? 'text-[6px]' : 'text-[8px]'} font-bold text-slate-500 leading-tight`}>
                <span>القطر الخارجي: {casingOD}" | القطر الداخلي: {casingID}"</span>
                {excess !== undefined && <span>نسبة الزيادة (Excess): {excess}%</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
      
        {/* DP Legend Area - Above the drawing */}
        {(highlight === 'DIFF_PRESSURE' || highlight === 'HP_ANN' || highlight === 'HP_CSG') && (
          <div className={`w-full flex justify-center gap-2 px-1 mb-1 ${isMini ? 'bg-slate-800/30' : 'bg-slate-800/50 p-2'} rounded-xl border border-slate-700/50`}>
            {mudDens !== undefined && (
              <div className="flex items-center gap-1">
                <div className={`${isMini ? 'w-1.5 h-1.5' : 'w-3 h-3'} rounded-sm border border-slate-600/50`} style={{ backgroundColor: FLUID_MUD }}></div>
                <span className={`${isMini ? 'text-[6px]' : 'text-[9px]'} font-black italic uppercase`} style={{ color: FLUID_MUD }}>
                  {mudDens} <span className="opacity-80">Mud</span>
                </span>
              </div>
            )}
            {leadDens !== undefined && leadDens > 0 && (
              <div className="flex items-center gap-1 border-l border-slate-700 pl-2">
                <div className={`${isMini ? 'w-1.5 h-1.5' : 'w-3 h-3'} rounded-sm border border-blue-400/50`} style={{ backgroundColor: FLUID_LEAD }}></div>
                <span className={`${isMini ? 'text-[6px]' : 'text-[9px]'} font-black italic uppercase`} style={{ color: FLUID_LEAD }}>
                  {leadDens} <span className="opacity-80">Lead</span>
                </span>
              </div>
            )}
            {tailDens !== undefined && (
              <div className="flex items-center gap-1 border-l border-slate-700 pl-2">
                <div className={`${isMini ? 'w-1.5 h-1.5' : 'w-3 h-3'} rounded-sm border border-amber-400/50`} style={{ backgroundColor: FLUID_TAIL }}></div>
                <span className={`${isMini ? 'text-[6px]' : 'text-[9px]'} font-black italic uppercase`} style={{ color: FLUID_TAIL }}>
                  {tailDens || '15.8'} <span className="opacity-80">Tail</span>
                </span>
              </div>
            )}
          </div>
        )}

      <svg
        style={{ direction: 'ltr' }}
        width="100%"
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="drop-shadow-2xl overflow-visible"
      >
        {/* Definitions */}
        <defs>
          <style>{`
            @keyframes pulse-volume {
              0% { filter: brightness(1) drop-shadow(0 0 0px rgba(255,255,255,0)); }
              50% { filter: brightness(1.3) drop-shadow(0 0 8px rgba(255,255,255,0.4)); }
              100% { filter: brightness(1) drop-shadow(0 0 0px rgba(255,255,255,0)); }
            }
            @keyframes stripe-move {
              0% { transform: translateX(0); }
              100% { transform: translateX(20px); }
            }
            .pulse-volume {
              animation: pulse-volume 1.5s ease-in-out infinite;
            }
            .stripe-pattern {
              animation: stripe-move 2s linear infinite;
            }
          `}</style>
          <filter id={`glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <pattern id={`activeStripes-${uid}`} patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(45)">
            <rect width="20" height="20" fill="none" />
            <line x1="0" y1="0" x2="0" y2="20" stroke="rgba(255,255,255,0.2)" strokeWidth="10" className="stripe-pattern" />
          </pattern>
          <linearGradient id={`cementGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={highlightColor} stopOpacity="0.7" />
            <stop offset="50%" stopColor={highlightColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={highlightColor} stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id={`casingGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id={`prevCasingGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id={`dispGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#065f46" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#065f46" />
          </linearGradient>
          <linearGradient id={`mudGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <pattern id={`rockPattern-${uid}`} patternUnits="userSpaceOnUse" width="20" height="20">
            <path d="M 0 10 L 10 0 M 10 20 L 20 10" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          </pattern>
          {annularClipBounds && (
            <clipPath id={`annularStepClip-${uid}`}>
              <rect x="0" y={annularClipBounds.y} width={svgWidth} height={Math.max(0, annularClipBounds.h)} />
            </clipPath>
          )}
          <clipPath id={`annulusLeadClip-${uid}`}>
            {leadTopY !== null && (
              <rect x="0" y={leadTopY} width="400" height={Math.max(0, (tailY || casingEndY) - leadTopY)} />
            )}
          </clipPath>
          <clipPath id={`annulusTailClip-${uid}`}>
             {tailY !== null && (
               <rect x="0" y={tailY} width="400" height={Math.max(0, casingEndY - tailY)} />
             )}
          </clipPath>
          <clipPath id={`shoeTrackClip-${uid}`}>
            <rect x={centerX - casingWidth/2} y={floatCollarY} width={casingWidth} height={Math.max(0, casingEndY - floatCollarY)} />
          </clipPath>
        </defs>

        {/* Hole Background (Rock) */}
        <rect x={centerX - 180} y={prevCasingEndY} width="360" height={Math.max(0, holeEndY - prevCasingEndY)} fill="#1a1a1a" rx="10" />
        <rect x={centerX - 180} y={prevCasingEndY} width="360" height={Math.max(0, holeEndY - prevCasingEndY)} fill={`url(#rockPattern-${uid})`} rx="10" />

        {/* Full Annulus Background for DP (Mud Column) */}
        {(highlight === 'DIFF_PRESSURE' || highlight === 'HP_ANN') && (
          <path d={fullAnnulusPath} fill={FLUID_MUD} />
        )}

        {/* Cement in Annulus (Dynamic Color) */}
        <g 
          clipPath={annularClipBounds ? `url(#annularStepClip-${uid})` : undefined}
          className={isHighlighted('ANNULAR') ? "pulse-volume" : ""}
        >
          {/* Multicolor Cement for DP Highlight */}
          {(highlight === 'DIFF_PRESSURE' || highlight === 'HP_ANN') ? (
            <g>
               {/* Lead Section */}
               {leadTopY !== null && leadTopY < (tailY || casingEndY) && (
                  <g clipPath={`url(#annulusLeadClip-${uid})`}>
                    <path d={fullAnnulusPath} fill={FLUID_LEAD} />
                  </g>
               )}
               {/* Tail Section */}
               {tailY !== null && (
                  <g clipPath={`url(#annulusTailClip-${uid})`}>
                    <path d={fullAnnulusPath} fill={FLUID_TAIL} />
                  </g>
               )}
               {/* Special case for SEC1: if only tail, cover full column where cement is expected */}
               {type === 'SEC1' && tailDepth === 0 && (
                  <path d={fullAnnulusPath} fill={FLUID_TAIL} />
               )}
            </g>
          ) : (
            <path d={cementPath} fill={`url(#cementGrad-${uid})`} />
          )}
          
          {isHighlighted('ANNULAR') && (
            <path d={cementPath} fill={`url(#activeStripes-${uid})`} pointerEvents="none" />
          )}
        </g>

        {/* Rat Hole Area (Dynamic Color) */}
        <g className={highlight === 'RAT_HOLE' ? "pulse-volume" : ""}>
          <path 
            d={ratHolePath} 
            fill={HOLE_COLOR} 
            opacity={1}
            stroke="none"
          />
          {highlight === 'RAT_HOLE' && (
            <path d={ratHolePath} fill={`url(#activeStripes-${uid})`} pointerEvents="none" />
          )}
        </g>

        {/* Casing String Interior - Mud (Background) */}
        <path 
          d={internalFillPath}
          fill={`url(#mudGrad-${uid})`} 
        />

        {/* Casing String Interior - Displacement (Dynamic Color) */}
        <g className={isHighlighted('DISPLACEMENT') ? "pulse-volume" : ""}>
          {(highlight === 'DIFF_PRESSURE' || highlight === 'HP_CSG') ? (
            <g>
               {/* Internal Mud starts from Surface to Calculation point */}
               <path 
                 d={dpPoint === 'DV' && dvToolY ? 
                   (type === 'SEC4' ? 
                     `M ${centerX - 6} ${surfaceY} L ${centerX + 6} ${surfaceY} L ${centerX + 6} ${linerTopY} L ${rightCasingX - 2} ${linerTopY} L ${rightCasingX - 2} ${dvToolY} L ${leftCasingX + 2} ${dvToolY} L ${leftCasingX + 2} ${linerTopY} L ${centerX - 6} ${linerTopY} Z` :
                     `M ${leftCasingX + 2} ${surfaceY} L ${rightCasingX - 2} ${surfaceY} L ${rightCasingX - 2} ${dvToolY} L ${leftCasingX + 2} ${dvToolY} Z`
                   ) : 
                   internalFillPath
                 } 
                 fill={FLUID_MUD} 
               />
               
               {/* Tail in Shoe Track (only for Shoe DP) */}
               {dpPoint === 'SHOE' && (
                 <g clipPath={`url(#shoeTrackClip-${uid})`}>
                    <path d={internalFillPath} fill={FLUID_TAIL} />
                 </g>
               )}
            </g>
          ) : (
             <path 
              d={dispFillPath}
              fill={isHighlighted('DISPLACEMENT') ? `url(#dispGrad-${uid})` : `url(#mudGrad-${uid})`} 
              fillOpacity={1} 
              stroke={isHighlighted('DISPLACEMENT') ? "#10b981" : "none"}
              strokeWidth="2"
              strokeOpacity={0.8}
            />
          )}
          {isHighlighted('DISPLACEMENT') && (
            <path d={dispFillPath} fill={`url(#activeStripes-${uid})`} pointerEvents="none" />
          )}
        </g>

        {/* Previous Casing (For SEC2, SEC3, and SEC4) - Rendered after fill to ensure visibility */}
        {(type === 'SEC2' || type === 'SEC3' || type === 'SEC4') && prevCasingDepth && (
          <g opacity={fadeOpacity('ANNULAR')}>
            {/* Left side of previous casing */}
            <rect 
              x={leftPrevCasingX - 4} 
              y={surfaceY} 
              width="8" 
              height={Math.max(0, prevCasingEndY - surfaceY)} 
              fill={`url(#prevCasingGrad-${uid})`} 
              stroke="#334155"
              strokeWidth="1"
            />
            {/* Right side of previous casing */}
            <rect 
              x={rightPrevCasingX - 4} 
              y={surfaceY} 
              width="8" 
              height={Math.max(0, prevCasingEndY - surfaceY)} 
              fill={`url(#prevCasingGrad-${uid})`} 
              stroke="#334155"
              strokeWidth="1"
            />
            {/* Previous Shoe */}
            <path d={`M ${leftPrevCasingX - 3} ${prevCasingEndY} L ${leftPrevCasingX + 10} ${prevCasingEndY + 15} L ${leftPrevCasingX - 3} ${prevCasingEndY + 15} Z`} fill="#475569" />
            <path d={`M ${rightPrevCasingX + 3} ${prevCasingEndY} L ${rightPrevCasingX - 10} ${prevCasingEndY + 15} L ${rightPrevCasingX + 3} ${prevCasingEndY + 15} Z`} fill="#475569" />
            
            <text x={rightPrevCasingX + 8} y={surfaceY + 16} textAnchor="start" fill="#94a3b8" fontSize={isMini ? "8" : "9"} fontWeight="black" className="italic">الكيسينق السابق</text>
            <text x={rightPrevCasingX + 8} y={surfaceY + 27} textAnchor="start" fill="#64748b" fontSize={isMini ? "7" : "8"} fontWeight="bold">PREV CASING</text>
          </g>
        )}
        
        {/* Casing String Interior - Shoe Track (Dynamic Color) */}
        <g className={highlight === 'SHOE_TRACK' ? "pulse-volume" : ""}>
          <rect 
            x={leftCasingX} 
            y={floatCollarY} 
            width={casingWidth} 
            height={Math.max(0, casingEndY - floatCollarY)} 
            fill={highlight === 'SHOE_TRACK' ? "#f59e0b" : "#f59e0b"} 
            fillOpacity={1} 
            stroke={highlight === 'SHOE_TRACK' ? "#f59e0b" : "none"}
            strokeWidth="2"
            strokeOpacity={0.8}
          />
          {highlight === 'SHOE_TRACK' && (
            <rect x={leftCasingX} y={floatCollarY} width={casingWidth} height={Math.max(0, casingEndY - floatCollarY)} fill={`url(#activeStripes-${uid})`} pointerEvents="none" />
          )}
        </g>

        {/* Casing Outline */}
        <g opacity={1}>
          <rect x={leftCasingX - 2} y={linerTopY} width="4" height={Math.max(0, casingEndY - linerTopY)} fill={`url(#casingGrad-${uid})`} />
          <rect x={rightCasingX - 2} y={linerTopY} width="4" height={Math.max(0, casingEndY - linerTopY)} fill={`url(#casingGrad-${uid})`} />
          
          {/* Drill Pipe for SEC4 (Running String) */}
          {type === 'SEC4' && (
            <g>
              <rect x={centerX - 9} y={surfaceY} width="3" height={Math.max(0, linerTopY - surfaceY)} fill="#64748b" />
              <rect x={centerX + 6} y={surfaceY} width="3" height={Math.max(0, linerTopY - surfaceY)} fill="#64748b" />
              <text x={centerX + 12} y={surfaceY + (linerTopY - surfaceY) * 0.45} textAnchor="start" fill="#94a3b8" fontSize="8" fontWeight="black" className="italic">5" DRILL PIPE</text>
            </g>
          )}

          {/* Liner Hanger for SEC4 */}
          {type === 'SEC4' && linerTopY && (
            <g>
              {/* Left Hanger Arm - Visual connection to prev casing */}
              <line 
                x1={leftCasingX} 
                y1={linerTopY} 
                x2={leftPrevCasingX} 
                y2={linerTopY} 
                stroke="#3b82f6" 
                strokeWidth="6" 
                strokeLinecap="butt"
              />
              {/* Right Hanger Arm - Visual connection to prev casing */}
              <line 
                x1={rightCasingX} 
                y1={linerTopY} 
                x2={rightPrevCasingX} 
                y2={linerTopY} 
                stroke="#3b82f6" 
                strokeWidth="6" 
                strokeLinecap="butt"
              />
              {/* Hanger Teeth/Grips */}
              <rect x={leftPrevCasingX} y={linerTopY - 8} width="3" height="16" fill="#3b82f6" rx="1" />
              <rect x={rightPrevCasingX - 3} y={linerTopY - 8} width="3" height="16" fill="#3b82f6" rx="1" />
              
              <text x={centerX} y={linerTopY - 10} textAnchor="middle" fill="#60a5fa" fontSize={isMini ? "8.5" : "9.5"} fontWeight="black" className="italic uppercase drop-shadow-sm">Liner Hanger (مكان التعليق)</text>
            </g>
          )}
        </g>

        {/* Hole Boundaries (Zigzag Stroke) - Rendered on top to ensure visibility */}
        <path 
          d={leftHoleFullPath} 
          fill="none" 
          stroke={HOLE_COLOR} 
          strokeWidth={isMini ? "3" : "2"} 
          strokeOpacity={1}
          className="transition-all duration-500"
        />
        <path 
          d={rightHoleFullPath} 
          fill="none" 
          stroke={HOLE_COLOR} 
          strokeWidth={isMini ? "3" : "2"} 
          strokeOpacity={1}
          className="transition-all duration-500"
        />
        
        {/* DV Tool (if SEC3) */}
        {type === 'SEC3' && dvToolY && (
          <g opacity={1}>
            <g transform={`translate(0, ${dvToolY})`}>
              {/* Left Connector/Side */}
              <rect 
                x={leftCasingX - (isMini ? 8 : 12)} 
                y={isMini ? -4 : -6} 
                width={isMini ? 10 : 15} 
                height={isMini ? 8 : 12} 
                fill="#a855f7" 
                fillOpacity="0.6"
                stroke="#d8b4fe"
                strokeWidth="1.5"
                rx="2" 
                className="animate-pulse" 
              />
              {/* Right Connector/Side */}
              <rect 
                x={rightCasingX - (isMini ? 2 : 3)} 
                y={isMini ? -4 : -6} 
                width={isMini ? 10 : 15} 
                height={isMini ? 8 : 12} 
                fill="#a855f7" 
                fillOpacity="0.6"
                stroke="#d8b4fe"
                strokeWidth="1.5"
                rx="2" 
                className="animate-pulse" 
              />
              {/* Thin translucent bridge to show it's one unit but keep center visible */}
              <line 
                x1={leftCasingX} 
                y1="0" 
                x2={rightCasingX} 
                y2="0" 
                stroke="#a855f7" 
                strokeWidth="1" 
                strokeDasharray="2,2" 
                strokeOpacity="0.4"
              />
              <text 
                x={centerX} 
                y={isMini ? -10 : -15} 
                textAnchor="middle" 
                fill="white" 
                fontSize={isMini ? 7 : 9} 
                fontWeight="black" 
                className="italic uppercase drop-shadow-md"
                filter={`url(#glow-${uid})`}
              >
                DV TOOL
              </text>
            </g>
            {/* Side depth line for DV Tool - Centered inside its box */}
            <g transform={`translate(${leftHoleX}, ${dvToolY})`}>
              <line x1="0" y1="0" x2={isMini ? -24 : -34} y2="0" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3,2" />
              <rect x={isMini ? -84 : -98} y="-13" width={isMini ? 60 : 64} height={isMini ? 26 : 28} fill="#a855f7" fillOpacity="0.25" stroke="#a855f7" strokeOpacity="0.4" rx="4" />
              <text x={isMini ? -54 : -66} y="-2" fill="white" fontSize={isMini ? 8 : 9.5} fontWeight="black" textAnchor="middle" filter={`url(#glow-${uid})`}>DV TOOL</text>
              <text x={isMini ? -54 : -66} y={isMini ? 9 : 11} fill="#d8b4fe" fontSize={isMini ? 8.5 : 10.5} fontWeight="black" textAnchor="middle">{dvToolDepth} ft</text>
            </g>
          </g>
        )}

        {/* Float Collar */}
        <g transform={`translate(0, ${floatCollarY})`} opacity={fadeOpacity('SHOE_TRACK')}>
          <rect x={leftCasingX - 4} y="-5" width={casingWidth + 8} height="10" fill={highlight === 'SHOE_TRACK' ? highlightColor : "#fbbf24"} rx="2" className="drop-shadow-md transition-all duration-500" />
          <rect x={leftCasingX + 2} y="-3" width={casingWidth - 4} height="6" fill="#1e293b" rx="1" opacity="0.4" />
          <text x={centerX} y="-12" textAnchor="middle" fill={highlight === 'SHOE_TRACK' ? highlightColor : "#fbbf24"} fontSize="9" fontWeight="black" className="italic tracking-tighter drop-shadow-sm transition-all duration-500">FLOAT COLLAR</text>
        </g>

        {/* Float Shoe */}
        <g transform={`translate(0, ${casingEndY})`} opacity={fadeOpacity('SHOE_TRACK')}>
          <path d={`M ${leftCasingX - 4} 0 L ${rightCasingX + 4} 0 L ${centerX} 20 Z`} fill={highlight === 'SHOE_TRACK' ? highlightColor : "#fbbf24"} className="drop-shadow-md transition-all duration-500" />
          <circle cx={centerX} cy="5" r="3.5" fill="#1e293b" opacity="0.4" />
          <text x={centerX} y="31" textAnchor="middle" fill={highlight === 'SHOE_TRACK' ? highlightColor : "#fbbf24"} fontSize="9" fontWeight="black" className="italic tracking-tighter drop-shadow-sm transition-all duration-500">FLOAT SHOE</text>
        </g>

        {/* --- Depth Labels Inside Areas --- */}
        
        {/* 1. Displacement Depth (Inside Casing) */}
        <g opacity={fadeOpacity('DISPLACEMENT')}>
          {highlight === 'DISPLACEMENT_STAGE2' && dvToolDepth ? (
            <g transform={`translate(${centerX}, ${surfaceY + (dvToolY! - surfaceY) * 0.4})`}>
              <text textAnchor="middle" fill="white" fontSize={isMini ? 14 : 18} fontWeight="black" filter={`url(#glow-${uid})`}>
                {dvToolDepth.toFixed(0)} ft
              </text>
              <text y={isMini ? 11 : 15} textAnchor="middle" fill="white" fontSize={isMini ? 7 : 10} fontWeight="black" className="italic uppercase tracking-tighter" filter={`url(#glow-${uid})`}>Dis (Stage 2)</text>
            </g>
          ) : (
            <g transform={`translate(${centerX}, ${linerTopY + (floatCollarY - linerTopY) * (type === 'SEC3' ? 0.28 : 0.5)})`}>
              <text textAnchor="middle" fill="white" fontSize={isMini ? 14 : 18} fontWeight="black" filter={`url(#glow-${uid})`}>
                {floatCollarDepth.toFixed(0)} ft
              </text>
              <text y={isMini ? 11 : 15} textAnchor="middle" fill="white" fontSize={isMini ? 7 : 10} fontWeight="black" className="italic uppercase tracking-tighter" filter={`url(#glow-${uid})`}>
                {type === 'SEC3' ? 'Dis (Stage 1)' : 'Dis'}
              </text>
            </g>
          )}
        </g>

        {/* 2. Shoe Track Depth (Inside Casing, FC to Shoe) */}
        {shoeTrack > 0 && (
          <text x={centerX} y={floatCollarY + (casingEndY - floatCollarY) / 2 + 4} textAnchor="middle" fill="white" fontSize={isMini ? 10 : 12} fontWeight="black" className="drop-shadow-sm" opacity={fadeOpacity('SHOE_TRACK')}>
            {shoeTrack} ft
          </text>
        )}

        {/* 3. Rat Hole Depth (Inside Open Hole, placed below FLOAT SHOE text so they never overlap) */}
        {ratHole > 0 && (
          <text x={centerX} y={casingEndY + Math.max(48, (holeEndY - casingEndY) * 0.78)} textAnchor="middle" fill="white" fontSize={isMini ? 10 : 12} fontWeight="black" className="drop-shadow-sm" opacity={fadeOpacity('RAT_HOLE')}>
            {ratHole} ft
          </text>
        )}

        {/* --- Depth Labels (Next to Schematic - Right Side) --- */}
        <g transform={`translate(${rightHoleX + 4}, ${casingEndY})`} opacity={getLabelOpacity(['casingDepth', 'totalDepth'])}>
          <line x1="-4" y1="0" x2={isMini ? 18 : 26} y2="0" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
          <text x={isMini ? 22 : 30} y="-4" fill="#94a3b8" fontSize={isMini ? 8 : 9.5} fontWeight="black" textAnchor="start">نهاية الكيسينق</text>
          <text x={isMini ? 22 : 30} y={isMini ? 8 : 10} fill="#cbd5e1" fontSize={isMini ? 8.5 : 10.5} fontWeight="black" textAnchor="start">{casingDepth} ft</text>
        </g>

        <g transform={`translate(${rightHoleX + 4}, ${holeEndY})`} opacity={getLabelOpacity(['holeDepth', 'ratHole'])}>
          <line x1="-4" y1="0" x2={isMini ? 18 : 26} y2="0" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" />
          <text x={isMini ? 22 : 30} y="-4" fill="#ef4444" fontSize={isMini ? 8 : 9.5} fontWeight="black" textAnchor="start">نهاية الحفرة</text>
          <text x={isMini ? 22 : 30} y={isMini ? 8 : 10} fill="#fca5a5" fontSize={isMini ? 8.5 : 10.5} fontWeight="black" textAnchor="start">{holeDepth} ft</text>
        </g>

        {/* --- Left Side Labels (Surface & Previous Casing Shoe - Inside ViewBox) --- */}
        <g transform={`translate(${leftLabelStartX}, ${surfaceY})`} opacity={getLabelOpacity(['surface'])}>
          <line x1="0" y1="0" x2={Math.max(25, leftSurfaceLineEndX)} y2="0" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2" />
          <text x="2" y="-5" fill="#3b82f6" fontSize={isMini ? 8 : 9.5} fontWeight="black" textAnchor="start">السطح (Surface)</text>
          <text x="2" y={isMini ? 9 : 11} fill="#60a5fa" fontSize={isMini ? 8.5 : 10.5} fontWeight="black" textAnchor="start">0 ft</text>
        </g>

        {/* Previous Casing Shoe Label (for SEC2/3/4) */}
        {(type === 'SEC2' || type === 'SEC3' || type === 'SEC4') && prevCasingDepth && (
          <g transform={`translate(${leftLabelStartX}, ${prevShoeLabelY})`} opacity={getLabelOpacity(['prevCasingDepth', 'prevShoe'])}>
            <line x1="0" y1="0" x2={Math.max(25, leftPrevShoeLineEndX)} y2={prevCasingEndY - prevShoeLabelY} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
            <text x="2" y="-5" fill="#94a3b8" fontSize={isMini ? 7.5 : 9} fontWeight="black" textAnchor="start">نهاية الكيسينق السابق</text>
            <text x="2" y={isMini ? 9 : 11} fill="#cbd5e1" fontSize={isMini ? 8.5 : 10.5} fontWeight="black" textAnchor="start">{prevCasingDepth} ft</text>
          </g>
        )}

        {/* Stage Labels for SEC3 - Kept inside right edge of 400px viewBox */}
        {type === 'SEC3' && highlight && (highlight.includes('STAGE1') || highlight.includes('STAGE2')) && (
          <g transform={`translate(${svgWidth - 95}, ${surfaceY + 45})`}>
            <rect x="-10" y="-10" width="100" height="40" fill="#1e293b" stroke={highlightColor} strokeWidth="2" rx="10" />
            <text x="40" y="10" textAnchor="middle" fill={highlightColor} fontSize="10" fontWeight="black" className="italic">
              {highlight.includes('STAGE1') ? 'STAGE 1' : 'STAGE 2'}
            </text>
            <text x="40" y="22" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
              {highlight.includes('STAGE1') ? 'المرحلة الأولى' : 'المرحلة الثانية'}
            </text>
          </g>
        )}

      </svg>
      
      {!isMini && (
        <div className="mt-0 grid grid-cols-3 gap-1.5 w-full">
          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-center">
            <span className="block text-[7px] text-emerald-500 font-black uppercase italic">Displacement Depth</span>
            <span className="block text-[8px] text-slate-500 font-bold mb-1">عمق الإزاحة</span>
            <span className="text-xs font-black text-white">{floatCollarDepth.toFixed(0)} <span className="text-[8px] opacity-60">ft</span></span>
          </div>
          <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 text-center">
            <span className="block text-[7px] text-amber-500 font-black uppercase italic">Shoe Track Length</span>
            <span className="block text-[8px] text-slate-500 font-bold mb-1">طول الشو تراك</span>
            <span className="text-xs font-black text-white">{shoeTrack} <span className="text-[8px] opacity-60">ft</span></span>
          </div>
          <div className="bg-red-500/10 p-2 rounded-xl border border-red-500/20 text-center">
            <span className="block text-[7px] text-red-500 font-black uppercase italic">Rat Hole Length</span>
            <span className="block text-[8px] text-slate-500 font-bold mb-1">طول الرات هول</span>
            <span className="text-xs font-black text-white">{ratHole} <span className="text-[8px] opacity-60">ft</span></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionDiagram;
