import React, { useState } from 'react';
import { Sparkles, Languages, Volume2, MessageSquare, Send, Loader2, Bot } from 'lucide-react';

interface GeminiAssistantProps {
  explanationText: string;
  onTranslateLanguage: (lang: string) => void;
  farmContext: any;
}

export const GeminiAssistant: React.FC<GeminiAssistantProps> = ({
  explanationText,
  onTranslateLanguage,
  farmContext,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Namaste! I am your NutriHarvest AI assistant. I can explain your farm plan, answer soil/irrigation questions, and translate advice into your native language.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const languages = ['English', 'Hindi (हिंदी)', 'Marathi (मराठी)', 'Punjabi (ਪੰਜਾਬੀ)', 'Tamil (தமிழ்)', 'Telugu (తెలుగు)', 'Gujarati (ગુજરાતી)'];

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    onTranslateLanguage(lang);
  };

  const handleSpeakText = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech not supported in this browser.');
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(explanationText);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendQuery = async () => {
    if (!query.trim()) return;

    const userMsg = query;
    setQuery('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg, farmContext, targetLanguage: selectedLanguage }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { sender: 'ai', text: data.answer || 'Thank you for your question. Your plan is optimized for maximum net income and nutrition.' }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'I am currently processing offline. Please verify your irrigation schedule and mandi forecast in the main dashboard.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Explanation Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#EBE7DF] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#4A6741] flex items-center justify-center text-white shadow-xs">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-serif italic text-[#4A6741]">Gemini 3.6 Natural Language Farm Explainer</h2>
              <p className="text-xs text-[#6B6E6B]">Orchestrated AI explanation layer using structured JSON tool outputs.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Language dropdown */}
            <div className="flex items-center space-x-1.5 bg-[#F2EDE4] px-3 py-1.5 rounded-xl border border-[#D9D4C7] text-xs text-[#2D302D]">
              <Languages className="w-4 h-4 text-[#4A6741]" />
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-transparent font-bold focus:outline-none text-[#2D302D]"
              >
                {languages.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Readout button */}
            <button
              onClick={handleSpeakText}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                speaking
                  ? 'bg-[#FDF9F3] text-[#8B5E34] border-[#D4A373]/50 animate-pulse'
                  : 'bg-[#F2F8F0] text-[#4A6741] border-[#4A6741]/20 hover:bg-[#4A6741]/10'
              }`}
            >
              <Volume2 className="w-4 h-4 text-[#4A6741]" />
              <span>{speaking ? 'Stop Readout' : 'Listen Voice Advice'}</span>
            </button>
          </div>
        </div>

        {/* AI Output Paragraph */}
        <div className="bg-[#F9F7F2] p-5 rounded-xl border border-[#EBE7DF] text-[#2D302D] text-sm leading-relaxed">
          {explanationText}
        </div>
      </div>

      {/* Interactive Farmer Q&A Chat */}
      <div className="bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-[#EBE7DF] pb-3">
          <MessageSquare className="w-5 h-5 text-[#4A6741]" />
          <h3 className="font-bold text-[#2D302D] text-xs uppercase tracking-wider">Interactive Farmer Assistant Chat</h3>
        </div>

        {/* Chat message list */}
        <div className="bg-[#F9F7F2] p-4 rounded-xl border border-[#EBE7DF] min-h-[220px] max-h-[360px] overflow-y-auto space-y-3 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-[#4A6741] text-white rounded-br-none'
                    : 'bg-white border border-[#EBE7DF] text-[#2D302D] rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#EBE7DF] p-3 rounded-2xl rounded-bl-none text-[#6B6E6B] flex items-center space-x-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4A6741]" />
                <span>Gemini is generating response...</span>
              </div>
            </div>
          )}
        </div>

        {/* Query Input */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask anything about your crops, weather alerts, or mandi prices..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
            className="flex-1 px-4 py-2.5 border border-[#D9D4C7] rounded-xl text-xs text-[#2D302D] focus:ring-1 focus:ring-[#4A6741] focus:border-[#4A6741] focus:outline-none"
          />
          <button
            onClick={handleSendQuery}
            disabled={loading || !query.trim()}
            className="bg-[#4A6741] hover:bg-[#3A5033] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-xs transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
