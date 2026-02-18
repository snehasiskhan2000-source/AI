import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Cpu, User, Trash2 } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Keep chat scrolled to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Fetch Key from Render Env
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    if (!API_KEY) {
      setMessages(prev => [...prev, { 
        role: "ai", 
        text: "System: API Key not detected. Please verify VITE_GEMINI_API_KEY in Render." 
      }]);
      return;
    }

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      
      /** * MODEL UPDATE 2026: 
       * Using 'gemini-3-flash-preview' for high-speed agentic reasoning.
       */
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3-flash-preview",
        systemInstruction: "You are a helpful AI assistant. Provide concise, accurate, and friendly responses."
      });
      
      const result = await model.generateContent(input);
      const response = await result.response;
      const text = response.text();
      
      setMessages(prev => [...prev, { role: "ai", text }]);
    } catch (error) {
      console.error("Gemini 3 Error:", error);
      setMessages(prev => [...prev, { 
        role: "ai", 
        text: "I'm having trouble connecting to Gemini 3. Check your API quota or region support." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="min-h-screen bg-[#0e0e12] text-white font-sans flex flex-col selection:bg-blue-500/30">
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <nav className="flex justify-between items-center p-5 backdrop-blur-xl border-b border-white/5 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-600/20">
            <Sparkles className="text-white" size={18} />
          </div>
          <span className="text-xl font-bold tracking-tight">Gemini <span className="text-blue-500">3 Flash</span></span>
        </div>
        <div className="flex gap-3">
          <button onClick={clearChat} className="p-2 text-gray-400 hover:text-red-400 transition-all hover:bg-white/5 rounded-lg">
            <Trash2 size={20} />
          </button>
          <button className="px-5 py-2 bg-white text-black rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg">
            Sign Up
          </button>
        </div>
      </nav>

      {/* Chat History */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 max-w-4xl mx-auto w-full space-y-6">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col justify-center items-center text-center pt-20">
              <h2 className="text-6xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
                Hello, Friend
              </h2>
              <p className="text-gray-500 text-lg max-w-xs">Powered by Google Gemini 3. Ready for your first prompt.</p>
            </motion.div>
          ) : (
            messages.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-4 rounded-2xl ${
                  msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-[#1c1c22] border border-white/5 text-gray-100 rounded-tl-none'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5 text-[10px] font-black uppercase tracking-tighter opacity-40">
                    {msg.role === 'user' ? <User size={12}/> : <Cpu size={12}/>}
                    {msg.role === 'user' ? 'Human' : 'Gemini 3'}
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                    {msg.text}
                  </p>
                </div>
              </motion.div>
            ))
          )}
          {loading && (
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold ml-2">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-ping" />
              Gemini is processing...
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Input Section */}
      <div className="p-4 pb-10 bg-[#0e0e12]/80 backdrop-blur-md sticky bottom-0">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition duration-500" />
          <div className="relative flex items-center bg-[#1c1c22] rounded-2xl p-2 border border-white/10 shadow-2xl">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
              className="flex-1 bg-transparent border-none outline-none p-4 text-white placeholder-gray-600" 
              placeholder="Ask anything..." 
            />
            <button 
              onClick={handleSend} 
              disabled={loading} 
              className="p-4 text-blue-400 hover:scale-110 active:scale-90 disabled:opacity-30 disabled:hover:scale-100 transition-all"
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
