import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ApiService from "../services/api";

const ChatInterface = ({ sessionId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    console.log(`[FETCH] Retrieving chat history for session: ${sessionId}`);
    const loadChatHistory = async () => {
      const chatHistory = await ApiService.fetchChatHistory();
      if (Array.isArray(chatHistory)) {
        const formattedMessages = chatHistory.flatMap((chat) => {
          let botMessages = [];
          if (Array.isArray(chat.bot)) {
            botMessages = chat.bot.map((botMsg) => ({
              sender: "GUY",
              text: botMsg.content || "No response available.",
              type: "bot",
            }));
          } else if (typeof chat.bot === "string") {
            botMessages = [{ sender: "GUY", text: chat.bot, type: "bot" }];
          }
          return [{ sender: "You", text: chat.user, type: "user" }, ...botMessages];
        });

        setMessages(formattedMessages);
      } else {
        console.warn("[WARNING] Chat history is not an array. Resetting.");
        setMessages([]);
      }
    };

    loadChatHistory();
  }, [sessionId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "You", text: input, type: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTyping(true);

    try {
      console.log(`[SEND] Sending message: ${input} for session: ${sessionId}`);
      const generatedResponse = await ApiService.generateAnswer(input);

      setTimeout(() => {
        const botMessage = {
          sender: "GUY",
          text: generatedResponse.response || "I couldn't generate a relevant response.",
          type: "bot",
        };
        setMessages((prev) => [...prev, botMessage]);
        setTyping(false);
      }, 1000);
    } catch (error) {
      console.error("[ERROR] Fetching response:", error);
      setTyping(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="w-full h-full p-6 rounded-2xl shadow-lg bg-white/10 border border-white/20 flex flex-col">
        
        {/* Messages Area with Slide-in Effect */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {messages.map((msg, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, x: msg.type === "user" ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className={`text-sm ${msg.type === "user" ? "text-left" : "text-right"}`}
            >
              <p className="text-gray-600">{msg.sender}</p>
              <motion.p 
                className="italic text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {msg.text}
              </motion.p>
            </motion.div>
          ))}
          {typing && (
            <motion.p 
              className="text-right text-gray-500 italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "mirror" }}
            >
              GUY is thinking...
            </motion.p>
          )}
        </div>

        {/* Input Area with Interactive Animations */}
        <motion.div 
          className="mt-auto flex items-center bg-white/40 backdrop-blur-md rounded-lg p-3 shadow-inner"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.input
            type="text"
            className="flex-1 bg-transparent border-none focus:outline-none text-white-700 placeholder-gray-500"
            placeholder="Ask this guy a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            whileFocus={{ boxShadow: "0px 0px 8px rgba(255, 255, 255, 0.6)" }}
          />
          <motion.button 
            onClick={sendMessage} 
            className="ml-2 text-gray-700 hover:text-gray-900"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ▶
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatInterface;
