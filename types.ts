
export enum CalcType {
  ANNULAR_VOLUME = 'ANNULAR_VOLUME',
  RAT_HOLE = 'RAT_HOLE',
  SHOE_TRACK = 'SHOE_TRACK',
  DISPLACEMENT = 'DISPLACEMENT',
  PUMP_OUTPUT_1 = 'PUMP_OUTPUT_1',
  PUMP_OUTPUT_2 = 'PUMP_OUTPUT_2',
  PUMP_MASTER = 'PUMP_MASTER',
  GPM = 'GPM',
  SPM = 'SPM',
  COMPLETE_SECTION = 'COMPLETE_SECTION',
  TOTAL_CEMENT = 'TOTAL_CEMENT',
  LEARNING = 'LEARNING',
  HYDROSTATIC = 'HYDROSTATIC',
  ECD = 'ECD',
  LOT = 'LOT',
  DRILL_STRING_STROKES = 'DRILL_STRING_STROKES',
  ROP = 'ROP',
  FINAL_REPORT = 'FINAL_REPORT',
  FIT = 'FIT',
  AI_SCANNER = 'AI_SCANNER',
  SPOT = 'SPOT',
  DRILLING_REPORT_PRO = 'DRILLING_REPORT_PRO',
  WELL_VOLUME = 'WELL_VOLUME',
  CASING_CAPACITY_TABLE = 'CASING_CAPACITY_TABLE'
}

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  image: string; // Base64 or URL
  timestamp: number;
}

export interface CalculationRecord {
  id: string;
  type: CalcType;
  title: string;
  inputs: Record<string, number | string>;
  result: number;
  timestamp: number;
}

export interface FormulaDetails {
  title: string;
  englishTitle?: string;
  law: string;
  substitution?: string;
  variables: { description: string; math?: string; color?: string }[];
  note?: string;
}

export interface DrillingData {
  wellName: string;
  rigName?: string;
  date: string;
  currentDepth: string;
  mudType?: string;
  mudWeight: string;
  viscosity: string;
  fluidTemp?: string;
  pv?: string;
  yp?: string;
  cake?: string;
  apiFluidLoss?: string;
  mbt?: string;
  ph: string;
  gel10s?: string;
  gel10m?: string;
  solidsVol?: string;
  waterVol?: string;
  chlorides?: string;
  hardnessCa?: string;
  dailyMudCost?: string;
  cumMudCost?: string;
  dailyLoss?: string;
  cumLoss?: string;
  [key: string]: any;
}

export const DRILLING_FIELDS_AR: Record<string, string> = {
  wellName: "البئر|Well Name",
  rigName: "الحفارة|Rig Name",
  date: "التاريخ|Date",
  currentDepth: "العمق الحالي|Depth",
  mudWeight: "وزن الطين|MW",
  viscosity: "اللزوجة|VISC",
  ph: "pH|حموضة",
  mudType: "نوع الطين|Mud Type",
  fluidTemp: "درجة الحرارة|Temp",
  pv: "اللزوجة البلاستيكية|PV",
  yp: "نقطة الخضوع|YP",
  cake: "سماكة القشرة|Cake",
  apiFluidLoss: "الرشح|Filtrate",
  mbt: "اختبار MBT|MBT",
  solidsVol: "المواد الصلبة|Solids",
  waterVol: "نسبة الماء|Water Vol",
  hardnessCa: "عسر الكالسيوم|Calcium",
};
