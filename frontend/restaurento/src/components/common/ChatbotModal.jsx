import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import api from "../../services/api";

const QUICK_SUGGESTIONS = [
    "How do I cancel a booking?",
    "When will I get my refund?",
    "How do coupons work?",
];

const TypingIndicator = () => (
    <div className="flex items-end gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-[#ff5e00] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Sparkles size={13} className="text-white" />
        </div>
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff5e00] animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-[#ff5e00] animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 rounded-full bg-[#ff5e00] animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
    </div>
);

const ChatbotModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm Resto, your AI support assistant 🍽️ Ask me anything about Restaurento policies, bookings, or refunds!", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    const toggleChat = () => setIsOpen((prev) => !prev);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [messages, isOpen]);

    // Close when clicking outside the chat window
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isOpen && containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isOpen]);

    const sendMessage = async (text) => {
        if (!text.trim() || isLoading) return;

        setShowSuggestions(false);
        setMessages((prev) => [...prev, { text, sender: "user" }]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await api.post("/chat", { message: text });
            if (response.data.success) {
                setMessages((prev) => [...prev, { text: response.data.reply, sender: "bot" }]);
            } else {
                setMessages((prev) => [...prev, { text: "Sorry, I couldn't process that. Please try again! 😊", sender: "bot" }]);
            }
        } catch {
            setMessages((prev) => [...prev, { text: "I'm having trouble connecting right now. Please try again in a moment! 🙏", sender: "bot" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <>
            {/* Wrapper captures all chat elements for click-outside detection */}
            <div ref={containerRef} className="contents">
                {/* FAB Button */}
                <div className="fixed bottom-6 right-6 z-[100]">
                    {/* Pulse ring */}
                    {!isOpen && (
                        <span className="absolute inset-0 rounded-full bg-[#ff5e00] opacity-30 animate-ping" />
                    )}
                    <button
                        onClick={toggleChat}
                        aria-label="Toggle support chat"
                        className="relative w-14 h-14 bg-[#ff5e00] hover:bg-[#e05200] text-white rounded-full shadow-lg shadow-orange-200 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center"
                    >
                        <div className={`transition-all duration-300 ${isOpen ? "rotate-90 opacity-0 absolute" : "rotate-0 opacity-100"}`}>
                            <MessageSquare size={22} />
                        </div>
                        <div className={`transition-all duration-300 ${isOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0 absolute"}`}>
                            <X size={22} />
                        </div>
                    </button>
                </div>

                {/* Chat Window */}
                <div
                    className={`fixed bottom-24 right-6 w-[22rem] sm:w-96 z-[100] transition-all duration-300 origin-bottom-right ${isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-90 opacity-0 pointer-events-none"
                        }`}
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col h-[520px] max-h-[80vh] overflow-hidden">

                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#ff5e00] to-orange-400 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                                    <Sparkles size={17} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm leading-none">Resto AI</p>
                                    <p className="text-orange-100 text-xs mt-0.5 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
                                        Online
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={toggleChat}
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3 custom-scrollbar">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex items-end gap-2 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                    {msg.sender === "bot" && (
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-[#ff5e00] flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <Sparkles size={13} className="text-white" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.sender === "user"
                                            ? "bg-[#ff5e00] text-white rounded-br-none shadow-sm shadow-orange-100"
                                            : "bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-none"
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}

                            {isLoading && <TypingIndicator />}

                            {/* Quick Suggestions */}
                            {showSuggestions && !isLoading && (
                                <div className="flex flex-col gap-2 mt-1">
                                    <p className="text-xs text-gray-400 font-medium px-1">Quick questions:</p>
                                    {QUICK_SUGGESTIONS.map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => sendMessage(suggestion)}
                                            className="text-left text-xs px-3 py-2 rounded-xl border border-orange-200 bg-orange-50 text-[#ff5e00] font-medium hover:bg-orange-100 transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100">
                            <div className="flex items-center gap-2 bg-gray-50 rounded-full border border-gray-200 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 transition-all px-4 py-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask a question..."
                                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="w-8 h-8 bg-[#ff5e00] text-white rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#e05200] transition-colors flex-shrink-0"
                                >
                                    <Send size={14} className="translate-x-px" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>{/* end containerRef */}
        </>
    );
};

export default ChatbotModal;


