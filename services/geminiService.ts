import { DrillingData } from "../types";

// تحليل ملفات ZIP لإنشاء تقرير نهائي
export async function analyzeReportsForFinal(zipSummary: string, docxTemplateText: string): Promise<any> {
  try {
    const response = await fetch("/api/analyze-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zipSummary, docxTemplateText }),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "فشل في تحليل التقارير عبر الذكاء الاصطناعي");
    }
    return await response.json();
  } catch (error: any) {
    console.error("Error in analyzeReportsForFinal:", error);
    throw new Error(error.message || "تعذر الاتصال بمركز تحليل التقارير");
  }
}

// استخراج بيانات DDR من PDF
export async function extractDrillingDataFromPdf(pdfBase64: string): Promise<DrillingData> {
  try {
    const response = await fetch("/api/extract-drilling-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdfBase64 }),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "فشل في استخراج بيانات التقرير");
    }
    return await response.json();
  } catch (error: any) {
    console.error("Error in extractDrillingDataFromPdf:", error);
    throw new Error(error.message || "تعذر الاتصال بخدمة تحليل ملفات PDF");
  }
}
