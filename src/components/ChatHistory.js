import React, { useState, useEffect } from "react";
import { fetchChatSessions, startNewChat, fetchChatHistory } from "../services/api";

const ChatHistory = ({ onChatSelect }) => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load chat sessions on component mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true);
        console.log("[FETCH] Retrieving chat sessions...");
        const chatSessions = await fetchChatSessions();

        if (chatSessions.length === 0) {
          setError("No chat history found.");
        } else {
          setChats(chatSessions);
          setError(null);
        }
      } catch (err) {
        console.error("[ERROR] Fetching chat sessions:", err);
        setError("Failed to load chat history.");
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, []);

  // Start a new chat session
  const handleNewChat = async () => {
    console.log("[CHAT] Starting a new chat session...");
    try {
      const newChat = await startNewChat();
      setCurrentChat(newChat.session_id);
      setChats((prevChats) => [{ session_id: newChat.session_id, title: "New Chat" }, ...prevChats]);
      onChatSelect(newChat.session_id, []);
    } catch (err) {
      console.error("[ERROR] Failed to create a new chat:", err);
      setError("Could not create a new chat.");
    }
  };

  // Handle chat selection
  const handleChatClick = async (session_id) => {
    if (session_id !== currentChat) {
      console.log(`[FETCH] Loading chat history for session: ${session_id}`);
      setCurrentChat(session_id);
      try {
        const chatData = await fetchChatHistory(session_id);
        onChatSelect(session_id, chatData);
      } catch (err) {
        console.error("[ERROR] Fetching chat history:", err);
        setError("Error loading chat history.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-full">
      <div className="w-full max-w-xs h-[500px] p-6 rounded-2xl shadow-lg bg-white/10 border border-white/20 font-montserrat flex flex-col">
        <h2 className="text-center text-white font-semibold text-lg mb-4 tracking-wider">
          Chat History
        </h2>

        {/* New Chat Button */}
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
          ) : chats.length === 0 ? (
            <p className="text-center text-gray-300">No chats available.</p>
          ) : (
            chats.map((chat, index) => (
              <div
                key={chat.session_id}
                className={`w-full h-12 flex items-center justify-center rounded-lg cursor-pointer transition-all 
                  ${currentChat === chat.session_id ? "bg-blue-500 text-white" : "bg-gray-400 hover:bg-gray-500"}`}
                onClick={() => handleChatClick(chat.session_id)}
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
