
import ExcelJS from 'exceljs';
import { DrillingData } from '../types';

export async function modifyExcelTemplate(templateBuffer: ArrayBuffer, data: DrillingData): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(templateBuffer);
  const worksheet = workbook.getWorksheet(1) || workbook.worksheets[0];

  const redFont: Partial<ExcelJS.Font> = { color: { argb: 'FFFF0000' }, bold: true };
  const fill = (row: number, col: number, val: any) => {
    const cell = worksheet.getCell(row, col);
    cell.value = val;
    cell.font = redFont;
    // Check if master exists for merged cells
    if ((cell as any)._master && (cell as any)._master !== cell) {
        (cell as any)._master.font = redFont;
    }
  };

  // تعبئة البيانات في الصفوف المطلوبة (57 و 59)
  fill(57, 5, data.mudWeight);
  fill(59, 15, (parseFloat(data.dailyMudCost || "0") * 6.333).toFixed(2)); // تحويل العملة
  // ... يمكنك إضافة باقي الخانات هنا بناءً على التنسيق السابق
  
  return await workbook.xlsx.writeBuffer() as ArrayBuffer;
}
