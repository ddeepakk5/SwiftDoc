import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Plus, X, Wand2, Loader2 } from 'lucide-react';

export default function ConfigPage() {
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('docx');
  const [topic, setTopic] = useState('');
  const [items, setItems] = useState(['Introduction']);
  const [generatingOutline, setGeneratingOutline] = useState(false); // New State
  const navigate = useNavigate();

  const handleAddItem = () => setItems([...items, 'New Section']);
  const handleRemoveItem = (index) => setItems(items.filter((_, i) => i !== index));
  
  const handleItemChange = (index, val) => {
    const newItems = [...items];
    newItems[index] = val;
    setItems(newItems);
  };

  // --- NEW FUNCTION: Auto-Suggest Outline ---
  const handleAutoSuggest = async () => {
    if (!topic) return alert("Please enter a Main Topic first!");
    setGeneratingOutline(true);
    try {
        const res = await api.post('/suggest_outline', { topic, doc_type: docType });
        if (res.data.outline && res.data.outline.length > 0) {
            setItems(res.data.outline);
        }
    } catch (e) {
        alert("Failed to generate outline.");
    }
    setGeneratingOutline(false);
  };

  const handleCreate = async () => {
    const res = await api.post('/projects', {
      title, doc_type: docType, topic, outline: items
    });
    navigate(`/editor/${res.data.id}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-zinc-100 flex items-center gap-4 bg-white sticky top-0 z-10">
            <Link to="/" className="text-zinc-400 hover:text-black p-2 hover:bg-zinc-50 rounded-lg transition"><ArrowLeft size={20} /></Link>
            <h1 className="text-xl font-bold text-zinc-900">Project Configuration</h1>
        </div>
        
        <div className="p-8 space-y-8">
            <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Document Type</label>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setDocType('docx')}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${docType === 'docx' ? 'border-black bg-black text-white font-bold shadow-lg' : 'border-zinc-100 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50'}`}
                    >
                        Word Document
                    </button>
                    <button 
                        onClick={() => setDocType('pptx')}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${docType === 'pptx' ? 'border-black bg-black text-white font-bold shadow-lg' : 'border-zinc-100 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50'}`}
                    >
                        PowerPoint
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Project Title</label>
                <input className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition font-medium" placeholder="e.g., Q3 Market Analysis" value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Main Topic / Context</label>
                <textarea className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none h-32 resize-none transition" placeholder="Describe what this document is about..." value={topic} onChange={e => setTopic(e.target.value)} />
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">Structure</label>
                    
                    {/* --- NEW MAGIC BUTTON --- */}
                    <button 
                        onClick={handleAutoSuggest}
                        disabled={generatingOutline || !topic}
                        className="text-xs font-bold text-black flex items-center gap-1 hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                        {generatingOutline ? <Loader2 size={14} className="animate-spin"/> : <Wand2 size={14}/>}
                        {generatingOutline ? "Thinking..." : "AI Suggest Outline"}
                    </button>
                </div>

                <div className="space-y-3 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex gap-3 group">
                            <span className="flex items-center justify-center w-8 h-10 text-xs font-bold text-zinc-400 bg-white rounded border border-zinc-200">{idx + 1}</span>
                            <input className="flex-1 p-2 bg-transparent border-b-2 border-transparent focus:border-black outline-none transition font-medium text-zinc-800 placeholder-zinc-400" placeholder="Section Title" value={item} onChange={e => handleItemChange(idx, e.target.value)} />
                            <button onClick={() => handleRemoveItem(idx)} className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded transition"><X size={18}/></button>
                        </div>
                    ))}
                    <button onClick={handleAddItem} className="w-full py-3 border-2 border-dashed border-zinc-300 rounded-lg text-sm font-bold text-zinc-500 hover:text-black hover:border-black hover:bg-white flex items-center justify-center gap-2 mt-4 transition">
                        <Plus size={16} /> Add {docType === 'docx' ? 'Section' : 'Slide'}
                    </button>
                </div>
            </div>

            <button onClick={handleCreate} className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-4 rounded-xl mt-6 transition shadow-xl shadow-zinc-300 active:scale-[0.98]">
                Launch Project
            </button>
        </div>
      </div>
    </div>
  );
}