
import React, { useState } from "react";
import { LayoutGrid, FileCheck, Loader2, Upload, FileDown, AlertCircle, FileText } from "lucide-react";
import { extractDrillingDataFromPdf, analyzeReportsForFinal } from "../services/geminiService";
import { modifyExcelTemplate } from "../services/excelService";
import { generateFinalReport, extractDocxText } from "../services/docxService";
import { getZipTextSummary } from "../services/zipService";
import { DrillingData, CalculationRecord, CalcType } from "../types";

interface DrillingReportProProps {
  onResult: (record: CalculationRecord) => void;
  initialData?: CalculationRecord | null;
}

export default function DrillingReportPro({ onResult, initialData }: DrillingReportProProps) {
  const [activeTab, setActiveTab] = useState<'drill' | 'final'>('drill');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  
  // Drilling State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [xlsxTemplate, setXlsxTemplate] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<DrillingData | null>(null);

  React.useEffect(() => {
    if (initialData && initialData.type === CalcType.FINAL_REPORT && initialData.inputs.extractedData) {
      setExtractedData(initialData.inputs.extractedData as any);
    }
  }, [initialData]);

  // Final Report State
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [docxTemplate, setDocxTemplate] = useState<File | null>(null);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setLoading(true);
      setStatus('جاري تحليل ملف PDF بالذكاء الاصطناعي...');
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const data = await extractDrillingDataFromPdf(base64);
          setExtractedData(data);
          setLoading(false);
          setStatus('تم استخراج البيانات بنجاح.');
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error(err);
        setStatus('خطأ في تحليل الملف.');
        setLoading(false);
      }
    }
  };

  const processDrillingExcel = async () => {
    if (!xlsxTemplate || !extractedData) return;
    setLoading(true);
    setStatus('جاري تعبئة قالب الإكسيل...');
    try {
      const buffer = await xlsxTemplate.arrayBuffer();
      const resultBuffer = await modifyExcelTemplate(buffer, extractedData);
      
      const blob = new Blob([resultBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `updated_${xlsxTemplate.name}`;
      a.click();
      
      onResult({
        id: Date.now().toString(),
        type: CalcType.FINAL_REPORT,
        title: 'تعديل تقرير الحفر',
        inputs: { 
          well: extractedData.wellName || '', 
          date: extractedData.date || '',
          extractedData: extractedData as any 
        },
        result: 0,
        timestamp: Date.now()
      });
      
      setStatus('تم تحميل الملف المعدل.');
    } catch (err) {
      console.error(err);
      setStatus('خطأ في معالجة الإكسيل.');
    }
    setLoading(false);
  };

  const processFinalReport = async () => {
    if (!zipFile || !docxTemplate) return;
    setLoading(true);
    setStatus('جاري إنشاء التقرير النهائي بالذكاء الاصطناعي...');
    try {
      const zipBuffer = await zipFile.arrayBuffer();
      const docxBuffer = await docxTemplate.arrayBuffer();
      
      const zipSummary = await getZipTextSummary(zipBuffer);
      const docxText = await extractDocxText(docxBuffer);
      
      const analyzedData = await analyzeReportsForFinal(zipSummary, docxText);
      const finalDocxBuffer = await generateFinalReport(docxBuffer, analyzedData);
      
      const blob = new Blob([finalDocxBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Final_Report.docx`;
      a.click();
      
      setStatus('تم إنشاء التقرير النهائي بنجاح.');
    } catch (err) {
      console.error(err);
      setStatus('خطأ في إنشاء التقرير.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] text-slate-100 font-tajawal" dir="rtl">
      <div className="flex gap-4 mb-8 justify-center bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
        <button 
          onClick={() => setActiveTab('drill')} 
          className={`px-8 py-4 rounded-xl font-black transition-all flex items-center gap-2 ${activeTab === 'drill' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-transparent text-slate-400 hover:text-white'}`}
        >
          <FileDown className="w-5 h-5" />
          تعديل التقرير
        </button>
        <button 
          onClick={() => setActiveTab('final')} 
          className={`px-8 py-4 rounded-xl font-black transition-all flex items-center gap-2 ${activeTab === 'final' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-transparent text-slate-400 hover:text-white'}`}
        >
          <FileCheck className="w-5 h-5" />
          التقرير النهائي
        </button>
      </div>

      <div className="bg-slate-900/40 p-8 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        {loading && (
          <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center rounded-[3rem]">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-6" />
            <h3 className="text-xl font-black text-white italic">{status}</h3>
            <p className="text-slate-400 mt-2">يرجى الانتظار، هذه العملية قد تستغرق بضع ثواني...</p>
          </div>
        )}

        {activeTab === 'drill' ? (
          <div className="space-y-8">
            <div className="text-right">
              <h2 className="text-3xl font-black italic bg-gradient-to-l from-white to-slate-400 bg-clip-text text-transparent uppercase tracking-tight">Daily Report Auto-Fill</h2>
              <p className="text-blue-500 text-xs font-bold uppercase tracking-widest mt-1">تعبئة تقرير الحفر اليومي بالذكاء الاصطناعي</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-black text-slate-400 italic">1. ارفع تقرير الماد (PDF)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handlePdfUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="bg-slate-800/50 border-2 border-dashed border-slate-700 p-8 rounded-3xl flex flex-col items-center justify-center group-hover:border-blue-500 transition-colors">
                    <Upload className="w-10 h-10 text-slate-500 mb-2 group-hover:text-blue-500" />
                    <span className="text-xs font-bold text-slate-400">{pdfFile ? pdfFile.name : 'اختر ملف PDF'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-black text-slate-400 italic">2. ارفع قالب الإكسيل (XLSX)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept=".xlsx" 
                    onChange={(e) => setXlsxTemplate(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="bg-slate-800/50 border-2 border-dashed border-slate-700 p-8 rounded-3xl flex flex-col items-center justify-center group-hover:border-emerald-500 transition-colors">
                    <LayoutGrid className="w-10 h-10 text-slate-500 mb-2 group-hover:text-emerald-500" />
                    <span className="text-xs font-bold text-slate-400">{xlsxTemplate ? xlsxTemplate.name : 'اختر قالب Excel'}</span>
                  </div>
                </div>
              </div>
            </div>

            {extractedData && (
               <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-6">
                  <h4 className="font-black text-blue-400 mb-4 flex items-center gap-2">
                    <FileCheck className="w-5 h-5" /> البيانات المستخرجة:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                     <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                        <p className="text-[10px] text-slate-500 font-bold">اسم البئر</p>
                        <p className="text-sm font-black">{extractedData.wellName || '---'}</p>
                     </div>
                     <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                        <p className="text-[10px] text-slate-500 font-bold">وزن الطين</p>
                        <p className="text-sm font-black">{extractedData.mudWeight || '---'}</p>
                     </div>
                     <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                        <p className="text-[10px] text-slate-500 font-bold">تكلفة الطين اليومية</p>
                        <p className="text-sm font-black">{extractedData.dailyMudCost || '---'}</p>
                     </div>
                  </div>
               </div>
            )}

            <button 
              disabled={!xlsxTemplate || !extractedData || loading}
              onClick={processDrillingExcel}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-600 p-5 rounded-3xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/20"
            >
              <FileDown className="w-6 h-6" />
              معالجة وتحميل التقرير المعدل
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-right">
              <h2 className="text-3xl font-black italic bg-gradient-to-l from-white to-slate-400 bg-clip-text text-transparent uppercase tracking-tight">Final Report Generator</h2>
              <p className="text-indigo-500 text-xs font-bold uppercase tracking-widest mt-1">إنشاء التقرير النهائي من مجموعة تقارير حفر</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-black text-slate-400 italic">1. ارفع ملف التقارير المضغوط (ZIP)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept=".zip" 
                    onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="bg-slate-800/50 border-2 border-dashed border-slate-700 p-8 rounded-3xl flex flex-col items-center justify-center group-hover:border-indigo-500 transition-colors">
                    <Upload className="w-10 h-10 text-slate-500 mb-2 group-hover:text-indigo-500" />
                    <span className="text-xs font-bold text-slate-400">{zipFile ? zipFile.name : 'اختر ملف ZIP (Excel Reports)'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-black text-slate-400 italic">2. ارفع قالب الوورد (DOCX)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept=".docx" 
                    onChange={(e) => setDocxTemplate(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="bg-slate-800/50 border-2 border-dashed border-slate-700 p-8 rounded-3xl flex flex-col items-center justify-center group-hover:border-purple-500 transition-colors">
                    <FileText className="w-10 h-10 text-slate-500 mb-2 group-hover:text-purple-500" />
                    <span className="text-xs font-bold text-slate-400">{docxTemplate ? docxTemplate.name : 'اختر قالب DOCX'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-4 flex items-start gap-4">
               <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
               <p className="text-xs text-amber-200/70 leading-relaxed">
                 سيقوم الذكاء الاصطناعي بقراءة جميع تقارير الإكسيل داخل ملف الـ ZIP، استخراج التواريخ والأعماق والبارامترات الفنية، وتعبئة قالب الوورد بناءً على الكلمات المفتاحية الموجودة فيه.
               </p>
            </div>

            <button 
              disabled={!zipFile || !docxTemplate || loading}
              onClick={processFinalReport}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 p-5 rounded-3xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-900/20"
            >
              <FileCheck className="w-6 h-6" />
              إنشاء وتحميل التقرير النهائي
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 bg-slate-900/20 p-6 rounded-3xl border border-slate-800 text-center">
         <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">POWERED BY GEMINI AI CORE</p>
      </div>
    </div>
  );
}
