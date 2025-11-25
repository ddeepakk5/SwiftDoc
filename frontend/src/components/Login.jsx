import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// IMPORT THE API CLIENT (This is important!)
import api from '../api'; 
import { Mail, Lock, ArrowRight } from 'lucide-react';
// import Logo from './Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        if (isRegister) {
            // NOTICE: We use relative paths like '/register'
            // The 'api' client adds the full URL automatically.
            await api.post('/register', { email, password });
            alert("Account created! Please login.");
            setIsRegister(false);
        } else {
            const res = await api.post('/token', formData);
            localStorage.setItem('token', res.data.access_token);
            navigate('/');
        }
    } catch (err) {
        console.error(err);
        alert("Authentication failed. Check credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4 font-sans">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl w-full max-w-md border border-zinc-200/60">
        
        <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
                <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-sm">
                    <Logo className="w-10 h-10" />
                </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-black mb-2">
                AutoDraft
            </h1>
            <p className="text-zinc-500 text-sm">
                {isRegister ? 'Create your workspace' : 'Enter details to access projects'}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 uppercase tracking-wide ml-1">Email</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-zinc-400" />
                    <input 
                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all" 
                        placeholder="name@example.com" 
                        value={email} 
                        onChange={e=>setEmail(e.target.value)} 
                        required
                    />
                </div>
            </div>
            
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 uppercase tracking-wide ml-1">Password</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-zinc-400" />
                    <input 
                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all" 
                        type="password" 
                        placeholder="••••••••" 
                        value={password} 
                        onChange={e=>setPassword(e.target.value)}
                        required 
                    />
                </div>
            </div>

            <button className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-zinc-200">
                {isRegister ? 'Create Account' : 'Sign In'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-500">
          {isRegister ? 'Already have an account?' : "Don't have an account?"} 
          <button onClick={() => setIsRegister(!isRegister)} className="ml-2 font-bold text-black hover:underline underline-offset-4">
            {isRegister ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}
