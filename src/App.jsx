import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Zap, User, Trash2 } from 'lucide-react';
import Groq from "groq-sdk";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

    if (!API_KEY) {
      setMessages(prev => [...prev, { role: "ai", text: "Error: VITE_GROQ_API_KEY not found in Render." }]);
      return;
    }

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // 1. Initialize Groq Client
      const groq = new Groq({ apiKey: API_KEY, dangerouslyAllowBrowser: true });

      // 2. Request Chat Completion
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are a helpful, lightning-fast AI assistant." },
          { role: "user", content: input }
        ],
        model: "llama-3.1-8b-instant", // Using Llama 3.3 for high performance
      });

      const responseText = chatCompletion.choices[0]?.message?.content || "No response received.";
      setMessages(prev => [...prev, { role: "ai", text: responseText }]);
    } catch (error) {
      console.error("Groq Error:", error);
      setMessages(prev => [...prev, { role: "ai", text: "Groq is currently unavailable. Check your API key or quota." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white flex flex-col font-sans">
      {/* Header */}
      <nav className="flex justify-between items-center p-5 border-b border-white/5 backdrop-blur-lg sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-1.5 rounded-lg">
            <Zap className="text-white" size={18} fill="white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Groq <span className="text-orange-500">Fast</span></span>
        </div>
        <button onClick={clearChat} className="p-2 text-gray-400 hover:text-red-400 transition"><Trash2 size={20}/></button>
      </nav>

      {/* Messages */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 max-w-4xl mx-auto w-full space-y-6">
        <AnimatePresence>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center pt-20">
              <h2 className="text-5xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-4">
                Instant AI
              </h2>
              <p className="text-gray-500">Groq is active and ready to reply instantly.</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-orange-600' : 'bg-[#16161c] border border-white/5'}`}>
                  <div className="flex items-center gap-2 mb-1 text-[10px] font-bold uppercase opacity-30">
                    {msg.role === 'user' ? <User size={12}/> : <Sparkles size={12}/>}
                    {msg.role === 'user' ? 'Human' : 'Groq AI'}
                  </div>
                  <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </main>

      {/* Input */}
      <div className="p-4 pb-10 bg-[#0b0b0f]">
        <div className="max-w-3xl mx-auto flex items-center bg-[#16161c] rounded-2xl p-2 border border-white/10">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
            className="flex-1 bg-transparent border-none outline-none p-4 text-white" 
            placeholder="Type fast, think faster..." 
          />
          <button onClick={handleSend} disabled={loading} className="p-4 text-orange-400 disabled:opacity-30">
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
