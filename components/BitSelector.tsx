import React, { useState, useMemo } from 'react';
import { Disc, ChevronDown, Check, X, Search, Sparkles, Compass, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface BitTypeOption {
  id: string;
  nameAr: string;
  nameEn: string;
  shortTag: string;
  iadcOrSpec: string;
  formationAr: string;
  color: string;
}

export interface BitSizeItem {
  fraction: string; // e.g. '12 1/4"'
  diameter: number; // e.g. 12.25
  sectionAr: string; // e.g. 'الحفرة المتوسطة / الإنتاجية'
  sectionEn: string; // e.g. 'Intermediate / Production'
  matchingCasing: string; // e.g. '9 5/8"'
  commonTypes: string[]; // IDs of BitTypeOption
  popular?: boolean;
}

export const BIT_TYPES_CATALOG: BitTypeOption[] = [
  {
    id: 'PDC_MATRIX',
    nameAr: 'رأس حفر PDC (جسم ماتريكس)',
    nameEn: 'PDC Bit - Matrix Body (5-7 Blades)',
    shortTag: 'PDC Matrix',
    iadcOrSpec: 'M323 / M432',
    formationAr: 'التكوينات المتوسطة والصلبة والطفل (Shale / Limestone)',
    color: 'cyan',
  },
  {
    id: 'PDC_STEEL',
    nameAr: 'رأس حفر PDC (جسم فولاذي)',
    nameEn: 'PDC Bit - Steel Body (4-6 Blades)',
    shortTag: 'PDC Steel',
    iadcOrSpec: 'S222 / S322',
    formationAr: 'التكوينات الناعمة إلى المتوسطة وسرعة اختراق عالية (High ROP)',
    color: 'blue',
  },
  {
    id: 'TRICONE_TCI',
    nameAr: 'ثلاثي المخاريط فصوص تنجستن (Tricone TCI)',
    nameEn: 'Roller Cone / Tricone TCI (Insert Bit)',
    shortTag: 'Tricone TCI',
    iadcOrSpec: 'IADC 517 / 537 / 617',
    formationAr: 'التكوينات الصلبة والكاشطة والمتشققة (Hard / Abrasive)',
    color: 'amber',
  },
  {
    id: 'TRICONE_MILL',
    nameAr: 'ثلاثي المخاريط أسنان فولاذية (Mill Tooth)',
    nameEn: 'Roller Cone / Tricone Mill Tooth (Steel)',
    shortTag: 'Tricone Mill Tooth',
    iadcOrSpec: 'IADC 115 / 117 / 135',
    formationAr: 'السكاشن العلوية والتكوينات الرخوة (Surface / Soft Formations)',
    color: 'orange',
  },
  {
    id: 'HYBRID_KYMERA',
    nameAr: 'رأس حفر هجين (Hybrid PDC + Roller)',
    nameEn: 'Hybrid Bit (PDC + Roller Cone)',
    shortTag: 'Hybrid Bit',
    iadcOrSpec: 'Hybrid Dual-Action',
    formationAr: 'التكوينات المتداخلة الصعبة والارتجاجات العالية (Interbedded)',
    color: 'purple',
  },
  {
    id: 'BICENTER_HO',
    nameAr: 'موسع حفرة / باي سنتر (Bi-Center / Hole Opener)',
    nameEn: 'Bi-Center & Hole Opener Bit',
    shortTag: 'Bi-Center / HO',
    iadcOrSpec: 'Underreaming / Enlarging',
    formationAr: 'توسيع القطر أسفل الكيسينق وعمليات التوسيع الخاصة',
    color: 'emerald',
  },
  {
    id: 'CORE_IMPREG',
    nameAr: 'رأس حفر لُبّي / ماسي (Core / Impreg Bit)',
    nameEn: 'Diamond Impregnated / Core Bit',
    shortTag: 'Core / Impreg',
    iadcOrSpec: 'Natural / Impreg Diamond',
    formationAr: 'أخذ العينات اللبية والتكوينات شديدة الصلابة (Coring / Ultra-Hard)',
    color: 'rose',
  },
];

export const STANDARD_BIT_SIZES: BitSizeItem[] = [
  {
    fraction: '36"',
    diameter: 36.0,
    sectionAr: 'حفرة الكوندكتور (Conductor)',
    sectionEn: 'Conductor Hole',
    matchingCasing: '30"',
    commonTypes: ['TRICONE_MILL', 'BICENTER_HO'],
  },
  {
    fraction: '26"',
    diameter: 26.0,
    sectionAr: 'حفرة السطح الكبيرة (Surface)',
    sectionEn: 'Surface Hole',
    matchingCasing: '20"',
    commonTypes: ['TRICONE_MILL', 'TRICONE_TCI', 'PDC_STEEL'],
    popular: true,
  },
  {
    fraction: '24"',
    diameter: 24.0,
    sectionAr: 'حفرة السطح القياسية (Surface)',
    sectionEn: 'Surface Hole',
    matchingCasing: '18 5/8" / 20"',
    commonTypes: ['TRICONE_MILL', 'TRICONE_TCI', 'PDC_STEEL'],
    popular: true,
  },
  {
    fraction: '22"',
    diameter: 22.0,
    sectionAr: 'حفرة السطح (Surface)',
    sectionEn: 'Surface Hole',
    matchingCasing: '18 5/8"',
    commonTypes: ['TRICONE_MILL', 'TRICONE_TCI', 'PDC_STEEL'],
  },
  {
    fraction: '17 1/2"',
    diameter: 17.5,
    sectionAr: 'حفرة السطح / المتوسط',
    sectionEn: 'Surface / Intermediate Hole',
    matchingCasing: '13 3/8"',
    commonTypes: ['PDC_STEEL', 'PDC_MATRIX', 'TRICONE_MILL', 'TRICONE_TCI'],
    popular: true,
  },
  {
    fraction: '16"',
    diameter: 16.0,
    sectionAr: 'حفرة الكيسينق المتوسط',
    sectionEn: 'Intermediate Hole',
    matchingCasing: '13 3/8"',
    commonTypes: ['PDC_STEEL', 'PDC_MATRIX', 'TRICONE_TCI', 'TRICONE_MILL'],
    popular: true,
  },
  {
    fraction: '14 3/4"',
    diameter: 14.75,
    sectionAr: 'حفرة متوسطة (Intermediate)',
    sectionEn: 'Intermediate Hole',
    matchingCasing: '11 3/4" / 10 3/4"',
    commonTypes: ['PDC_MATRIX', 'PDC_STEEL', 'TRICONE_TCI'],
  },
  {
    fraction: '12 1/4"',
    diameter: 12.25,
    sectionAr: 'الحفرة المتوسطة / الإنتاجية',
    sectionEn: 'Intermediate / Production Hole',
    matchingCasing: '9 5/8"',
    commonTypes: ['PDC_MATRIX', 'PDC_STEEL', 'TRICONE_TCI', 'HYBRID_KYMERA'],
    popular: true,
  },
  {
    fraction: '10 5/8"',
    diameter: 10.625,
    sectionAr: 'حفرة متوسطة خاصة',
    sectionEn: 'Intermediate Hole',
    matchingCasing: '8 5/8" / 7 5/8"',
    commonTypes: ['PDC_MATRIX', 'TRICONE_TCI', 'BICENTER_HO'],
  },
  {
    fraction: '9 7/8"',
    diameter: 9.875,
    sectionAr: 'حفرة إنتاجية',
    sectionEn: 'Production Hole',
    matchingCasing: '7 5/8" / 7"',
    commonTypes: ['PDC_MATRIX', 'TRICONE_TCI'],
  },
  {
    fraction: '8 1/2"',
    diameter: 8.5,
    sectionAr: 'حفرة الإنتاج واللاينر القياسية',
    sectionEn: 'Production / Liner Hole',
    matchingCasing: '7"',
    commonTypes: ['PDC_MATRIX', 'PDC_STEEL', 'TRICONE_TCI', 'HYBRID_KYMERA', 'CORE_IMPREG'],
    popular: true,
  },
  {
    fraction: '8 3/8"',
    diameter: 8.375,
    sectionAr: 'حفرة الإنتاج واللاينر',
    sectionEn: 'Production / Liner Hole',
    matchingCasing: '7"',
    commonTypes: ['PDC_MATRIX', 'TRICONE_TCI', 'CORE_IMPREG'],
  },
  {
    fraction: '7 7/8"',
    diameter: 7.875,
    sectionAr: 'حفرة إنتاجية',
    sectionEn: 'Production Hole',
    matchingCasing: '5 1/2"',
    commonTypes: ['PDC_MATRIX', 'PDC_STEEL', 'TRICONE_TCI'],
  },
  {
    fraction: '6 3/4"',
    diameter: 6.75,
    sectionAr: 'حفرة لاينر / إنتاج',
    sectionEn: 'Slim Liner Hole',
    matchingCasing: '5" / 5 1/2"',
    commonTypes: ['PDC_MATRIX', 'TRICONE_TCI', 'BICENTER_HO'],
  },
  {
    fraction: '6 1/8"',
    diameter: 6.125,
    sectionAr: 'حفرة المكمن واللاينر (Reservoir)',
    sectionEn: 'Reservoir / Liner Hole',
    matchingCasing: '4 1/2" / 5"',
    commonTypes: ['PDC_MATRIX', 'TRICONE_TCI', 'CORE_IMPREG'],
    popular: true,
  },
  {
    fraction: '6"',
    diameter: 6.0,
    sectionAr: 'حفرة المكمن واللاينر (Reservoir)',
    sectionEn: 'Reservoir / Liner Hole',
    matchingCasing: '4 1/2"',
    commonTypes: ['PDC_MATRIX', 'TRICONE_TCI', 'CORE_IMPREG'],
    popular: true,
  },
  {
    fraction: '5 7/8"',
    diameter: 5.875,
    sectionAr: 'حفرة رفيعة (Slim Hole)',
    sectionEn: 'Slim Hole',
    matchingCasing: '4 1/2"',
    commonTypes: ['PDC_MATRIX', 'TRICONE_TCI'],
  },
  {
    fraction: '4 3/4"',
    diameter: 4.75,
    sectionAr: 'حفرة تنظيف / لاينر رفيع',
    sectionEn: 'Workover / Ultra-Slim',
    matchingCasing: '3 1/2"',
    commonTypes: ['PDC_MATRIX', 'TRICONE_TCI', 'TRICONE_MILL'],
  },
  {
    fraction: '4 1/8"',
    diameter: 4.125,
    sectionAr: 'حفرة أنابيب إنتاج (Thru-Tubing)',
    sectionEn: 'Thru-Tubing Hole',
    matchingCasing: '2 7/8"',
    commonTypes: ['PDC_MATRIX', 'TRICONE_MILL'],
  },
];

interface BitSelectorProps {
  label?: string;
  currentHoleSize: string;
  selectedBitTypeId?: string;
  onSelect: (
    diameter: string,
    meta: {
      fraction: string;
      bitType: BitTypeOption;
      matchingCasing: string;
      sectionAr: string;
    }
  ) => void;
}

export const BitSelector: React.FC<BitSelectorProps> = ({
  label = 'اختيار رأس الحفر / البتة (Drill Bit)',
  currentHoleSize,
  selectedBitTypeId = 'PDC_MATRIX',
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeBitTypeId, setActiveBitTypeId] = useState<string>(selectedBitTypeId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPopularOnly, setFilterPopularOnly] = useState<boolean>(false);

  const currentDiaNum = parseFloat(currentHoleSize);

  const matchedSize = useMemo(() => {
    if (isNaN(currentDiaNum)) return null;
    return STANDARD_BIT_SIZES.find((b) => Math.abs(b.diameter - currentDiaNum) < 0.02) || null;
  }, [currentDiaNum]);

  const activeBitType = useMemo(() => {
    return (
      BIT_TYPES_CATALOG.find((t) => t.id === (selectedBitTypeId || activeBitTypeId)) ||
      BIT_TYPES_CATALOG[0]
    );
  }, [selectedBitTypeId, activeBitTypeId]);

  const modalBitType = useMemo(() => {
    return BIT_TYPES_CATALOG.find((t) => t.id === activeBitTypeId) || BIT_TYPES_CATALOG[0];
  }, [activeBitTypeId]);

  const filteredSizes = useMemo(() => {
    return STANDARD_BIT_SIZES.filter((item) => {
      if (filterPopularOnly && !item.popular) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return (
        item.fraction.toLowerCase().includes(q) ||
        item.diameter.toString().includes(q) ||
        item.sectionAr.toLowerCase().includes(q) ||
        item.matchingCasing.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, filterPopularOnly]);

  const handleChooseBit = (sizeItem: BitSizeItem) => {
    onSelect(sizeItem.diameter.toString(), {
      fraction: sizeItem.fraction,
      bitType: modalBitType,
      matchingCasing: sizeItem.matchingCasing,
      sectionAr: sizeItem.sectionAr,
    });
    setIsOpen(false);
  };

  return (
    <div className="w-full" dir="rtl">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setActiveBitTypeId(selectedBitTypeId || 'PDC_MATRIX');
          setIsOpen(true);
        }}
        className="w-full rounded-2xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-200 px-3.5 py-2.5 transition-all flex items-center justify-between gap-2 group shadow-sm"
      >
        <div className="flex items-center gap-2 text-right">
          <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <Disc className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          </div>
          <div>
            <span className="block text-[11px] font-black text-white leading-tight">{label}</span>
            <span className="block text-[9px] text-slate-400 font-bold">
              اضغط لاختيار نوع البتة (PDC / Tricone) وحجم قطر الحفر القياسي
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="px-2.5 py-1 rounded-xl border bg-red-500/20 text-red-200 border-red-500/30 text-[10px] font-black flex items-center gap-1.5">
            <span dir="ltr">{matchedSize ? matchedSize.fraction : `${currentHoleSize}"`}</span>
            <span className="opacity-60">|</span>
            <span>{activeBitType.shortTag}</span>
          </div>
          <ChevronDown className="w-4 h-4 opacity-70 group-hover:translate-y-0.5 transition-transform" />
        </div>
      </button>

      {/* Floating Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg bg-[#0f172a] border border-slate-700/80 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
              dir="rtl"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Disc className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm sm:text-base font-black text-white">
                      دليل رؤوس الحفر وأقطار البئر (Drill Bits Catalog)
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold">
                      اختر نوع البتة (PDC / Tricone / Bi-Center) ثم اختر مقاس الحفرة بالإنش
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step 1: Select Bit Type */}
              <div className="p-3.5 bg-slate-900/50 border-b border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                    <Wrench className="w-3 h-3 text-red-400" />
                    1. اختر نوع رأس الحفر (Bit Type):
                  </span>
                  <span className="text-[10px] font-black text-red-400" dir="ltr">
                    {modalBitType.iadcOrSpec}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {BIT_TYPES_CATALOG.map((bt) => {
                    const isSelected = bt.id === activeBitTypeId;
                    return (
                      <button
                        key={bt.id}
                        type="button"
                        onClick={() => setActiveBitTypeId(bt.id)}
                        className={`px-3 py-2 rounded-xl border text-right shrink-0 transition-all ${
                          isSelected
                            ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/25'
                            : 'bg-slate-800/70 text-slate-300 border-slate-700/70 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black" dir="ltr">
                            {bt.shortTag}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span
                          className={`block text-[9px] font-bold mt-0.5 ${
                            isSelected ? 'text-red-100' : 'text-slate-400'
                          }`}
                        >
                          {bt.nameAr}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Bit Type Info Strip */}
                <div className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-300 font-bold">{modalBitType.formationAr}</span>
                  <span className="text-red-400 font-black shrink-0 mr-2" dir="ltr">
                    {modalBitType.shortTag}
                  </span>
                </div>
              </div>

              {/* Step 2: Filter & Search Bit Sizes */}
              <div className="px-4 py-2.5 bg-slate-900/30 border-b border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFilterPopularOnly(false)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all ${
                      !filterPopularOnly
                        ? 'bg-red-500 text-white border-red-400'
                        : 'bg-slate-800/60 text-slate-400 border-slate-700'
                    }`}
                  >
                    كل المقاسات ({STANDARD_BIT_SIZES.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterPopularOnly(true)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all flex items-center gap-1 ${
                      filterPopularOnly
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-800/60 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    الأكثر استخداماً
                  </button>
                </div>

                <div className="relative w-40">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث (مثلاً 12.25 أو 8 1/2)..."
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pr-8 pl-2 py-1 text-[10px] text-white placeholder:text-slate-600 font-bold focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Bit Sizes Grid */}
              <div className="p-4 overflow-y-auto space-y-2 flex-1">
                <div className="flex items-center justify-between px-1 mb-1">
                  <span className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-red-400" />
                    2. اختر مقاس رأس الحفر (Bit Size) لتعبئة قطر الـ Open Hole:
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredSizes.map((item) => {
                    const isCurrentSize = Math.abs(item.diameter - currentDiaNum) < 0.02;
                    return (
                      <button
                        key={item.fraction}
                        type="button"
                        onClick={() => handleChooseBit(item)}
                        className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between gap-2 group ${
                          isCurrentSize
                            ? 'bg-red-500/15 border-red-500 shadow-lg shadow-red-500/10'
                            : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-12 h-11 rounded-xl flex flex-col items-center justify-center border font-black ${
                              isCurrentSize
                                ? 'bg-red-500 text-white border-red-300'
                                : 'bg-slate-950 text-red-400 border-slate-800 group-hover:border-red-500/40'
                            }`}
                          >
                            <span className="text-xs leading-none" dir="ltr">
                              {item.fraction}
                            </span>
                            <span className="text-[8px] opacity-80 mt-0.5" dir="ltr">
                              {item.diameter}"
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-white">
                                بتة {item.fraction}
                              </span>
                              {item.popular && (
                                <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                  شائع
                                </span>
                              )}
                            </div>
                            <span className="block text-[9px] text-slate-400 font-bold mt-0.5">
                              {item.sectionAr}
                            </span>
                            <span className="block text-[9px] text-cyan-400 font-bold mt-0.5">
                              يناسب كيسينق: <strong dir="ltr">{item.matchingCasing}</strong>
                            </span>
                          </div>
                        </div>

                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                            isCurrentSize
                              ? 'bg-red-500 border-red-300 text-white'
                              : 'border-slate-700 text-transparent group-hover:border-slate-500'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-bold px-5">
                <span>يتم تعبئة قطر الحفرة (Hole Size) تلقائياً عند الاختيار</span>
                <span dir="ltr" className="text-red-400 font-black">
                  API / IADC Bit Standards
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BitSelector;
