import axios from "axios";

// Create Axios instance
const api = axios.create({
  baseURL: "http://localhost:8000/api/v1/query/", // Adjust based on FastAPI server URL
  timeout: 50000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Stores active chat sessions
let chatSessions = [];
let activeSession = null;

// Utility function to generate a new session ID
const generateSessionID = () => `session_${Date.now()}`;

// API Calls
export const fetchChatSessions = async () => {
  try {
    const response = await api.get("/chat-history"); // Corrected endpoint
    return response.data.chat_sessions || [];
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return [];
  }
};

export const fetchChatHistory = async (session_id) => {
  try {
    const response = await api.get(`/chat-history/${session_id}`); // Corrected endpoint
    return response.data.chat_history || [];
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
};

export const startNewChat = async () => {
  const newSessionID = `session_${Date.now()}`;
  return { session_id: newSessionID, chat_history: [] };
};

export const sendMessage = async (query, session_id) => {
  try {
    const response = await api.get("/generate", { params: { query, session_id } });
    return { session_id, chat_history: response.data.chat_history, response: response.data.response };
  } catch (error) {
    console.error("Error sending message:", error);
    return { session_id, chat_history: [], response: "Error retrieving response." };
  }
};


// Get response using Agentic RAG
export const sendAgenticMessage = async (query) => {
  if (!activeSession) {
    activeSession = generateSessionID();
  }

  try {
    const response = await api.get(`/agentic_rag/`, {
      params: { query, session_id: activeSession },
    });

    return {
      session_id: activeSession,
      response: response.data.response,
    };
  } catch (error) {
    console.error("Error sending agentic message:", error);
    return {
      session_id: activeSession,
      response: "Error retrieving response.",
    };
  }
};

// Export API instance and session utilities
export default api;
export { chatSessions, activeSession };
