import axios from "axios";

const BASE_URL = "http://localhost:8000/api/v1/query"; // Adjust if needed

const ApiService = {
  /**
   * Fetches all stored session IDs from localStorage.
   * @returns {Array} - List of stored session IDs.
   */
  getStoredSessions: () => {
    const storedSessions = JSON.parse(localStorage.getItem("chat_sessions")) || [];
    console.log("[SESSION] Stored Sessions:", storedSessions);
    return storedSessions;
  },

  /**
   * Saves session IDs persistently in localStorage.
   * @param {string} sessionId - The session ID to store.
   */
  storeSessionId: (sessionId) => {
    let storedSessions = ApiService.getStoredSessions();
    
    if (!storedSessions.includes(sessionId)) {
      storedSessions.unshift(sessionId); // Add new session to the front
      localStorage.setItem("chat_sessions", JSON.stringify(storedSessions));
      console.log("[SESSION] Updated Session List:", storedSessions);
    }
  },

  /**
   * Retrieves the current session ID from localStorage or generates a new one if needed.
   * @returns {string} - The current session ID.
   */
  getSessionId: () => {
    let sessionId = localStorage.getItem("chat_session_id");

    if (!sessionId) {
      const storedSessions = ApiService.getStoredSessions();
      sessionId = storedSessions.length > 0 ? storedSessions[0] : `session_${new Date().getTime()}_${Math.random().toString(36).substring(2, 10)}`;

      localStorage.setItem("chat_session_id", sessionId);
      ApiService.storeSessionId(sessionId);
    }

    console.log("[SESSION] Current Session ID:", sessionId);
    return sessionId;
  },

  /**
   * Starts a new chat session by creating a new session ID.
   */
  startNewSession: () => {
    const newSessionId = `session_${new Date().getTime()}_${Math.random().toString(36).substring(2, 10)}`;
    
    localStorage.setItem("chat_session_id", newSessionId);
    ApiService.storeSessionId(newSessionId);

    console.log("[SESSION] Started New Chat:", newSessionId);
    return newSessionId;
  },

  /**
   * Sends a user query to the backend for response generation.
   * @param {string} query - The user query.
   * @returns {Promise} - AI-generated response with metadata.
   */
  generateAnswer: async (query) => {
    const sessionId = ApiService.getSessionId();

    try {
      console.log("[API CALL] Sending query:", { query, sessionId });

      const response = await axios.get(`${BASE_URL}/generate`, {
        params: { query, session_id: sessionId },
      });

      if (response.data.error) {
        console.error("Generation error:", response.data.error);
        return { error: "⚠️ An error occurred while generating the response." };
      }

      console.log("[API RESPONSE] Data received:", response.data);
      return {
        query: response.data.query || query,
        response: response.data.response || "I couldn't generate a relevant answer. Try rephrasing your query!",
        source: response.data.source || "unknown",
        annualReports: response.data.annual_reports || [],
        proxyStatements: response.data.proxy_statements || [],
        processingTime: response.data.processing_time || null,
        chatHistory: response.data.chat_history || [],
      };
    } catch (error) {
      console.error("[ERROR] generateAnswer:", error.response?.data || error);
      return {
        error: "⚠️ Unable to generate a response. Please try again later.",
        chatHistory: [],
      };
    }
  },

  /**
   * Fetches all chat sessions (titles & session IDs) for listing in the navbar.
   * @returns {Promise} - Resolves with an array of chat session objects.
   */
  fetchAllChats: async () => {
    try {
      console.log("[API CALL] Fetching all chat sessions...");

      const response = await axios.get(`${BASE_URL}/chat-history`);
      let chatSessions = response.data.chat_sessions || [];

      // Ensure stored session list is updated
      chatSessions.forEach(chat => ApiService.storeSessionId(chat.session_id));

      console.log("[API RESPONSE] Chat sessions fetched:", chatSessions);
      return chatSessions;
    } catch (error) {
      console.error("[ERROR] fetchAllChats:", error.response?.data || error);
      return [];
    }
  },

  /**
   * Fetches chat history for the current session.
   * @returns {Promise} - Resolves with past chat messages.
   */
  fetchChatHistory: async () => {
    const sessionId = ApiService.getSessionId();

    try {
      console.log(`[API CALL] Fetching history for session: ${sessionId}`);

      const response = await axios.get(`${BASE_URL}/chat-history/${sessionId}`);
      console.log("[API RESPONSE] Chat history:", response.data.chat_history || []);

      return response.data.chat_history || [];
    } catch (error) {
      console.error("[ERROR] fetchChatHistory:", error.response?.data || error);
      return [];
    }
  },

  /**
   * Clears the current session without deleting old ones.
   */
  clearCurrentSession: () => {
    console.log("[SESSION] Clearing current session...");
    localStorage.removeItem("chat_session_id");
  },
};

export default ApiService;
