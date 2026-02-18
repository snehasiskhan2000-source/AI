import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Cpu, User, Trash2 } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Get the key directly inside the function
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    if (!API_KEY) {
      setMessages(prev => [...prev, { role: "ai", text: "Error: Key not found. Please Clear Cache and Deploy on Render." }]);
      return;
    }

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // 2. Initialize the AI only when sending a message
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const result = await model.generateContent(input);
      const response = await result.response;
      setMessages((prev) => [...prev, { role: "ai", text: response.text() }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "ai", text: "The AI is busy or the API key is invalid. Try again in a moment." }]);
    }
    setLoading(false);
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="min-h-screen bg-[#0e0e12] text-white font-sans flex flex-col">
      <nav className="flex justify-between items-center p-5 border-b border-white/5 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Sparkles className="text-blue-400" size={20} />
          <span className="text-xl font-bold tracking-tight">Gemini <span className="text-blue-500">Pro</span></span>
        </div>
        <button onClick={clearChat} className="p-2 text-gray-400 hover:text-red-400 transition"><Trash2 size={20} /></button>
      </nav>

      <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 max-w-4xl mx-auto w-full scroll-smooth">
        <AnimatePresence>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center mt-20">
              <h2 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">Hello, Friend</h2>
              <p className="text-gray-500">How can I help you today?</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 mb-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 shadow-lg' : 'bg-[#1e1f20] border border-gray-800 shadow-xl'}`}>
                  <div className="flex items-center gap-2 mb-1 text-[10px] font-bold uppercase opacity-30">
                    {msg.role === 'user' ? <User size={12}/> : <Cpu size={12}/>}
                    {msg.role === 'user' ? 'You' : 'Gemini'}
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))
          )}
          {loading && <div className="text-blue-400 animate-pulse text-sm ml-2">Gemini is thinking...</div>}
        </AnimatePresence>
      </main>

      <div className="p-4 pb-10 sticky bottom-0 bg-[#0e0e12]">
        <div className="max-w-3xl mx-auto flex items-center bg-[#1e1f20] rounded-2xl p-2 border border-white/10 shadow-2xl focus-within:border-blue-500/50 transition">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
            className="flex-1 bg-transparent border-none outline-none p-4 text-white" 
            placeholder="Ask me anything..." 
          />
          <button onClick={handleSend} disabled={loading} className="p-4 text-blue-400 hover:scale-110 disabled:opacity-50 transition">
            <Send size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
