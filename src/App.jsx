import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Zap, User, Trash2, Moon, Sun, Volume2, StopCircle, Sparkles } from 'lucide-react';
import Groq from "groq-sdk";
import Markdown from 'react-markdown';

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [speakingId, setSpeakingId] = useState(null);
  const scrollRef = useRef(null);

  const toggleTheme = () => setIsDark(!isDark);

  const speak = (text, id) => {
    window.speechSynthesis.cancel();
    if (speakingId === id) { setSpeakingId(null); return; }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setSpeakingId(id);
    utterance.onend = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    
    setMessages(prev => [...prev, { role: "user", text: input }]);
    setInput("");
    setLoading(true);

    const aiId = Date.now();
    setMessages(prev => [...prev, { role: "ai", text: "", id: aiId }]);

    try {
      const groq = new Groq({ apiKey: API_KEY, dangerouslyAllowBrowser: true });
      const stream = await groq.chat.completions.create({
        messages: [{ role: "system", content: "You are ChadGPT. A fast, blue-themed AI." }, { role: "user", content: input }],
        model: "llama-3.3-70b-versatile",
        stream: true,
      });

      let responseText = "";
      for await (const chunk of stream) {
        responseText += chunk.choices[0]?.delta?.content || "";
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: responseText } : m));
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className={`${isDark ? 'dark bg-[#050505] text-white' : 'bg-gray-50 text-gray-900'} min-h-screen flex flex-col transition-colors duration-500 font-sans`}>
      
      {/* HEADER */}
      <nav className="p-4 border-b border-blue-500/10 flex justify-between items-center backdrop-blur-xl sticky top-0 z-50 bg-inherit/80">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Zap className="text-white" size={20} fill="white" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter italic">Chad<span className="text-blue-500">GPT</span></h1>
        </motion.div>
        
        <div className="flex gap-2">
          <button onClick={toggleTheme} className="p-2 hover:bg-blue-500/10 rounded-xl transition-all">
            {isDark ? <Sun size={20} className="text-blue-400" /> : <Moon size={20} className="text-blue-600" />}
          </button>
          <button onClick={() => setMessages([])} className="p-2 hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all">
            <Trash2 size={20}/>
          </button>
        </div>
      </nav>

      {/* CHAT AREA */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full space-y-8 pb-32">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full flex flex-col justify-center items-center text-center pt-24 space-y-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse rounded-full"></div>
                <Sparkles className="text-blue-500 w-16 h-16 relative z-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tight leading-tight">Hey! This is <span className="text-blue-500">ChadGPT</span></h2>
                <p className="text-gray-500 font-medium max-w-sm mx-auto italic">Fast. Blue. Animated. Ready to work.</p>
              </div>
            </motion.div>
          ) : (
            messages.map((m, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }} 
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`p-5 rounded-3xl max-w-[90%] shadow-2xl ${
                  m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-[#111116] border border-blue-500/10 rounded-tl-none'
                }`}>
                  <div className="flex justify-between items-center mb-2 opacity-50 text-[10px] font-bold uppercase tracking-widest">
                    <span>{m.role === 'user' ? 'Member' : 'ChadGPT'}</span>
                    {m.role === 'ai' && m.text && (
                      <button onClick={() => speak(m.text, m.id)} className="text-blue-500 ml-4 hover:scale-125 transition-transform">
                        {speakingId === m.id ? <StopCircle size={14} /> : <Volume2 size={14} />}
                      </button>
                    )}
                  </div>
                  <div className="prose dark:prose-invert prose-blue max-w-none text-[15px] font-medium">
                    <Markdown>{m.text}</Markdown>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </main>

      {/* INPUT BAR */}
      <footer className="p-4 fixed bottom-0 left-0 right-0 bg-gradient-to-t from-inherit via-inherit to-transparent z-40">
        <div className="max-w-3xl mx-auto flex items-center gap-2 bg-white dark:bg-[#111116] p-2 rounded-2xl border border-blue-500/20 shadow-2xl focus-within:ring-2 ring-blue-500/20 transition-all">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyPress={e => e.key === 'Enter' && handleSend()} 
            className="flex-1 bg-transparent p-3 outline-none text-sm" 
            placeholder="Talk to ChadGPT..." 
          />
          <button 
            onClick={handleSend} 
            disabled={loading} 
            className="bg-blue-600 hover:bg-blue-500 p-3.5 rounded-xl text-white shadow-lg active:scale-90 transition-all disabled:opacity-30"
          >
            <Send size={20}/>
          </button>
        </div>
      </footer>
    </div>
  );
}
