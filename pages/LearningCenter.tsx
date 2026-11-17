
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Image as ImageIcon, X, BookOpen } from 'lucide-react';
import { ToolItem } from '../types';

const LearningCenter: React.FC = () => {
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Form States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('total_cement_tools');
    if (saved) setTools(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('total_cement_tools', JSON.stringify(tools));
  }, [tools]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addTool = () => {
    if (!name || !previewImage) return;
    const newTool: ToolItem = {
      id: Date.now().toString(),
      name,
      description,
      image: previewImage,
      timestamp: Date.now()
    };
    setTools([newTool, ...tools]);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPreviewImage(null);
    setIsAdding(false);
  };

  const deleteTool = (id: string) => {
    setTools(tools.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6 pb-20 text-right">
      <header className="flex justify-between items-center mb-6">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
        >
          {isAdding ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">مركز التعلم</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Learning Hub</p>
        </div>
      </header>

      {isAdding && (
        <div className="bg-[#1e293b]/50 border border-slate-800 rounded-3xl p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="relative group">
            {previewImage ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-blue-500/30 bg-black/40">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="w-full h-full object-contain" 
                />
                <button 
                   onClick={() => setPreviewImage(null)}
                   className="absolute top-2 right-2 p-2 bg-red-500/80 rounded-full text-white z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-blue-500/50 transition-all text-slate-500"
              >
                <ImageIcon className="w-10 h-10" />
                <span className="text-sm font-bold">إضافة صورة الأداة</span>
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange} 
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 block px-1">اسم الأداة</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: Float Shoe" 
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 block px-1">شرح بسيط</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اشرح وظيفة هذه الأداة..." 
                className="input-field h-24 text-sm text-right"
              />
            </div>
          </div>

          <button 
            disabled={!name || !previewImage}
            onClick={addTool}
            className="w-full py-4 bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-black text-white shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
          >
            حفظ في المكتبة
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {tools.length === 0 && !isAdding && (
          <div className="text-center py-20 bg-slate-800/20 rounded-[2.5rem] border border-dashed border-slate-800">
            <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">مكتبتك فارغة حالياً</p>
            <p className="text-slate-600 text-xs px-10">ابدأ بإضافة الأدوات يدوياً أو استخدم الذكاء الاصطناعي للتعرف عليها</p>
          </div>
        )}

        {tools.map((tool) => (
          <div 
            key={tool.id}
            className="bg-[#1e293b]/40 border border-slate-800 rounded-[2.5rem] overflow-hidden group animate-in zoom-in-95 duration-300 shadow-xl"
          >
            <div className="aspect-video relative bg-black/40">
              <img 
                src={tool.image} 
                alt={tool.name} 
                className="w-full h-full object-contain" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/60 via-transparent to-transparent pointer-events-none"></div>
              <button 
                onClick={() => deleteTool(tool.id)}
                className="absolute top-4 right-4 p-3 bg-red-500/20 backdrop-blur-md text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-black text-white mb-2">{tool.name}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{tool.description}</p>
              <div className="mt-4 flex justify-start">
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full">
                  {new Date(tool.timestamp).toLocaleDateString('ar-EG')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningCenter;
