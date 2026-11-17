
export const CONSTANTS = {
  PUMP_METHOD_1: 0.000243,
  PUMP_METHOD_2: 4115.2,
  CEMENT_CONVERSION: 1029.4,
  BBL_TO_GAL: 42
};

export const CASING_DATA = [
  {
    nominal: '18 5/8"',
    od: 18.625,
    weights: [
      { lb: '87.5 lb/ft', id: 17.755 },
    ]
  },
  {
    nominal: '13 3/8"',
    od: 13.375,
    weights: [
      { lb: '54.5 lb/ft', id: 12.615 },
      { lb: '61 lb/ft', id: 12.515 },
      { lb: '68 lb/ft', id: 12.415 },
      { lb: '72 lb/ft', id: 12.347 }
    ]
  },
  {
    nominal: '9 5/8"',
    od: 9.625,
    weights: [
      { lb: '36 lb/ft', id: 8.921 },
      { lb: '40 lb/ft', id: 8.835 },
      { lb: '43.5 lb/ft', id: 8.755 },
      { lb: '47 lb/ft', id: 8.681 },
      { lb: '53.5 lb/ft', id: 8.535 }
    ]
  },
  {
    nominal: '7"',
    od: 7.000,
    weights: [
      { lb: '23 lb/ft', id: 6.366 },
      { lb: '26 lb/ft', id: 6.276 },
      { lb: '29 lb/ft', id: 6.184 },
      { lb: '32 lb/ft', id: 6.094 }
    ]
  }
];

export const FORMULAS = {
  TOTAL_CEMENT: {
    title: 'إجمالي السيمنت (Total Cement)',
    law: 'Total = V_1 + V_2 + V_3',
    variables: [
      { description: 'V1: حجم الفراغ الحلقي (Annular Volume)', color: '#3b82f6' },
      { description: 'V2: حجم السيمنت في الـ Rat Hole', color: '#60a5fa' },
      { description: 'V3: حجم السيمنت في الـ Shoe Track', color: '#93c5fd' }
    ]
  },
  ANNULAR: {
    title: 'الفراغ الحلقي (Annular Volume)',
    law: 'V = \\frac{(Hole^2 - Casing^2)}{1029.4} \\times Depth',
    variables: [
      { description: 'Hole: حجم الفتحة (إنش)' },
      { description: 'Casing: القطر الخارجي للكيسنج (إنش)' }
    ]
  }
};
