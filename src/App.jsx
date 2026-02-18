import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Cpu, User, Trash2, AlertCircle } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Access the Render Environment Variable
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll logic for better mobile UX
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Check if API key exists before making the request
    if (!API_KEY) {
      setMessages(prev => [...prev, { 
        role: "ai", 
        text: "Error: VITE_GEMINI_API_KEY is missing. Please check your Render Environment Variables." 
      }]);
      return;
    }

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      // Using 'gemini-1.5-flash' for faster response times on mobile
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const result = await model.generateContent(input);
      const response = await result.response;
      const text = response.text();
      
      setMessages((prev) => [...prev, { role: "ai", text: text }]);
    } catch (error) {
      console.error("AI connection error:", error);
      setMessages((prev) => [...prev, { 
        role: "ai", 
        text: "I'm having trouble connecting. Ensure your API key is valid and you've used 'Clear Cache and Deploy' on Render." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="min-h-screen bg-[#0e0e12] text-white font-sans overflow-hidden flex flex-col">
      {/* Dynamic Background Effect */}
      <div className="fixed top-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full" />

      {/* Modern Header */}
      <nav className="relative z-10 flex justify-between items-center p-5 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Sparkles className="text-white" size={18} />
          </div>
          <span className="text-xl font-bold tracking-tight">Gemini <span className="text-blue-500">Pro</span></span>
        </div>
        <div className="flex gap-3">
          <button onClick={clearChat} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
            <Trash2 size={20} />
          </button>
          <button className="px-5 py-2 bg-white text-black rounded-full font-semibold text-sm shadow-lg hover:bg-gray-200 transition">
            Sign Up
          </button>
        </div>
      </nav>

      {/* Chat Container */}
      <main ref={scrollRef} className="flex-1 relative z-10 max-w-4xl mx-auto w-full overflow-y-auto px-4 py-6 custom-scrollbar scroll-smooth">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="h-full flex flex-col justify-center items-center text-center pt-20"
            >
              <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-500 rounded-3xl mb-6 blur-sm absolute opacity-20 animate-ping" />
              <h2 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-6">
                Hello, Friend
              </h2>
              <p className="text-gray-400 text-lg max-w-md">Your personalized AI assistant is ready. How can I help you build today?</p>
            </motion.div>
          ) : (
            messages.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`flex gap-4 mb-8 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[90%] p-5 rounded-3xl shadow-2xl ${
                  msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-[#1e1f20] border border-white/10 text-gray-100 rounded-tl-none'
                }`}>
                  <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest opacity-40">
                    {msg.role === 'user' ? <User size={12}/> : <Cpu size={12}/>}
                    {msg.role === 'user' ? 'Sender' : 'Gemini AI'}
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                    {msg.text}
                  </p>
                </div>
              </motion.div>
            ))
          )}
          
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mb-8">
              <div className="bg-[#1e1f20] p-5 rounded-3xl border border-white/10 flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-gray-500 font-medium tracking-tight">Processing your request...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Animated Floating Input */}
      <div className="relative z-10 p-4 md:pb-10">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-10 group-focus-within:opacity-30 transition duration-1000"></div>
          <div className="relative flex items-center bg-[#1e1f20]/80 backdrop-blur-2xl rounded-2xl p-2 border border-white/10 shadow-2xl focus-within:border-blue-500/50 transition-all duration-300">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-base text-white placeholder-gray-500" 
              placeholder="Ask anything..." 
            />
            <button 
              onClick={handleSend} 
              disabled={loading} 
              className="p-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-500 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
