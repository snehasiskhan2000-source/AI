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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef(null);

  const toggleTheme = () => setIsDark(!isDark);

  // VOICE FUNCTION: Reads the text aloud
  const speak = (text) => {
    window.speechSynthesis.cancel(); // Stop any current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    
    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const aiMessageId = Date.now();
    setMessages(prev => [...prev, { role: "ai", text: "", id: aiMessageId }]);

    try {
      const groq = new Groq({ apiKey: API_KEY, dangerouslyAllowBrowser: true });
      const stream = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are ChadGPT. Use markdown for lists, bold text, and code. Be professional yet bold." },
          { role: "user", content: input }
        ],
        model: "llama-3.3-70b-versatile",
        stream: true,
      });

      let fullResponse = "";
      for await (const chunk of stream) {
        fullResponse += chunk.choices[0]?.delta?.content || "";
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId ? { ...msg, text: fullResponse } : msg
        ));
      }
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId ? { ...msg, text: "Error: Could not connect to ChadGPT." } : msg
      ));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${isDark ? 'dark bg-[#0b0b0f]' : 'bg-gray-50'} min-h-screen text-gray-900 dark:text-white flex flex-col font-sans transition-colors duration-300`}>
      
      {/* Header */}
      <nav className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-white/5 backdrop-blur-lg sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-orange-600 p-1.5 rounded-lg shadow-lg">
            <Zap className="text-white" size={18} fill="white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">Chad<span className="text-orange-500">GPT</span></span>
        </div>
        
        <div className="flex gap-2">
          <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/5 transition-all">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setMessages([])} className="p-2.5 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-500">
            <Trash2 size={20} />
          </button>
        </div>
      </nav>

      {/* Messages */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 max-w-4xl mx-auto w-full space-y-6">
        <AnimatePresence>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center pt-32 opacity-20">
              <h2 className="text-7xl font-black">CHADGPT</h2>
            </div>
          ) : (
            messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                  ? 'bg-orange-600 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-[#16161c] border border-gray-200 dark:border-white/5 rounded-tl-none'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
                      {msg.role === 'user' ? <User size={12}/> : <Zap size={12}/>}
                      {msg.role === 'user' ? 'Member' : 'ChadGPT'}
                    </div>
                    
                    {/* Voice Button - Only for AI messages */}
                    {msg.role === 'ai' && msg.text && (
                      <button 
                        onClick={() => isSpeaking ? stopSpeaking() : speak(msg.text)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition-colors text-orange-500"
                      >
                        {isSpeaking ? <StopCircle size={16} /> : <Volume2 size={16} />}
                      </button>
                    )}
                  </div>

                  {/* Markdown Renderer (Makes text look like Gemini) */}
                  <div className="prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-900">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </main>

      {/* Input */}
      <div className={`p-4 pb-10 sticky bottom-0 ${isDark ? 'bg-[#0b0b0f]' : 'bg-gray-50'}`}>
        <div className="max-w-3xl mx-auto flex items-center bg-white dark:bg-[#16161c] rounded-2xl p-1.5 border border-gray-200 dark:border-white/10 shadow-2xl">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
            className="flex-1 bg-transparent border-none outline-none p-4 text-gray-800 dark:text-white placeholder-gray-400" 
            placeholder="Type a message..." 
          />
          <button onClick={handleSend} disabled={loading} className="bg-orange-600 hover:bg-orange-500 text-white p-4 rounded-xl shadow-lg active:scale-95 disabled:opacity-30 transition-all">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
