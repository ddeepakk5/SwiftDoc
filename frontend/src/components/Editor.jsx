import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Download, RefreshCw, Wand2, Check } from 'lucide-react';

export default function Editor() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(null); 

  useEffect(() => { fetchProject(); }, []);

  const fetchProject = async () => {
    try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data.project);
        setSections(res.data.sections);
    } catch(e) { console.error(e); }
  };

  const handleGenerate = async (sectionId) => {
    setLoading(true);
    setActiveSection(sectionId);
    await api.post(`/sections/${sectionId}/generate`);
    await fetchProject();
    setLoading(false);
    setActiveSection(null);
  };

  const handleRefine = async (sectionId, instruction) => {
    if(!instruction) return;
    setLoading(true);
    setActiveSection(sectionId);
    await api.post(`/sections/${sectionId}/refine`, { instruction });
    await fetchProject();
    setLoading(false);
    setActiveSection(null);
  };

  const handleExport = async () => {
    const response = await api.get(`/projects/${id}/export`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `document.${project.doc_type}`);
    document.body.appendChild(link);
    link.click();
  };

  if (!project) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div></div>;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-20">
      {/* Top Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-20 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-zinc-100 rounded-lg transition text-zinc-500 hover:text-black"><ArrowLeft size={20} /></Link>
            <div>
                <h1 className="font-bold text-lg text-zinc-900">{project.title}</h1>
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    <span className="bg-zinc-100 px-2 py-0.5 rounded text-zinc-600">{project.doc_type}</span>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{project.topic}</span>
                </div>
            </div>
        </div>
        <button onClick={handleExport} className="bg-black hover:bg-zinc-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold text-sm transition shadow-lg shadow-zinc-200">
            <Download size={16} /> Export File
        </button>
      </header>

      {/* Workspace */}
      <main className="max-w-4xl mx-auto p-8 space-y-8">
        {sections.map((sec) => (
          <div key={sec.id} className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] border border-zinc-200 overflow-hidden group transition-all hover:shadow-[0_8px_30px_-5px_rgba(0,0,0,0.08)]">
            {/* Section Header */}
            <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-100 flex justify-between items-center group-hover:bg-white transition-colors">
                <h2 className="font-bold text-lg text-zinc-800 flex items-center gap-3">
                    {/* <span className="w-6 h-6 rounded-full bg-zinc-200 text-zinc-500 flex items-center justify-center text-xs">{sec.order_index + 1}</span> */}
                    {sec.title}
                </h2>
                <div className="flex gap-2">
                    <button 
                        onClick={() => handleGenerate(sec.id)}
                        disabled={loading && activeSection === sec.id}
                        className="text-xs font-bold uppercase tracking-wide flex items-center gap-2 bg-white border border-zinc-200 text-zinc-600 px-4 py-2 rounded-lg hover:bg-black hover:text-white hover:border-black transition-all"
                    >
                        {loading && activeSection === sec.id ? <RefreshCw className="animate-spin" size={14}/> : (sec.content ? <RefreshCw size={14}/> : <Wand2 size={14}/>)}
                        {sec.content ? 'Generate' : 'Generate with AI'}
                    </button>
                </div>
            </div>

            <div className="p-8">
                {/* Content Area */}
                <div className="prose prose-zinc max-w-none mb-8">
                    {sec.content ? (
                         <ReactMarkdown 
                            components={{
                                p: ({node, ...props}) => <p className="mb-4 leading-7 text-zinc-700 font-normal" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-none pl-0 mb-4 space-y-2" {...props} />,
                                li: ({node, ...props}) => <li className="relative pl-6 text-zinc-700 before:content-['•'] before:absolute before:left-0 before:text-zinc-300 before:font-bold" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-bold text-black" {...props} />,
                                em: ({node, ...props}) => <em className="italic text-zinc-800 bg-zinc-100 px-1 rounded-sm not-italic font-medium" {...props} /> // Highlight italics slightly
                            }}
                         >
                            {sec.content}
                         </ReactMarkdown>
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-zinc-300 border-2 border-dashed border-zinc-100 rounded-xl bg-zinc-50/50">
                            <Wand2 size={40} className="mb-3 opacity-20"/>
                            <p className="text-sm font-medium">Ready to generate content for "{sec.title}"</p>
                        </div>
                    )}
                </div>

                {/* Refinement Bar */}
                <div className="flex items-center gap-3 pt-6 border-t border-zinc-100">
                    <div className="relative flex-1 group/input">
                        <Wand2 className="absolute left-3.5 top-3 text-zinc-400 group-focus-within/input:text-black transition-colors" size={18} />
                        <input 
                            type="text" 
                            id={`refine-${sec.id}`}
                            onKeyDown={(e) => e.key === 'Enter' && handleRefine(sec.id, e.target.value)}
                            placeholder="Tell AI to change length, tone, or format..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all placeholder:text-zinc-400"
                        />
                    </div>
                    <button 
                        onClick={() => handleRefine(sec.id, document.getElementById(`refine-${sec.id}`).value)}
                        className="bg-white border border-zinc-200 text-zinc-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black hover:text-white hover:border-black transition-all"
                    >
                        Refine
                    </button>
                </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
