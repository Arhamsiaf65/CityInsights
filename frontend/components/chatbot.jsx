import React, { useState, useRef, useEffect, useContext } from 'react';
import { SendHorizonal } from 'lucide-react';
import Cookies from 'js-cookie';
import { userContext } from '../context/userContext';

const Chatbot = () => {
    const token = Cookies.get('token');
    const { user } = useContext(userContext);

    const [messages, setMessages] = useState([
        { from: 'bot', text: '👋 Hi there! How can I assist you today?' },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { from: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);

        try {
            const baseUrl = import.meta.env.VITE_BASE_URL;
            const res = await fetch(`${baseUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input, userId: user._id }),
            });

            const data = await res.json();
            const lines = data.reply.split('\n');

            // Start with an empty bot message
            setMessages(prev => [...prev, { from: 'bot', text: '' }]);

            for (let i = 0; i < lines.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 300)); // Delay

                setMessages(prev => {
                    const updated = [...prev];
                    const lastBot = updated[updated.length - 1];
                    updated[updated.length - 1] = {
                        ...lastBot,
                        text: lastBot.text + (lastBot.text ? '\n' : '') + lines[i],
                    };
                    return updated;
                });
            }
        } catch (err) {
            setMessages(prev => [...prev, { from: 'bot', text: '⚠️ Sorry, something went wrong.' }]);
        }

        setInput('');
        setLoading(false);
    };



    const handleKeyPress = (e) => {
        if (e.key === 'Enter') sendMessage();
    };

    return (
        <div className="w-full h-[80vh] sm:h-[85vh]  max-h-[90vh] p-3 sm:p-4 shadow-2xl rounded-2xl bg-white border border-gray-200 flex flex-col sm:max-w-xl">
            <div className="text-lg sm:text-2xl font-semibold mb-3 sm:mb-4 text-blue-600">
                🤖 City Insight Chatbot
            </div>

            <div className="flex-1 overflow-y-auto max-h-[65vh] sm:max-h-[75vh] px-2 py-3 space-y-3 bg-gray-50 rounded-lg border">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[85%] sm:max-w-[75%] px-3 py-2 rounded-2xl whitespace-pre-wrap text-sm shadow-sm ${msg.from === 'user'
                                ? 'bg-blue-500 text-white rounded-br-none'
                                : 'bg-gray-200 text-gray-900 rounded-bl-none'
                                }`}
                        >
                            {msg.text.split('\n').map((line, i) => (
                                <p key={i}>
                                    {line.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, j) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                            return <strong key={j}>{part.slice(2, -2)}</strong>;
                                        } else if (part.startsWith('*') && part.endsWith('*')) {
                                            return <strong key={j}>{part.slice(1, -1)}</strong>;
                                        }
                                        return part;
                                    })}
                                </p>
                            ))}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="mt-3 w-full relative">
  <input
    type="text"
    className="w-full pr-14 pl-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm placeholder:text-gray-500 transition"
    placeholder="Type your message..."
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={handleKeyPress}
    disabled={loading}
  />

  <button
    onClick={sendMessage}
    disabled={loading}
    className="absolute right-1 top-1 bottom-1 px-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-95 text-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <SendHorizonal size={18} />
  </button>
</div>





            {loading && <p className="text-xs text-gray-500 mt-2 text-right italic">Thinking...</p>}
        </div>

    );
};

export default Chatbot;
