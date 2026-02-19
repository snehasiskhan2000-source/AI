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
    if (speakingId === id) {
      setSpeakingId(null);
      return;
    }
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
        messages: [{ role: "system", content: "You are ChadGPT. Use markdown. Be helpful, fast, and professional." }, { role: "user", content: input }],
        model: "llama-3.3-70b-versatile",
        stream: true,
      });

      let responseText = "";
      for await (const chunk of stream) {
        responseText += chunk.choices[0]?.delta?.content || "";
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: responseText } : m));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${isDark ? 'dark bg-[#050505] text-white' : 'bg-gray-50 text-gray-900'} min-h-screen flex flex-col transition-colors duration-500`}>
      
      {/* HEADER */}
      <nav className="p-4 border-b border-blue-500/10 flex justify-between items-center backdrop-blur-xl sticky top-0 z-50">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <Zap className="text-white" size={20} fill="white" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter italic">Chad<span className="text-blue-500">GPT</span></h1>
        </motion.div>
        
        <div className="flex gap-3">
          <button onClick={toggleTheme} className="p-2.5 hover:bg-blue-500/10 rounded-xl transition-all">
            {isDark ? <Sun size={20} className="text-blue-400" /> : <Moon size={20} className="text-blue-600" />}
          </button>
          <button onClick={() => setMessages([])} className="p-2.5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all">
            <Trash2 size={20}/>
          </button>
        </div>
      </nav>

      {/* CHAT AREA */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full space-y-8 pb-32">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            /* WELCOME MESSAGE */
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col justify-center items-center text-center pt-24 space-y-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse"></div>
                <Sparkles className="text-blue-500 w-16 h-16 relative z-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tight">Hey! This is <span className="text-blue-500">ChadGPT</span></h2>
                <p className="text-gray-500 font-medium max-w-sm">Built for speed. Powered by Groq. Ready to assist with anything you need.</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest">Llama 3.3 70B</span>
                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest">Ultra Low Latency</span>
              </div>
            </motion.div>
          ) : (
            messages.map((m, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} 
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.4 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`p-5 rounded-3xl max-w-[92%] shadow-2xl relative group ${
                  m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-[#111116] border border-blue-500/10 rounded-tl-none'
                }`}>
                  <div className="flex justify-between items-center mb-3 opacity-60">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                      {m.role === 'user' ? <User size={12}/> : <Zap size={12} className="text-blue-500"/>}
                      {m.role === 'user' ? 'Member' : 'ChadGPT'}
                    </div>
                    {m.role === 'ai' && m.text && (
                      <button onClick={() => speak(m.text, m.id)} className="text-blue-500 hover:scale-110 transition-transform">
                        {speakingId === m.id ? <StopCircle size={16} /> : <Volume2 size={16} />}
                      </button>
                    )}
                  </div>
                  <div className="prose dark:prose-invert prose-blue max-w-none text-[15px] leading-relaxed font-medium">
                    <Markdown>{m.text}</Markdown>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </main>

      {/* INPUT BAR */}
      <footer className="p-4 fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-transparent">
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          className="max-w-3xl mx-auto flex items-center gap-2 bg-white dark:bg-[#111116] p-2 rounded-2xl border border-blue-500/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] focus-within:border-blue-500/50 transition-all"
        >
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyPress={e => e.key === 'Enter' && handleSend()} 
            className="flex-1 bg-transparent p-3 outline-none text-sm placeholder:text-gray-600" 
            placeholder="Ask ChadGPT anything..." 
          />
          <button 
            onClick={handleSend} 
            disabled={loading} 
            className="bg-blue-600 hover:bg-blue-500 p-3.5 rounded-xl text-white shadow-lg shadow-blue-600/20 active:scale-90 transition-all disabled:opacity-30"
          >
            <Send size={20}/>
          </button>
        </motion.div>
      </main>
    </div>
  );
}
