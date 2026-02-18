import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Cpu, User, Trash2 } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize AI with the environment variable
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!API_KEY) {
      setMessages(prev => [...prev, { role: "ai", text: "Error: API Key missing in Render settings." }]);
      return;
    }

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(input);
      const response = await result.response;
      setMessages((prev) => [...prev, { role: "ai", text: response.text() }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "ai", text: "I'm having trouble connecting. Check your API key." }]);
    }
    setLoading(false);
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="min-h-screen bg-[#0e0e12] text-white font-sans overflow-hidden flex flex-col">
      {/* Background Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/20 blur-[120px] rounded-full animate-pulse" />

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center p-5 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <Sparkles className="text-blue-400" size={20} />
          <span className="text-xl font-bold tracking-tight">Gemini <span className="text-blue-500">Pro</span></span>
        </div>
        <div className="flex gap-4">
          <button onClick={clearChat} className="p-2 text-gray-400 hover:text-red-400 transition">
            <Trash2 size={20} />
          </button>
          <button className="px-5 py-2 bg-white text-black rounded-full font-medium text-sm hover:scale-105 transition">Sign Up</button>
        </div>
      </nav>

      {/* Chat Window */}
      <main ref={scrollRef} className="flex-1 relative z-10 max-w-4xl mx-auto w-full overflow-y-auto px-4 py-8 custom-scrollbar">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col justify-center items-center text-center mt-20">
              <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent mb-4">Hello, Bittu</h2>
              <p className="text-gray-400 text-lg">How can I assist your project today?</p>
            </motion.div>
          ) : (
            messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-4 mb-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl shadow-lg ${msg.role === 'user' ? 'bg-[#282a2d] text-white' : 'bg-[#1e1f20] border border-gray-800 text-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase tracking-widest opacity-50">
                    {msg.role === 'user' ? <User size={12}/> : <Cpu size={12}/>}
                    {msg.role === 'user' ? 'You' : 'Gemini'}
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </motion.div>
            ))
          )}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 mb-6">
              <div className="bg-[#1e1f20] p-4 rounded-2xl border border-gray-800 italic text-gray-500 animate-pulse">Gemini is thinking...</div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Input Bar */}
      <div className="relative z-10 pb-10 px-4">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
          <div className="relative flex items-center bg-[#1e1f20] rounded-2xl p-2 border border-white/10 shadow-2xl">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent border-none outline-none p-4 text-white placeholder-gray-500" 
              placeholder="Enter a prompt here..." 
            />
            <button onClick={handleSend} disabled={loading} className="p-4 text-blue-400 hover:scale-110 disabled:opacity-50 transition">
              {loading ? <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div> : <Send size={22} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
