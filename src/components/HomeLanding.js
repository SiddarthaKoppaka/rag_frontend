import React from "react";
import { motion } from "framer-motion";

const HomeLanding = ({ onStartNewChat }) => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="w-full max-h-[900px] h-full p-6 rounded-2xl shadow-lg bg-white/10 border border-white/20 flex flex-col items-center text-center">
        
        {/* Welcome Message */}
        <motion.h1 
          className="text-3xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Welcome to Proxy Lens
        </motion.h1>

        <motion.p 
          className="text-lg text-gray-300 leading-relaxed max-w-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        >
          Get AI-powered, real-time insights on company financials, governance reports, 
          and shareholder insights. Start a conversation to explore more!
        </motion.p>

        {/* Call to Action */}
        <motion.div 
          className="mt-6"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <button 
            className="px-6 py-3 bg-white text-black rounded-lg shadow-md hover:bg-gray-300 transition-all"
            onClick={onStartNewChat} // ✅ Ensure correct function is triggered
          >
            Start a New Chat
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeLanding;
