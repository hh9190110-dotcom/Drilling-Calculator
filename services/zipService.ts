
import JSZip from 'jszip';
import ExcelJS from 'exceljs';

export async function extractDataFromZip(zipBuffer: ArrayBuffer) {
  const zip = new JSZip();
  const contents = await zip.loadAsync(zipBuffer);
  const reports = [];
  const excelFiles = Object.keys(contents.files).filter(n => n.endsWith('.xlsx'));

  for (const filename of excelFiles) {
    const fileData = await contents.files[filename].async('arraybuffer');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileData);
    const worksheet = workbook.getWorksheet(1);
    const dateValue = worksheet ? worksheet.getCell(44, 19).value : 'Unknown';
    reports.push({ filename, date: dateValue });
  }
  return reports;
}

export async function getZipTextSummary(zipBuffer: ArrayBuffer): Promise<string> {
  const zip = new JSZip();
  const contents = await zip.loadAsync(zipBuffer);
  let summary = "DRILLING REPORTS SUMMARY:\n";
  const excelFiles = Object.keys(contents.files).filter(n => n.endsWith('.xlsx'));
  
  for (const filename of excelFiles) {
    summary += `- File: ${filename}\n`;
    // Optional: extract some key cells to summary
  }
  return summary;
}
