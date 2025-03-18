import React, { useState, useEffect } from "react";
import { motion } from "framer-motion"; // Import animation library
import ChatHistory from "./ChatHistory";
import ChatInterface from "./ChatInterface";
import ApiService from "../services/api";

const ChatPage = () => {
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const lastSession = ApiService.getSessionId();
    console.log("[SESSION] Restoring last session:", lastSession);
    setSelectedSession(lastSession);
  }, []);

  useEffect(() => {
    if (selectedSession) {
      console.log("[UPDATE] Selected session has been updated:", selectedSession);
    }
  }, [selectedSession]);

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center items-center px-10 py-10" style={{ backgroundImage: "url('/background.jpg')" }}>
      
      {/* Main Content Container with Smooth Fade-in */}
      <motion.div 
        className="flex max-w-6xl w-full bg-transparent p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        
        {/* Left Section: Header & Chat History */}
        <div className="flex flex-col w-1/3 pr-6">
          
          {/* Animated Header */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="flex items-center mb-4">
              <img 
                src="/Rag app Logo - white.png" 
                alt="Proxy Lens Logo" 
                className="h-12 w-auto mr-2" 
              />
              <h1 className="text-3xl font-extrabold text-white">PROXY LENS</h1>
            </div>

            <p className="text-md font-semibold text-white">Welcome to ProxyLens!</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              Ask anything you want to know about the financial details of companies, 
              including proxy statements, governance reports, shareholder insights, and key financial metrics. 
              Get AI-powered, real-time insights to make informed decisions with ease.
            </p>
          </motion.div>

          {/* Chat History - Scales slightly on hover */}
          <motion.div 
            className="w-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <ChatHistory onSelectChat={(sessionId) => {
              console.log("[CHAT SELECTION] Switching to session:", sessionId);
              setSelectedSession(sessionId);
            }} />
          </motion.div>
        </div>

        {/* Right Section: Chat Interface - Smooth Entrance */}
        <motion.div 
          className="w-2/3 flex justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {selectedSession ? (
            <ChatInterface sessionId={selectedSession} />
          ) : (
            <div className="w-full h-full flex justify-center items-center text-gray-400 text-lg">
              Select a chat or start a new one
            </div>
          )}
        </motion.div>

      </motion.div>
    </div>
  );
};

export default ChatPage;
