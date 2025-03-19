import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { sendMessage, fetchChatHistory } from "../services/api";

const ChatInterface = ({ activeSession }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load chat history when session changes
  useEffect(() => {
    if (!activeSession) {
      console.warn("[WARNING] No active session found.");
      return;
    }

    console.log(`[FETCH] Retrieving chat history for session: ${activeSession}`);

    const loadChatHistory = async () => {
      try {
        const chatHistory = await fetchChatHistory(activeSession);
        
        if (!chatHistory || !Array.isArray(chatHistory)) {
          throw new Error("Invalid chat history format");
        }

        const formattedMessages = chatHistory.flatMap((msg) => [
          { sender: "You", text: msg.user || "No message", type: "user" },
          { sender: "GUY", text: msg.bot || "No response", type: "bot" },
        ]);

        setMessages(formattedMessages);
        console.log("[SUCCESS] Chat history loaded:", formattedMessages);
        scrollToBottom();
      } catch (error) {
        console.error("[ERROR] Failed to load chat history:", error);
        setMessages([{ sender: "GUY", text: "Error retrieving chat history.", type: "bot" }]);
      }
    };

    loadChatHistory();
  }, [activeSession]);

  const handleSendMessage = async () => {
    if (!input.trim() || !activeSession) {
      console.warn("[WARNING] No input or active session is missing.");
      return;
    }

    console.log(`[SEND] Sending message: "${input}" for session: ${activeSession}`);

    const userMessage = { sender: "You", text: input, type: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTyping(true);
    scrollToBottom();

    try {
      const responseData = await sendMessage(input, activeSession);
      console.log("[SUCCESS] API Response received:", responseData);

      if (!responseData || typeof responseData.response !== "string") {
        throw new Error("Invalid API response format.");
      }

      const botResponseMessage = {
        sender: "GUY",
        text: responseData.response || "I couldn't generate a relevant response.",
        type: "bot",
      };

      setTimeout(() => {
        setMessages((prev) => [...prev, botResponseMessage]);
        setTyping(false);
        scrollToBottom();
      }, 1000);
    } catch (error) {
      console.error("[ERROR] Failed to fetch bot response:", error);
      setMessages((prev) => [...prev, { sender: "GUY", text: "Error retrieving response.", type: "bot" }]);
      setTyping(false);
      scrollToBottom();
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full max-h-[900px] h-full p-6 rounded-2xl shadow-lg bg-white/10 border border-white/20 flex flex-col">
        
        {/* Messages Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar" style={{ maxHeight: "850px" }}>
          {messages.map((msg, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, x: msg.type === "user" ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className={`text-sm ${msg.type === "user" ? "text-right" : "text-justify"}`}
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
              className="text-left text-gray-500 italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "mirror" }}
            >
              Searching...
            </motion.p>
          )}
          <div ref={messagesEndRef} /> {/* Scroll anchor */}
        </div>

        {/* Input Area - Fixed Position */}
        <motion.div 
          className="mt-auto flex items-center bg-white/40 backdrop-blur-md rounded-lg p-3 shadow-inner"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.input
            type="text"
            className="flex-1 bg-transparent border-none focus:outline-none text-white-700 placeholder-gray-500"
            placeholder="Go on ! Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            whileFocus={{ boxShadow: "0px 0px 8px rgba(255, 255, 255, 0.6)" }}
          />
          <motion.button 
            onClick={handleSendMessage} 
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
