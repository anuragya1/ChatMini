import { useState, useEffect, useRef } from "react";
import { Search, Send, LogOut, MoreVertical, Sun, Moon, User, MessageCircle, ArrowLeft } from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";

function Chat() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [socket, setSocket] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("conversations");
  const messagesEndRef = useRef(null);

  const getCurrentUser = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user || {};
    } catch (error) {
      console.error("Error parsing user:", error);
      return {};
    }
  };

  const [currentUser] = useState(getCurrentUser());

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Socket.IO connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !currentUser.id) return;

    const newSocket = io("http://localhost:5000", {
      auth: { token },
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Connected to Socket.IO");
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Connection failed:", err.message);
      setError("Connection failed. Please refresh.");
    });

    // REAL-TIME: Receive new messages
    newSocket.on("new message", (msg) => {
      console.log("📩 New message received:", msg);
      
      // Add message if it's for current conversation
      if (
        selectedUser &&
        (msg.sender._id === selectedUser._id || msg.recipient._id === selectedUser._id)
      ) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === msg._id);
          return exists ? prev : [...prev, msg];
        });
      }

      // Update conversations list
      loadConversations();
    });

    return () => newSocket.disconnect();
  }, [currentUser.id, selectedUser]);

  // Load conversations
  const loadConversations = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/conversations", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      if (response.data.status === "success") {
        setConversations(response.data.data.conversations || []);
      }
    } catch (err) {
      console.error("Error loading conversations:", err);
    }
  };

  // Load messages
  const loadMessages = async () => {
    if (!selectedUser) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `http://localhost:5000/api/messages/${selectedUser._id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMessages(response.data || []);

      // Mark as read
      await axios.patch(
        `http://localhost:5000/api/conversations/${selectedUser._id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      loadConversations();
    } catch (err) {
      console.error("Error loading messages:", err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      loadMessages();
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Search users
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length >= 2) {
      setSearchLoading(true);
      setActiveTab("search");

      try {
        const response = await axios.get(
          `http://localhost:5000/api/users/search?q=${query}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        
        const userData = response.data.status === "success" 
          ? response.data.data.users 
          : response.data.users;
        
        setUsers(userData || []);
      } catch (err) {
        console.error("Search error:", err);
        setUsers([]);
      } finally {
        setSearchLoading(false);
      }
    } else {
      setUsers([]);
      setActiveTab("conversations");
    }
  };

  // Select user from conversation or search
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setError("");
    setActiveTab("conversations");
  };

  // Back to conversations (mobile)
  const handleBack = () => {
    setSelectedUser(null);
  };

  // Send message
  const handleSend = (e) => {
    e.preventDefault();
    if (content.trim() && selectedUser && socket) {
      const messageContent = content.trim();
      setContent("");

      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        sender: {
          _id: currentUser.id,
          username: currentUser.username || "You",
        },
        recipient: {
          _id: selectedUser._id,
          username: selectedUser.username,
        },
        content: messageContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      socket.emit(
        "send message",
        {
          recipientId: selectedUser._id,
          content: messageContent,
        },
        (response) => {
          if (response && response.success) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg._id === optimisticMessage._id
                  ? { ...msg, _id: response._id, timestamp: response.timestamp }
                  : msg
              )
            );
            loadConversations();
          } else if (response && response.error) {
            setMessages((prev) =>
              prev.filter((msg) => msg._id !== optimisticMessage._id)
            );
            setError(response.error);
          }
        }
      );
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`h-screen flex overflow-hidden ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      {/* Sidebar - Hidden on mobile when chat is selected */}
      <div className={`${selectedUser ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} md:border-r flex-col`}>
        {/* Header */}
        <div className={`p-3 sm:p-4 ${darkMode ? "border-gray-700" : "border-gray-200"} border-b flex items-center justify-between`}>
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="text-xl sm:text-2xl flex-shrink-0">👨‍💼</div>
            <div className="min-w-0 flex-1">
              <h3 className={`font-semibold text-sm sm:text-base truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                {currentUser.username || "User"}
              </h3>
              <p className={`text-xs sm:text-sm ${darkMode ? "text-green-400" : "text-green-500"}`}>
                Online
              </p>
            </div>
          </div>
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`p-2 rounded-full ${darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-600"} transition-colors`}
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {showUserMenu && (
              <div className={`absolute right-0 top-full mt-2 w-48 ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"} border rounded-lg shadow-lg z-20`}>
                <button
                  onClick={() => {
                    setDarkMode(!darkMode);
                    setShowUserMenu(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm ${darkMode ? "text-gray-300 hover:bg-gray-600" : "text-gray-700 hover:bg-gray-50"} rounded-t-lg`}
                >
                  {darkMode ? <Sun className="h-4 w-4 mr-3" /> : <Moon className="h-4 w-4 mr-3" />}
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-b-lg"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="p-3 sm:p-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search users..."
              className={`w-full pl-10 pr-10 py-2 text-sm sm:text-base ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500"} border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setUsers([]);
                  setActiveTab("conversations");
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "search" ? (
            searchLoading ? (
              <div className="p-8 text-center">
                <div className={`inline-block animate-spin rounded-full h-6 w-6 border-b-2 ${darkMode ? "border-purple-400" : "border-purple-500"}`}></div>
                <p className={`text-sm mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Searching...
                </p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <User className={`h-12 w-12 mx-auto mb-3 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  No users found
                </p>
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                  className={`p-3 sm:p-4 border-b cursor-pointer ${selectedUser?._id === user._id ? darkMode ? "bg-purple-900" : "bg-purple-50" : darkMode ? "hover:bg-gray-700 active:bg-gray-700" : "hover:bg-gray-50 active:bg-gray-50"} ${darkMode ? "border-gray-700" : "border-gray-200"}`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="text-xl sm:text-2xl flex-shrink-0">{user.avatar || "👤"}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold text-sm sm:text-base truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {user.username}
                      </h4>
                      {user.email && (
                        <p className={`text-xs sm:text-sm truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className={`h-12 w-12 mx-auto mb-3 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                No conversations yet
              </p>
              <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                Search for users to start chatting
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => handleUserSelect(conv.user)}
                className={`p-3 sm:p-4 border-b cursor-pointer transition-all ${
                  selectedUser?._id === conv.user._id
                    ? darkMode
                      ? "bg-purple-900 border-purple-700"
                      : "bg-purple-50 border-purple-200"
                    : darkMode
                    ? "hover:bg-gray-700 active:bg-gray-700 border-gray-700"
                    : "hover:bg-gray-50 active:bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="relative flex-shrink-0">
                    <div className="text-xl sm:text-2xl">{conv.user.avatar || "👤"}</div>
                    {conv.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`font-semibold text-sm sm:text-base truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {conv.user.username}
                      </h4>
                      <span className={`text-xs flex-shrink-0 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {formatTime(conv.lastMessage?.timestamp)}
                      </span>
                    </div>
                    {conv.lastMessage?.content && (
                      <p className={`text-xs sm:text-sm truncate ${darkMode ? "text-gray-400" : "text-gray-500"} ${conv.unreadCount > 0 ? "font-semibold" : ""}`}>
                        {conv.lastMessage.sender.toString() === currentUser.id ? "You: " : ""}
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area - Full screen on mobile when user is selected */}
      <div className={`${selectedUser ? "flex" : "hidden md:flex"} flex-1 flex-col min-w-0`}>
        {/* Chat Header */}
        <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b p-3 sm:p-4 flex items-center justify-between`}>
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            {selectedUser && (
              <button
                onClick={handleBack}
                className={`md:hidden p-2 -ml-2 rounded-full ${darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-600"} transition-colors flex-shrink-0`}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            {selectedUser ? (
              <>
                <div className="text-xl sm:text-2xl flex-shrink-0">{selectedUser.avatar || "👤"}</div>
                <div className="min-w-0 flex-1">
                  <h2 className={`text-base sm:text-lg font-semibold truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {selectedUser.username}
                  </h2>
                  {selectedUser.email && (
                    <p className={`text-xs sm:text-sm truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {selectedUser.email}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <h2 className={`text-base sm:text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Select a conversation to start chatting
              </h2>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className={`flex-1 overflow-y-auto p-3 sm:p-4 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
          {!selectedUser ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center px-4">
                <div className={`text-4xl sm:text-6xl mb-4 ${darkMode ? "text-gray-700" : "text-gray-300"}`}>
                  💬
                </div>
                <p className={`text-base sm:text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Choose a conversation to get started
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className={`inline-block animate-spin rounded-full h-8 w-8 border-b-2 ${darkMode ? "border-purple-400" : "border-purple-500"}`}></div>
                <p className={`text-sm mt-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Loading messages...
                </p>
              </div>
            </div>
          ) : error && !searchQuery ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-red-500 text-center px-4 text-sm sm:text-base">{error}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className={`text-center px-4 text-sm sm:text-base ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => {
                const isCurrentUser = msg.sender._id === currentUser.id;
                return (
                  <div
                    key={msg._id || i}
                    className={`mb-3 sm:mb-4 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg p-3 rounded-2xl ${
                        isCurrentUser
                          ? "bg-purple-500 text-white"
                          : darkMode
                          ? "bg-gray-700 text-white"
                          : "bg-white text-gray-900 shadow-sm"
                      }`}
                    >
                      <p className="text-sm sm:text-base whitespace-pre-wrap break-words">{msg.content}</p>
                      <div className={`flex items-center mt-1 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                        <span className={`text-xs ${isCurrentUser ? "text-purple-200" : darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        {selectedUser && (
          <div className={`p-3 sm:p-4 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-t`}>
            <form onSubmit={handleSend} className="flex gap-2 sm:gap-3">
              <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Message ${selectedUser.username}...`}
                className={`flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
              <button
                type="submit"
                disabled={!content.trim()}
                className="px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;