import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Cpu } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace 'YOUR_API_KEY' with your actual Google AI Studio Key
const genAI = new GoogleGenerativeAI("YOUR_API_KEY");

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(input);
      const response = await result.response;
      setMessages((prev) => [...prev, { role: "ai", text: response.text() }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "Error connecting to AI." }]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0e0e12] text-white font-sans overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/20 blur-[150px] rounded-full animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[150px] rounded-full" />

      {/* Header */}
      <nav className="relative z-10 flex justify-between items-center p-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Sparkles className="text-blue-400" />
          <span className="text-xl font-bold tracking-tight">Gemini <span className="text-blue-500 underline decoration-2">Pro</span></span>
        </div>
        <button className="px-5 py-2 bg-white text-black rounded-full font-medium text-sm hover:scale-105 transition">Sign Up</button>
      </nav>

      {/* Chat Area */}
      <main className="relative z-10 max-w-4xl mx-auto h-[70vh] overflow-y-auto px-4 mt-4 custom-scrollbar">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col justify-center items-center text-center">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent mb-4">Hello, Friend</h2>
              <p className="text-gray-400 text-lg">How can I help you explore today?</p>
            </motion.div>
          ) : (
            messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className={`flex gap-4 mb-8 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-[#282a2d]' : 'bg-transparent border border-gray-800 shadow-xl'}`}>
                   <p className="text-gray-200 leading-relaxed">{msg.text}</p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </main>

      {/* Floating Input Box */}
      <div className="fixed bottom-10 left-0 right-0 px-4">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition duration-500"></div>
          <div className="relative flex items-center bg-[#1e1f20] rounded-2xl p-2 border border-gray-700/50">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent border-none outline-none p-4 text-lg placeholder-gray-500" 
              placeholder="Ask me anything..." 
            />
            <button onClick={handleSend} className="p-4 text-blue-400 hover:text-blue-300 transition">
              {loading ? <Cpu className="animate-spin" /> : <Send />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
