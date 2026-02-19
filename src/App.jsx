import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Zap, User, Trash2, Moon, Sun } from 'lucide-react';
import Groq from "groq-sdk";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(true); // Default to Dark Mode
  const scrollRef = useRef(null);

  // Toggle Theme
  const toggleTheme = () => setIsDark(!isDark);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    if (!API_KEY) {
      setMessages(prev => [...prev, { role: "ai", text: "Key missing in Render settings." }]);
      return;
    }

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Create a placeholder for the AI message that we will "stream" into
    const aiMessageId = Date.now();
    setMessages(prev => [...prev, { role: "ai", text: "", id: aiMessageId }]);

    try {
      const groq = new Groq({ apiKey: API_KEY, dangerouslyAllowBrowser: true });

      // ENABLE STREAMING
      const stream = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are ChadGPT, a bold and lightning-fast AI assistant." },
          { role: "user", content: input }
        ],
        model: "llama-3.3-70b-versatile",
        stream: true, // This is the secret to word-by-word delivery
      });

      let fullResponse = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullResponse += content;
        
        // Update the specific AI message in the list with the new text chunk
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId ? { ...msg, text: fullResponse } : msg
        ));
      }
    } catch (error) {
      console.error("Streaming Error:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId ? { ...msg, text: "ChadGPT hit a snag. Check your connection." } : msg
      ));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${isDark ? 'dark bg-[#0b0b0f]' : 'bg-gray-50'} min-h-screen text-gray-900 dark:text-white flex flex-col font-sans transition-colors duration-300`}>
      
      {/* Dynamic Header */}
      <nav className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-white/5 backdrop-blur-lg sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-orange-600 p-1.5 rounded-lg shadow-lg shadow-orange-600/20">
            <Zap className="text-white" size={18} fill="white" />
          </div>
          <span className="text-xl font-black tracking-tighter">CHAD<span className="text-orange-500">GPT</span></span>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={toggleTheme} 
            className="p-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/5 transition-all text-gray-500 dark:text-gray-400"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setMessages([])} 
            className="p-2.5 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </nav>

      {/* Chat Space */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 max-w-4xl mx-auto w-full space-y-6">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col justify-center items-center text-center pt-32">
              <h2 className="text-6xl font-black text-gray-300 dark:text-white/10 select-none">
                CHADGPT
              </h2>
              <p className="text-gray-400 dark:text-gray-600 font-medium">Llama 3.3 • Instant Stream • Ultra Sleek</p>
            </motion.div>
          ) : (
            messages.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                  ? 'bg-orange-600 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-[#16161c] border border-gray-200 dark:border-white/5 rounded-tl-none'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5 text-[10px] font-black uppercase tracking-widest opacity-40">
                    {msg.role === 'user' ? <User size={12}/> : <Sparkles size={12}/>}
                    {msg.role === 'user' ? 'Member' : 'ChadGPT'}
                  </div>
                  <p className="text-sm md:text-base leading-relaxed font-medium">
                    {msg.text}
                    {loading && i === messages.length - 1 && msg.role === 'ai' && (
                      <span className="inline-block w-1.5 h-4 ml-1 bg-orange-500 animate-pulse align-middle" />
                    )}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </main>

      {/* Sleek Input Bar */}
      <div className={`p-4 pb-10 sticky bottom-0 ${isDark ? 'bg-[#0b0b0f]' : 'bg-gray-50'}`}>
        <div className="max-w-3xl mx-auto flex items-center bg-white dark:bg-[#16161c] rounded-2xl p-1.5 border border-gray-200 dark:border-white/10 shadow-xl focus-within:ring-2 ring-orange-500/50 transition-all">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
            className="flex-1 bg-transparent border-none outline-none p-4 text-gray-800 dark:text-white placeholder-gray-400 text-sm" 
            placeholder="Talk to ChadGPT..." 
          />
          <button 
            onClick={handleSend} 
            disabled={loading} 
            className="bg-orange-600 hover:bg-orange-500 text-white p-4 rounded-xl shadow-lg shadow-orange-600/20 active:scale-95 disabled:opacity-30 transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
