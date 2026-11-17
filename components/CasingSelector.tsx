import React, { useState, useMemo } from 'react';
import { Layers, ChevronDown, Check, X, Search, Shield, Weight, CircleDot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface CasingWeightSpec {
  weight: number; // lb/ft (ppf)
  id: number; // inches
  wall: number; // inches
  drift: number; // inches
  grades: string[];
  note?: string;
}

export interface CasingSizeGroup {
  fraction: string; // e.g. '18 5/8"'
  od: number; // e.g. 18.625
  typeLabel: string; // e.g. 'Conductor / Surface'
  specs: CasingWeightSpec[];
}

export const API_CASING_CATALOG: CasingSizeGroup[] = [
  {
    fraction: '30"',
    od: 30.0,
    typeLabel: 'Conductor Pipe',
    specs: [
      { weight: 234.0, id: 28.5, wall: 0.75, drift: 28.312, grades: ['X-52', 'X-56', 'K-55'] },
      { weight: 310.0, id: 28.0, wall: 1.0, drift: 27.812, grades: ['X-52', 'X-56', 'X-65'] },
      { weight: 456.0, id: 27.0, wall: 1.5, drift: 26.812, grades: ['X-56', 'X-65'] },
    ],
  },
  {
    fraction: '24"',
    od: 24.0,
    typeLabel: 'Conductor / Surface',
    specs: [
      { weight: 163.0, id: 22.75, wall: 0.625, drift: 22.562, grades: ['J-55', 'K-55', 'X-52'] },
      { weight: 186.0, id: 22.5, wall: 0.75, drift: 22.312, grades: ['J-55', 'K-55', 'X-56'] },
      { weight: 248.0, id: 22.0, wall: 1.0, drift: 21.812, grades: ['K-55', 'X-56', 'X-65'] },
    ],
  },
  {
    fraction: '20"',
    od: 20.0,
    typeLabel: 'Surface Casing',
    specs: [
      { weight: 94.0, id: 19.124, wall: 0.438, drift: 18.936, grades: ['H-40', 'J-55', 'K-55'] },
      { weight: 106.5, id: 19.0, wall: 0.5, drift: 18.812, grades: ['J-55', 'K-55', 'L-80', 'N-80'] },
      { weight: 133.0, id: 18.73, wall: 0.635, drift: 18.542, grades: ['J-55', 'K-55', 'L-80', 'N-80', 'P-110'] },
      { weight: 169.0, id: 18.376, wall: 0.812, drift: 18.188, grades: ['K-55', 'L-80', 'N-80', 'P-110'] },
    ],
  },
  {
    fraction: '18 5/8"',
    od: 18.625,
    typeLabel: 'Surface Casing',
    specs: [
      { weight: 87.5, id: 17.755, wall: 0.435, drift: 17.567, grades: ['H-40', 'J-55', 'K-55', 'L-80', 'N-80'], note: 'قياسي شائع' },
      { weight: 94.5, id: 17.655, wall: 0.485, drift: 17.467, grades: ['J-55', 'K-55', 'L-80', 'N-80'] },
      { weight: 106.0, id: 17.5, wall: 0.563, drift: 17.312, grades: ['K-55', 'L-80', 'N-80', 'C-95', 'P-110'] },
      { weight: 117.5, id: 17.375, wall: 0.625, drift: 17.187, grades: ['K-55', 'L-80', 'N-80', 'P-110'] },
      { weight: 136.0, id: 17.185, wall: 0.72, drift: 16.997, grades: ['L-80', 'N-80', 'P-110', 'Q-125'] },
      { weight: 212.0, id: 16.125, wall: 1.25, drift: 15.937, grades: ['L-80', 'N-80', 'P-110'], note: 'جدار سميك (Heavy Wall)' },
      { weight: 222.0, id: 16.0, wall: 1.312, drift: 15.812, grades: ['N-80', 'P-110'], note: 'Shoe Joint / Heavy' },
    ],
  },
  {
    fraction: '16"',
    od: 16.0,
    typeLabel: 'Surface / Intermediate',
    specs: [
      { weight: 65.0, id: 15.25, wall: 0.375, drift: 15.062, grades: ['H-40', 'J-55', 'K-55'] },
      { weight: 75.0, id: 15.124, wall: 0.438, drift: 14.936, grades: ['J-55', 'K-55', 'L-80', 'N-80'] },
      { weight: 84.0, id: 15.01, wall: 0.495, drift: 14.822, grades: ['J-55', 'K-55', 'L-80', 'N-80', 'C-95', 'P-110'] },
      { weight: 109.0, id: 14.688, wall: 0.656, drift: 14.5, grades: ['K-55', 'L-80', 'N-80', 'P-110'] },
    ],
  },
  {
    fraction: '13 3/8"',
    od: 13.375,
    typeLabel: 'Intermediate Casing',
    specs: [
      { weight: 48.0, id: 12.715, wall: 0.33, drift: 12.559, grades: ['H-40', 'J-55'] },
      { weight: 54.5, id: 12.615, wall: 0.38, drift: 12.459, grades: ['J-55', 'K-55', 'L-80', 'N-80'] },
      { weight: 61.0, id: 12.515, wall: 0.43, drift: 12.359, grades: ['J-55', 'K-55', 'L-80', 'N-80', 'C-95'] },
      { weight: 68.0, id: 12.415, wall: 0.48, drift: 12.259, grades: ['J-55', 'K-55', 'L-80', 'N-80', 'C-95', 'P-110'], note: 'شائع جداً' },
      { weight: 72.0, id: 12.347, wall: 0.514, drift: 12.191, grades: ['L-80', 'N-80', 'C-95', 'P-110', 'Q-125'], note: 'قياسي للسكشن الثاني' },
      { weight: 77.0, id: 12.275, wall: 0.55, drift: 12.119, grades: ['L-80', 'N-80', 'C-95', 'P-110', 'Q-125'] },
      { weight: 85.0, id: 12.159, wall: 0.608, drift: 12.003, grades: ['N-80', 'C-95', 'P-110', 'Q-125'] },
    ],
  },
  {
    fraction: '10 3/4"',
    od: 10.75,
    typeLabel: 'Intermediate Casing',
    specs: [
      { weight: 40.5, id: 10.05, wall: 0.35, drift: 9.894, grades: ['H-40', 'J-55', 'K-55'] },
      { weight: 45.5, id: 9.95, wall: 0.4, drift: 9.794, grades: ['J-55', 'K-55', 'L-80', 'N-80'] },
      { weight: 51.0, id: 9.85, wall: 0.45, drift: 9.694, grades: ['J-55', 'K-55', 'L-80', 'N-80', 'C-95', 'P-110'] },
      { weight: 55.5, id: 9.76, wall: 0.495, drift: 9.604, grades: ['L-80', 'N-80', 'C-95', 'P-110'] },
      { weight: 60.7, id: 9.66, wall: 0.545, drift: 9.504, grades: ['L-80', 'N-80', 'C-95', 'P-110', 'Q-125'] },
    ],
  },
  {
    fraction: '9 5/8"',
    od: 9.625,
    typeLabel: 'Production / Intermediate',
    specs: [
      { weight: 36.0, id: 8.921, wall: 0.352, drift: 8.765, grades: ['H-40', 'J-55', 'K-55'] },
      { weight: 40.0, id: 8.835, wall: 0.395, drift: 8.679, grades: ['J-55', 'K-55', 'L-80', 'N-80', 'C-95'] },
      { weight: 43.5, id: 8.755, wall: 0.435, drift: 8.599, grades: ['L-80', 'N-80', 'C-95', 'P-110'] },
      { weight: 47.0, id: 8.681, wall: 0.472, drift: 8.525, grades: ['L-80', 'N-80', 'C-95', 'P-110', 'Q-125'], note: 'قياسي للسكشن الثالث' },
      { weight: 53.5, id: 8.535, wall: 0.545, drift: 8.379, grades: ['L-80', 'N-80', 'C-95', 'P-110', 'Q-125'] },
      { weight: 58.4, id: 8.435, wall: 0.595, drift: 8.279, grades: ['N-80', 'C-95', 'P-110', 'Q-125'] },
    ],
  },
  {
    fraction: '7 5/8"',
    od: 7.625,
    typeLabel: 'Production / Liner',
    specs: [
      { weight: 26.4, id: 6.969, wall: 0.328, drift: 6.844, grades: ['J-55', 'K-55', 'L-80', 'N-80'] },
      { weight: 29.7, id: 6.875, wall: 0.375, drift: 6.75, grades: ['L-80', 'N-80', 'C-95', 'P-110'] },
      { weight: 33.7, id: 6.765, wall: 0.43, drift: 6.64, grades: ['L-80', 'N-80', 'C-95', 'P-110', 'Q-125'] },
      { weight: 39.0, id: 6.625, wall: 0.5, drift: 6.5, grades: ['L-80', 'N-80', 'C-95', 'P-110', 'Q-125'] },
    ],
  },
  {
    fraction: '7"',
    od: 7.0,
    typeLabel: 'Production Liner / Casing',
    specs: [
      { weight: 20.0, id: 6.456, wall: 0.272, drift: 6.331, grades: ['H-40', 'J-55', 'K-55'] },
      { weight: 23.0, id: 6.366, wall: 0.317, drift: 6.241, grades: ['J-55', 'K-55', 'L-80', 'N-80', 'C-95'] },
      { weight: 26.0, id: 6.276, wall: 0.362, drift: 6.151, grades: ['J-55', 'K-55', 'L-80', 'N-80', 'C-95', 'P-110'] },
      { weight: 29.0, id: 6.184, wall: 0.408, drift: 6.059, grades: ['L-80', 'N-80', 'C-95', 'P-110', 'Q-125'], note: 'قياسي للبطانة (Liner)' },
      { weight: 32.0, id: 6.094, wall: 0.453, drift: 5.969, grades: ['L-80', 'N-80', 'C-95', 'P-110', 'Q-125'] },
      { weight: 35.0, id: 6.004, wall: 0.498, drift: 5.879, grades: ['L-80', 'N-80', 'C-95', 'P-110', 'Q-125'] },
      { weight: 38.0, id: 5.92, wall: 0.54, drift: 5.795, grades: ['L-80', 'N-80', 'C-95', 'P-110', 'Q-125'] },
    ],
  },
  {
    fraction: '5 1/2"',
    od: 5.5,
    typeLabel: 'Production Casing / Liner',
    specs: [
      { weight: 15.5, id: 4.95, wall: 0.275, drift: 4.825, grades: ['J-55', 'K-55'] },
      { weight: 17.0, id: 4.892, wall: 0.304, drift: 4.767, grades: ['J-55', 'K-55', 'L-80', 'N-80', 'C-95', 'P-110'] },
      { weight: 20.0, id: 4.778, wall: 0.361, drift: 4.653, grades: ['L-80', 'N-80', 'C-95', 'P-110', 'Q-125'] },
      { weight: 23.0, id: 4.67, wall: 0.415, drift: 4.545, grades: ['L-80', 'N-80', 'C-95', 'P-110', 'Q-125'] },
    ],
  },
  {
    fraction: '5"',
    od: 5.0,
    typeLabel: 'Liner / Drill Pipe',
    specs: [
      { weight: 13.0, id: 4.494, wall: 0.253, drift: 4.369, grades: ['J-55', 'K-55'] },
      { weight: 15.0, id: 4.408, wall: 0.296, drift: 4.283, grades: ['J-55', 'K-55', 'L-80', 'N-80', 'P-110'] },
      { weight: 18.0, id: 4.276, wall: 0.362, drift: 4.151, grades: ['L-80', 'N-80', 'C-95', 'P-110', 'S-135', 'G-105'], note: 'قياسي (5" DP / Liner)' },
      { weight: 19.5, id: 4.276, wall: 0.362, drift: 4.151, grades: ['E-75', 'X-95', 'G-105', 'S-135'], note: '5" Drill Pipe 19.5#' },
      { weight: 21.4, id: 4.126, wall: 0.437, drift: 4.001, grades: ['L-80', 'N-80', 'P-110'] },
    ],
  },
  {
    fraction: '4 1/2"',
    od: 4.5,
    typeLabel: 'Production Liner / Casing',
    specs: [
      { weight: 11.6, id: 4.0, wall: 0.25, drift: 3.875, grades: ['J-55', 'K-55', 'L-80', 'N-80', 'P-110'], note: 'لاينر / كيسينق إنتاجي شائع' },
      { weight: 12.6, id: 3.958, wall: 0.271, drift: 3.833, grades: ['J-55', 'L-80', 'N-80', 'P-110'] },
      { weight: 13.5, id: 3.92, wall: 0.29, drift: 3.795, grades: ['L-80', 'N-80', 'C-95', 'P-110'] },
      { weight: 15.1, id: 3.826, wall: 0.337, drift: 3.701, grades: ['L-80', 'N-80', 'C-95', 'P-110', 'Q-125'] },
    ],
  },
];

export const API_TUBING_CATALOG: CasingSizeGroup[] = [
  {
    fraction: '4 1/2"',
    od: 4.5,
    typeLabel: 'Big-Bore Production Tubing (تيوبينق كبير)',
    specs: [
      { weight: 12.6, id: 3.958, wall: 0.271, drift: 3.833, grades: ['J-55', 'L-80', 'N-80', 'C-95', 'P-110'], note: 'NUE Tubing 12.6#' },
      { weight: 12.75, id: 3.958, wall: 0.271, drift: 3.833, grades: ['J-55', 'L-80', 'N-80', 'P-110'], note: 'EUE Tubing 12.75# شائع' },
      { weight: 13.5, id: 3.92, wall: 0.29, drift: 3.795, grades: ['L-80', 'N-80', 'C-95', 'P-110'] },
      { weight: 15.5, id: 3.826, wall: 0.337, drift: 3.701, grades: ['L-80', 'N-80', 'C-95', 'P-110'] },
    ],
  },
  {
    fraction: '4"',
    od: 4.0,
    typeLabel: 'Production Tubing (تيوبينق إنتاج)',
    specs: [
      { weight: 9.5, id: 3.548, wall: 0.226, drift: 3.423, grades: ['J-55', 'L-80', 'N-80', 'C-95'], note: 'NUE Tubing 9.5#' },
      { weight: 11.0, id: 3.476, wall: 0.262, drift: 3.351, grades: ['J-55', 'L-80', 'N-80', 'P-110'], note: 'EUE Tubing 11.0# قياسي' },
      { weight: 11.6, id: 3.428, wall: 0.286, drift: 3.303, grades: ['L-80', 'N-80', 'C-95', 'P-110'] },
      { weight: 13.4, id: 3.34, wall: 0.33, drift: 3.215, grades: ['L-80', 'N-80', 'P-110'] },
    ],
  },
  {
    fraction: '3 1/2"',
    od: 3.5,
    typeLabel: 'Production Tubing (تيوبينق إنتاج شائع)',
    specs: [
      { weight: 7.7, id: 3.068, wall: 0.216, drift: 2.943, grades: ['J-55', 'L-80', 'N-80'] },
      { weight: 9.2, id: 2.992, wall: 0.254, drift: 2.867, grades: ['J-55', 'L-80', 'N-80', 'C-95', 'P-110'], note: 'NUE / VAM Tubing 9.2#' },
      { weight: 9.3, id: 2.992, wall: 0.254, drift: 2.867, grades: ['J-55', 'L-80', 'N-80', 'C-95', 'P-110'], note: 'EUE Tubing 9.3# (الأكثر استخداماً)' },
      { weight: 10.2, id: 2.922, wall: 0.289, drift: 2.797, grades: ['L-80', 'N-80', 'C-95', 'P-110'] },
      { weight: 12.7, id: 2.75, wall: 0.375, drift: 2.625, grades: ['L-80', 'N-80', 'C-95', 'P-110'], note: 'Heavy Wall Tubing' },
      { weight: 12.95, id: 2.75, wall: 0.375, drift: 2.625, grades: ['L-80', 'N-80', 'P-110'], note: 'EUE 12.95#' },
    ],
  },
  {
    fraction: '2 7/8"',
    od: 2.875,
    typeLabel: 'Production Tubing (تيوبينق إنتاج شائع)',
    specs: [
      { weight: 6.4, id: 2.441, wall: 0.217, drift: 2.347, grades: ['J-55', 'L-80', 'N-80', 'C-95', 'P-110'], note: 'NUE / VAM Tubing 6.4#' },
      { weight: 6.5, id: 2.441, wall: 0.217, drift: 2.347, grades: ['J-55', 'L-80', 'N-80', 'C-95', 'P-110'], note: 'EUE Tubing 6.5# (الأكثر استخداماً)' },
      { weight: 7.8, id: 2.323, wall: 0.276, drift: 2.229, grades: ['L-80', 'N-80', 'C-95', 'P-110'] },
      { weight: 7.9, id: 2.323, wall: 0.276, drift: 2.229, grades: ['L-80', 'N-80', 'C-95', 'P-110'], note: 'EUE Tubing 7.9#' },
      { weight: 8.6, id: 2.259, wall: 0.308, drift: 2.165, grades: ['L-80', 'N-80', 'P-110'] },
      { weight: 8.7, id: 2.259, wall: 0.308, drift: 2.165, grades: ['L-80', 'N-80', 'P-110'], note: 'EUE Tubing 8.7#' },
    ],
  },
  {
    fraction: '2 3/8"',
    od: 2.375,
    typeLabel: 'Production Tubing (تيوبينق إنتاج شائع)',
    specs: [
      { weight: 4.0, id: 2.041, wall: 0.167, drift: 1.947, grades: ['J-55', 'L-80', 'N-80'] },
      { weight: 4.6, id: 1.995, wall: 0.19, drift: 1.901, grades: ['J-55', 'L-80', 'N-80', 'C-95', 'P-110'], note: 'NUE Tubing 4.6#' },
      { weight: 4.7, id: 1.995, wall: 0.19, drift: 1.901, grades: ['J-55', 'L-80', 'N-80', 'C-95', 'P-110'], note: 'EUE Tubing 4.7# (الأكثر استخداماً)' },
      { weight: 5.8, id: 1.867, wall: 0.254, drift: 1.773, grades: ['L-80', 'N-80', 'C-95', 'P-110'] },
      { weight: 5.95, id: 1.867, wall: 0.254, drift: 1.773, grades: ['L-80', 'N-80', 'P-110'], note: 'EUE Tubing 5.95#' },
    ],
  },
  {
    fraction: '1.900"',
    od: 1.9,
    typeLabel: 'Slim Tubing (تيوبينق رفيع)',
    specs: [
      { weight: 2.75, id: 1.61, wall: 0.145, drift: 1.516, grades: ['J-55', 'L-80', 'N-80'], note: 'NUE Tubing 2.75#' },
      { weight: 2.9, id: 1.61, wall: 0.145, drift: 1.516, grades: ['J-55', 'L-80', 'N-80', 'P-110'], note: 'EUE Tubing 2.9#' },
    ],
  },
  {
    fraction: '1.660"',
    od: 1.66,
    typeLabel: 'Macaroni / Slim Tubing',
    specs: [
      { weight: 2.3, id: 1.38, wall: 0.14, drift: 1.286, grades: ['J-55', 'L-80', 'N-80'], note: 'NUE Tubing 2.3#' },
      { weight: 2.4, id: 1.38, wall: 0.14, drift: 1.286, grades: ['J-55', 'L-80', 'N-80'], note: 'EUE Tubing 2.4#' },
    ],
  },
];

const ALL_GRADES = ['الكل', 'H-40', 'J-55', 'K-55', 'L-80', 'N-80', 'C-95', 'P-110', 'Q-125'];

interface CasingSelectorProps {
  label: string;
  sublabel?: string;
  currentOD?: string;
  currentID: string;
  onSelect: (od: string, id: string, meta?: { fraction: string; weight: number; grade: string }) => void;
  variant?: 'previous' | 'current' | 'liner' | 'dp' | 'tubing';
  compact?: boolean;
}

export const CasingSelector: React.FC<CasingSelectorProps> = ({
  label,
  sublabel,
  currentOD = '',
  currentID,
  onSelect,
  variant = 'current',
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('الكل');
  const [chosenGrade, setChosenGrade] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isTubingMode = variant === 'tubing';

  // Select the appropriate catalog based on variant:
  // - 'tubing': ONLY Tubing sizes (4 1/2", 4", 3 1/2", 2 7/8", 2 3/8", 1.900", 1.660")
  // - 'liner': Liner sizes (10 3/4" down to 4 1/2")
  // - 'previous' / 'current' / 'dp': Casing sizes (30" down to 4 1/2")
  const activeCatalog = useMemo(() => {
    if (isTubingMode) {
      return API_TUBING_CATALOG;
    }
    if (variant === 'liner') {
      return API_CASING_CATALOG.filter((g) => g.od <= 13.375);
    }
    return API_CASING_CATALOG;
  }, [isTubingMode, variant]);

  // Find matching size group for currentOD or currentID
  const matchedGroup = useMemo(() => {
    const odNum = parseFloat(currentOD);
    if (!isNaN(odNum)) {
      const found = activeCatalog.find((g) => Math.abs(g.od - odNum) < 0.02);
      if (found) return found;
    }
    const idNum = parseFloat(currentID);
    if (!isNaN(idNum)) {
      const foundById = activeCatalog.find((g) =>
        g.specs.some((s) => Math.abs(s.id - idNum) < 0.015)
      );
      if (foundById) return foundById;
    }
    return isTubingMode ? activeCatalog[2] || activeCatalog[0] : activeCatalog[3] || activeCatalog[0];
  }, [currentOD, currentID, activeCatalog, isTubingMode]);

  const [activeFraction, setActiveFraction] = useState<string>(matchedGroup.fraction);

  // Sync activeFraction when modal opens
  const handleOpen = () => {
    const odNum = parseFloat(currentOD);
    const found = !isNaN(odNum)
      ? activeCatalog.find((g) => Math.abs(g.od - odNum) < 0.02)
      : activeCatalog.find((g) =>
          g.specs.some((s) => Math.abs(s.id - parseFloat(currentID)) < 0.015)
        );
    if (found) {
      setActiveFraction(found.fraction);
    } else if (activeCatalog.length > 0) {
      setActiveFraction(matchedGroup.fraction);
    }
    setIsOpen(true);
  };

  // Find matched spec for currentOD + currentID to display on the button badge
  const matchedSpecInfo = useMemo(() => {
    const odNum = parseFloat(currentOD);
    const idNum = parseFloat(currentID);
    if (isNaN(idNum)) return null;
    const group = !isNaN(odNum)
      ? activeCatalog.find((g) => Math.abs(g.od - odNum) < 0.02)
      : activeCatalog.find((g) => g.specs.some((s) => Math.abs(s.id - idNum) < 0.015));
    if (!group) return null;
    const spec = group.specs.find((s) => Math.abs(s.id - idNum) < 0.015);
    if (!spec) return { fraction: group.fraction, od: group.od, weight: null, grade: chosenGrade || null };
    return {
      fraction: group.fraction,
      od: group.od,
      weight: spec.weight,
      grade: chosenGrade && spec.grades.includes(chosenGrade) ? chosenGrade : spec.grades[0],
      id: spec.id,
    };
  }, [currentOD, currentID, chosenGrade, activeCatalog]);

  const currentSizeGroup = useMemo(() => {
    return activeCatalog.find((g) => g.fraction === activeFraction) || matchedGroup;
  }, [activeFraction, activeCatalog, matchedGroup]);

  const filteredSpecs = useMemo(() => {
    return currentSizeGroup.specs.filter((s) => {
      const matchesGrade = selectedGradeFilter === 'الكل' || s.grades.includes(selectedGradeFilter);
      const matchesSearch =
        !searchQuery.trim() ||
        s.weight.toString().includes(searchQuery.trim()) ||
        s.id.toString().includes(searchQuery.trim()) ||
        s.grades.some((g) => g.toLowerCase().includes(searchQuery.trim().toLowerCase()));
      return matchesGrade && matchesSearch;
    });
  }, [currentSizeGroup, selectedGradeFilter, searchQuery]);

  const themeClasses = {
    previous: {
      btn: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      accent: 'text-amber-400',
      activeTab: 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-600/25',
    },
    current: {
      btn: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-300',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      accent: 'text-blue-400',
      activeTab: 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/25',
    },
    liner: {
      btn: 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/30 text-pink-300',
      badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      accent: 'text-pink-400',
      activeTab: 'bg-pink-600 text-white border-pink-400 shadow-lg shadow-pink-600/25',
    },
    dp: {
      btn: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      accent: 'text-emerald-400',
      activeTab: 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/25',
    },
    tubing: {
      btn: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      accent: 'text-emerald-400',
      activeTab: 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/25',
    },
  }[variant];

  const handlePickSpec = (spec: CasingWeightSpec, specificGrade?: string) => {
    const gradeToUse =
      specificGrade ||
      (selectedGradeFilter !== 'الكل' && spec.grades.includes(selectedGradeFilter)
        ? selectedGradeFilter
        : spec.grades[0]);
    setChosenGrade(gradeToUse);
    onSelect(String(currentSizeGroup.od), String(spec.id), {
      fraction: currentSizeGroup.fraction,
      weight: spec.weight,
      grade: gradeToUse,
    });
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`w-full flex items-center justify-between gap-2 rounded-2xl border transition-all active:scale-[0.99] ${
          compact ? 'px-3 py-2 text-[10px]' : 'px-4 py-2.5 text-xs'
        } ${themeClasses.btn}`}
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <ChevronDown className="w-4 h-4 opacity-80" />
          <span className="text-[10px] font-black opacity-80">
            {isTubingMode ? 'قائمة التيوبينق' : variant === 'liner' ? 'قائمة اللاينر' : 'قائمة الكيسينق'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end text-right">
          {matchedSpecInfo ? (
            <div className="flex items-center gap-1.5 flex-wrap justify-end" dir="ltr">
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${themeClasses.badge}`}>
                {matchedSpecInfo.fraction}
              </span>
              {matchedSpecInfo.weight && (
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-slate-800/90 text-white border border-slate-700">
                  {matchedSpecInfo.weight} lb/ft
                </span>
              )}
              {matchedSpecInfo.grade && (
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {matchedSpecInfo.grade}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 font-bold">اختر المقاس والوزن والقريد</span>
          )}
          <div className="flex items-center gap-1">
            <span className="font-black text-white text-[11px]">{label}</span>
            <Layers className={`w-3.5 h-3.5 ${themeClasses.accent}`} />
          </div>
        </div>
      </button>

      {/* Floating Modal / Popover */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-[#0f172a] border border-slate-700/80 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="text-right">
                  <h3 className="text-sm sm:text-base font-black text-white flex items-center justify-end gap-2">
                    <span>{label}</span>
                    <Layers className={`w-4 h-4 ${themeClasses.accent}`} />
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    {sublabel ||
                      (isTubingMode
                        ? 'اختر مقاس التيوبينق (مثال 3 1/2" أو 2 7/8") والنوع (Grade) والوزن (lb/ft)'
                        : 'اختر مقاس الكيسينق (مثال 18 5/8") والنوع (Grade) والوزن (lb/ft)')}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar text-right">
                {/* Step 1: Select Size */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] text-slate-400 font-bold" dir="ltr">
                      OD = {currentSizeGroup.od}" ({currentSizeGroup.typeLabel})
                    </span>
                    <label className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                      <span>
                        {isTubingMode
                          ? '1. اختر مقاس التيوبينق (Tubing Size)'
                          : variant === 'liner'
                          ? '1. اختر مقاس اللاينر (Liner Size)'
                          : '1. اختر مقاس الكيسينق (Casing Size)'}
                      </span>
                      <CircleDot className="w-3.5 h-3.5 text-blue-400" />
                    </label>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5" dir="ltr">
                    {activeCatalog.map((group) => {
                      const isSelected = group.fraction === activeFraction;
                      return (
                        <button
                          key={group.fraction}
                          type="button"
                          onClick={() => setActiveFraction(group.fraction)}
                          className={`py-2 px-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                            isSelected
                              ? themeClasses.activeTab
                              : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          <span className="text-xs font-black leading-tight">{group.fraction}</span>
                          <span className={`text-[9px] font-bold ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                            {group.od}"
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Filter by Grade (قريد الكيسينق) */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] text-slate-500 font-bold">تصفية حسب سبيكة الحديد (API Grade)</span>
                    <label className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                      <span>2. اختر النوع / القريد (Grade)</span>
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar" dir="ltr">
                    {ALL_GRADES.map((grade) => {
                      const active = selectedGradeFilter === grade;
                      return (
                        <button
                          key={grade}
                          type="button"
                          onClick={() => setSelectedGradeFilter(grade)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black border shrink-0 transition-all ${
                            active
                              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                              : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {grade}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Select Weight (الوزن lb/ft) & Exact ID */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between gap-2 px-1">
                    <div className="relative flex-1 max-w-[180px]">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث بالوزن أو ID..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-1.5 pl-8 pr-3 text-[10px] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <label className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                      <span>3. اختر الوزن (Weight) والقطر الداخلي (ID)</span>
                      <Weight className="w-3.5 h-3.5 text-amber-400" />
                    </label>
                  </div>

                  <div className="space-y-2">
                    {filteredSpecs.length === 0 ? (
                      <div className="p-6 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs font-bold">
                        لا توجد أوزان مطابقة لهذا القريد في مقاس {currentSizeGroup.fraction}. جرب اختيار &quot;الكل&quot;.
                      </div>
                    ) : (
                      filteredSpecs.map((spec) => {
                        const isCurrentlySelected =
                          Math.abs(parseFloat(currentOD) - currentSizeGroup.od) < 0.02 &&
                          Math.abs(parseFloat(currentID) - spec.id) < 0.015;

                        return (
                          <div
                            key={`${currentSizeGroup.od}-${spec.weight}-${spec.id}`}
                            onClick={() => handlePickSpec(spec)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                              isCurrentlySelected
                                ? 'bg-blue-600/15 border-blue-500/60 shadow-lg'
                                : 'bg-slate-900/60 border-slate-800 hover:border-slate-600 hover:bg-slate-800/50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2" dir="ltr">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-white bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
                                  {spec.weight} <span className="text-[10px] text-amber-400 font-bold">lb/ft</span>
                                </span>
                                {spec.note && (
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                    {spec.note}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-right">
                                <div>
                                  <span className="text-[9px] text-slate-400 font-bold block">القطر الداخلي (ID)</span>
                                  <span className="text-base font-black text-emerald-400">{spec.id.toFixed(3)}"</span>
                                </div>
                                {isCurrentlySelected && (
                                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Grades pills & secondary specs */}
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80" dir="ltr">
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-[9px] text-slate-500 font-bold mr-1">Grades:</span>
                                {spec.grades.map((g) => {
                                  const isGradeActive =
                                    (isCurrentlySelected && chosenGrade === g) || selectedGradeFilter === g;
                                  return (
                                    <button
                                      key={g}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePickSpec(spec, g);
                                      }}
                                      className={`px-2 py-0.5 rounded-lg text-[9px] font-black border transition-all ${
                                        isGradeActive
                                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                          : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:border-emerald-400 hover:text-emerald-300'
                                      }`}
                                    >
                                      {g}
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="text-[9px] text-slate-500 font-bold shrink-0">
                                Wall: {spec.wall}" • Drift: {spec.drift}"
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black"
                >
                  إغلاق
                </button>
                <span>اضغط على أي وزن أو قريد لتعبئة OD و ID تلقائياً</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CasingSelector;
