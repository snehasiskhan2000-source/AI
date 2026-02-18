import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Cpu, User, Trash2 } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll for mobile users
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Get the key from your Render Environment Variables
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    if (!API_KEY) {
      setMessages(prev => [...prev, { 
        role: "ai", 
        text: "Error: VITE_GEMINI_API_KEY is not set in Render settings." 
      }]);
      return;
    }

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      
      /** * UPDATED FOR 2026: 
       * Using 'gemini-3-flash' as the primary high-speed model.
       */
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });
      
      const result = await model.generateContent(input);
      const response = await result.response;
      setMessages((prev) => [...prev, { role: "ai", text: response.text() }]);
    } catch (error) {
      console.error("Gemini 3 Error:", error);
      setMessages((prev) => [...prev, { 
        role: "ai", 
        text: "Connection failed. Please ensure your API Key is for Gemini 3 and you've cleared Render's cache." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="min-h-screen bg-[#0e0e12] text-white font-sans flex flex-col">
      {/* Glass Navbar */}
      <nav className="flex justify-between items-center p-5 border-b border-white/5 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1 rounded-lg">
            <Sparkles className="text-white" size={18} />
          </div>
          <span className="text-xl font-bold tracking-tight">Gemini <span className="text-blue-500">3 Flash</span></span>
        </div>
        <div className="flex gap-4">
          <button onClick={clearChat} className="p-2 text-gray-400 hover:text-red-400 transition">
            <Trash2 size={20} />
          </button>
          <button className="px-5 py-2 bg-white text-black rounded-full font-bold text-sm">Sign Up</button>
        </div>
      </nav>

      {/* Chat Area */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 max-w-4xl mx-auto w-full">
        <AnimatePresence>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center mt-20">
              <motion.h2 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4"
              >
                Hello, Friend
              </motion.h2>
              <p className="text-gray-500 text-lg">Gemini 3 Flash is ready to assist.</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`flex gap-4 mb-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-4 rounded-2xl ${
                  msg.role === 'user' ? 'bg-blue-600' : 'bg-[#1e1f20] border border-gray-800'
                }`}>
                  <div className="flex items-center gap-2 mb-1 text-[10px] font-bold uppercase opacity-30">
                    {msg.role === 'user' ? <User size={12}/> : <Cpu size={12}/>}
                    {msg.role === 'user' ? 'You' : 'Gemini 3'}
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </motion.div>
            ))
          )}
          {loading && (
            <div className="flex gap-2 items-center text-blue-400 text-sm ml-2 animate-pulse">
              Thinking...
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Input Bar */}
      <div className="p-4 pb-10 sticky bottom-0 bg-[#0e0e12]">
        <div className="max-w-3xl mx-auto flex items-center bg-[#1e1f20] rounded-2xl p-2 border border-white/10 shadow-2xl focus-within:border-blue-500/50 transition">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
            className="flex-1 bg-transparent border-none outline-none p-4 text-white" 
            placeholder="What's on your mind?" 
          />
          <button 
            onClick={handleSend} 
            disabled={loading} 
            className="p-4 text-blue-400 hover:scale-110 disabled:opacity-50 transition"
          >
            <Send size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
