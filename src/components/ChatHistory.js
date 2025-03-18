import React, { useState, useEffect } from "react";
import ApiService from "../services/api";

const ChatHistory = ({ onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentChat, setCurrentChat] = useState(ApiService.getSessionId());

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        console.log("[FETCH] Retrieving chat history...");
        const chatSessions = await ApiService.fetchAllChats();
        
        if (chatSessions.length === 0) {
          setError("No chat history found.");
        } else {
          setChats(chatSessions);
          setError(null);
        }
      } catch (err) {
        console.error("[ERROR] Fetching chat history:", err);
        setError("Failed to load chat history.");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const handleNewChat = async () => {
    console.log("[CHAT] Starting a new chat session...");
    const newSessionId = ApiService.startNewSession(); 
    setCurrentChat(newSessionId);
    setChats((prevChats) => [{ session_id: newSessionId, title: "New Chat" }, ...prevChats]);
    onSelectChat(newSessionId);
  };

  return (
    <div className="flex justify-center items-center w-full h-full">
      <div className="w-full max-w-xs h-[500px] p-6 rounded-2xl shadow-lg bg-white/10 border border-white/20 font-montserrat flex flex-col">
        <h2 className="text-center text-white font-semibold text-lg mb-4 tracking-wider">
          Chat History
        </h2>
        <button
          className="w-full py-3 bg-white text-gray-500 rounded-lg shadow-sm hover:bg-gray-200 transition-all"
          onClick={handleNewChat}
        >
          New Chat
        </button>

        {/* Scrollable Chat List */}
        <div className="mt-4 overflow-y-auto flex-1 space-y-3 no-scrollbar">
          {loading ? (
            <p className="text-center text-gray-300">Loading chats...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            chats.map((chat, index) => (
              <div
                key={chat.session_id}
                className={`w-full h-12 flex items-center justify-center rounded-lg cursor-pointer transition-all 
                  ${currentChat === chat.session_id ? "bg-blue-500 text-white" : "bg-gray-400 hover:bg-gray-500"}`}
                onClick={() => {
                  setCurrentChat(chat.session_id);
                  onSelectChat(chat.session_id);
                }}
              >
                {chat.title || `Chat ${index + 1}`}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
