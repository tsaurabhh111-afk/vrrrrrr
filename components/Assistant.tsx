import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { ChatMessage, MessageRole, SimulationState } from '../types';
import { getGeminiResponse } from '../services/geminiService';

interface Props {
    simState: SimulationState;
}

export const Assistant: React.FC<Props> = ({ simState }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: MessageRole.MODEL, text: "Hello! I'm your lab assistant. I can help you understand how to calculate resistance from the leakage rate. Charge the capacitor and let it discharge to start!" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsg: ChatMessage = { role: MessageRole.USER, text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const context = `
            Current Sim State:
            Voltage: ${simState.voltage.toFixed(2)} V
            Switch Position: ${simState.switchPosition}
            Capacitance: ${simState.capacitance} Farads
            True Resistance (Hidden from student): ${simState.resistance} Ohms
        `;

        const responseText = await getGeminiResponse([...messages, userMsg], context);
        
        setMessages(prev => [...prev, { role: MessageRole.MODEL, text: responseText }]);
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/90 rounded-lg overflow-hidden border border-slate-700">
            <div className="p-3 bg-slate-800 border-b border-slate-700 flex items-center gap-2">
                <Bot className="text-cyan-400" size={20} />
                <span className="font-semibold text-slate-200">AI Tutor</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                            msg.role === MessageRole.USER 
                            ? 'bg-cyan-600 text-white rounded-br-none' 
                            : 'bg-slate-700 text-slate-200 rounded-bl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-700 p-3 rounded-lg rounded-bl-none flex items-center gap-2">
                            <Loader2 className="animate-spin text-slate-400" size={16} />
                            <span className="text-xs text-slate-400">Thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3 bg-slate-800 border-t border-slate-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about the physics..."
                        className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={loading}
                        className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white disabled:opacity-50 transition"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
