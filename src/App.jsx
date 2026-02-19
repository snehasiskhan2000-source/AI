import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Zap, User, Trash2, Moon, Sun, Volume2, StopCircle } from 'lucide-react';
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
        messages: [{ role: "system", content: "You are ChadGPT. Use markdown. Be helpful and bold." }, { role: "user", content: input }],
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
    <div className={`${isDark ? 'dark bg-chad-dark text-white' : 'bg-white text-gray-900'} min-h-screen flex flex-col transition-colors duration-300`}>
      <nav className="p-4 border-b border-white/5 flex justify-between items-center backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Zap className="text-orange-600" fill="currentColor" />
          <h1 className="text-xl font-black uppercase tracking-tighter">Chad<span className="text-orange-600">GPT</span></h1>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleTheme} className="p-2 hover:bg-white/10 rounded-lg">{isDark ? <Sun size={20}/> : <Moon size={20}/>}</button>
          <button onClick={() => setMessages([])} className="p-2 hover:bg-red-500/10 text-gray-500"><Trash2 size={20}/></button>
        </div>
      </nav>

      <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-4 rounded-2xl max-w-[90%] shadow-lg ${m.role === 'user' ? 'bg-orange-600 text-white' : 'bg-gray-100 dark:bg-[#16161c]'}`}>
              <div className="flex justify-between items-center mb-2 border-b border-black/5 dark:border-white/5 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">{m.role === 'user' ? 'You' : 'ChadGPT'}</span>
                {m.role === 'ai' && (
                  <button onClick={() => speak(m.text, m.id)} className="text-orange-500">
                    {speakingId === m.id ? <StopCircle size={14} /> : <Volume2 size={14} />}
                  </button>
                )}
              </div>
              <div className="prose dark:prose-invert prose-orange max-w-none text-sm">
                <Markdown>{m.text}</Markdown>
              </div>
            </div>
          </div>
        ))}
      </main>

      <footer className="p-4 sticky bottom-0 bg-inherit">
        <div className="max-w-3xl mx-auto flex gap-2 bg-gray-100 dark:bg-[#16161c] p-2 rounded-2xl border border-white/5">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} className="flex-1 bg-transparent p-2 outline-none" placeholder="Type a message..." />
          <button onClick={handleSend} disabled={loading} className="bg-orange-600 p-3 rounded-xl text-white disabled:opacity-50"><Send size={20}/></button>
        </div>
      </footer>
    </div>
  );
}
