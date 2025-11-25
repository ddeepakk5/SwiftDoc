import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Plus, FileText, Presentation, LogOut, LayoutGrid, ArrowRight, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    api.get('/projects').then(res => setProjects(res.data));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleDelete = async (e, projectId) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    
    if (window.confirm("Are you sure you want to delete this project? This cannot be undone.")) {
        try {
            await api.delete(`/projects/${projectId}`);
            setProjects(projects.filter(p => p.id !== projectId));
        } catch (err) {
            alert("Failed to delete project");
            console.error(err);
        }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans">
      {/* Sidebar (Desktop Only) */}
      <aside className="w-72 bg-black text-white p-6 hidden md:flex flex-col justify-between shadow-2xl z-10">
        <div>
            <div className="flex items-center gap-4 mb-12 px-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-zinc-800">
                    <span className="text-black font-extrabold text-xl">A</span>
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-wide">AutoDraft</h1>
                    <span className="text-xs text-zinc-500 font-medium">Workspace for authoring</span>
                </div>
            </div>
            
            <nav className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-zinc-900 rounded-xl text-white font-medium border border-zinc-800">
                    <LayoutGrid size={20} className="text-zinc-300" /> Dashboard
                </button>
            </nav>
        </div>

        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-400 transition font-medium">
            <LogOut size={20} /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto pb-24">
        
        {/* --- NEW: MOBILE HEADER (Visible only on mobile) --- */}
        <div className="md:hidden flex items-center gap-3 mb-8 border-b border-zinc-200 pb-4">
             <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-md">
                 <span className="text-white font-bold text-lg">A</span>
             </div>
             <div>
                <h1 className="text-xl font-bold tracking-wide text-zinc-900">AutoDraft</h1>
                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Workspace for authoring</p>
             </div>
        </div>
        {/* -------------------------------------------------- */}

        <div className="flex justify-between items-end mb-12">
            <div>
                <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Your Projects</h2>
                <p className="text-zinc-500 mt-2 font-medium">Manage and refine your generated documents.</p>
            </div>
            <Link to="/create" className="bg-black hover:bg-zinc-800 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition shadow-xl shadow-zinc-200 active:scale-95">
                <Plus size={20} /> <span className="hidden sm:inline">New Project</span>
            </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create Card */}
            <Link to="/create" className="border-2 border-dashed border-zinc-200 rounded-2xl p-6 flex flex-col items-center justify-center text-zinc-400 hover:border-black hover:text-black transition-all group h-64 bg-zinc-50/50">
                <div className="w-14 h-14 rounded-full bg-white border border-zinc-200 group-hover:bg-black group-hover:border-black group-hover:text-white flex items-center justify-center mb-4 transition-all shadow-sm">
                    <Plus size={28} />
                </div>
                <span className="font-bold text-lg">Create New</span>
            </Link>

            {projects.map(p => (
              <div key={p.id} className="relative bg-white p-7 rounded-2xl border border-zinc-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all group h-64 flex flex-col justify-between">
                
                {/* Fixed Delete Button (Visible on Mobile, Hover on Desktop) */}
                <button 
                    onClick={(e) => handleDelete(e, p.id)}
                    className="absolute top-4 right-4 p-2 bg-white text-zinc-300 border border-zinc-100 shadow-sm hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-lg transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 z-10"
                    title="Delete Project"
                >
                    <Trash2 size={18} />
                </button>

                <div>
                    <div className="flex items-center justify-start gap-4 mb-6">
                        <div className={`p-3 rounded-xl ${p.doc_type === 'docx' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                            {p.doc_type === 'docx' ? <FileText size={24} /> : <Presentation size={24} />}
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 bg-zinc-100 rounded-full text-zinc-500 uppercase tracking-widest border border-zinc-200">
                            {p.doc_type}
                        </span>
                    </div>
                    <h3 className="font-bold text-xl text-zinc-900 truncate mb-2">{p.title}</h3>
                    <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed">{p.topic}</p>
                </div>
                <Link to={`/editor/${p.id}`} className="w-full py-3 rounded-lg border border-zinc-100 bg-zinc-50 text-zinc-900 font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-black group-hover:text-white transition-all">
                    Open Editor <ArrowRight size={16} />
                </Link>
              </div>
            ))}
        </div>
      </main>

      {/* MOBILE NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 flex justify-around items-center z-50 shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col items-center text-black">
             <LayoutGrid size={24} />
             <span className="text-[10px] font-bold mt-1">Projects</span>
        </div>
        <Link to="/create" className="bg-black text-white p-3 rounded-full -mt-8 shadow-lg border-4 border-zinc-50">
             <Plus size={24} />
        </Link>
        <button onClick={handleLogout} className="flex flex-col items-center text-zinc-400 hover:text-red-500">
             <LogOut size={24} />
             <span className="text-[10px] font-bold mt-1">Sign Out</span>
        </button>
      </div>

    </div>
  );
}