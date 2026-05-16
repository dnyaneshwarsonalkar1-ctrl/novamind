import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import {
  FiMic,
  FiChevronRight,
  FiPlus,
  FiLogOut,
} from "react-icons/fi";
import { FaInstagram } from "react-icons/fa";

function AppContent() {

  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [listening, setListening] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [infoText, setInfoText] = useState("");
  const [displayData, setDisplayData] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [user, setUser] = useState(null);

  const fileInputRef = useRef(null);
  const typingIntervalRef = useRef(null);

  const [typing, setTyping] = useState(false);

  // GOOGLE SIGN-IN
  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      console.log("Login successful:", codeResponse);
      // Decode token to get user info
      const token = codeResponse.access_token;
      fetchUserInfo(token);
    },
    onError: (error) => {
      console.log("Login Failed:", error);
      setReply("Google Sign In failed. Please try again.");
    },
    flow: 'implicit',
  });

  const fetchUserInfo = async (accessToken) => {
    try {
      const response = await axios.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setUser(response.data);
      localStorage.setItem("novaMindUser", JSON.stringify(response.data));
      if (response.data.id) {
        fetchSavedHistory(response.data.id);
      }
      setChatStarted(false);
      setReply("");
      setInfoText("");
      setDisplayData([]);
    } catch (error) {
      console.log("Error fetching user info:", error);
      setReply("Failed to fetch user information");
    }
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem("novaMindUser");
    setMessage("");
    setReply("");
    setChatStarted(false);
    setActiveTab("chat");
  };

  const fetchSavedHistory = async (userId) => {
    try {
<<<<<<< HEAD
      const res = await axios.get("https://novamind-server.onrender.com/history", {
=======
      const res = await axios.get("http://localhost:5000/history", {
>>>>>>> a19a7d528e5330c4249ad795280404037c2dee34
        params: { userId },
      });

      if (res.data.history) {
        setChatHistory(
          res.data.history.map((entry) => ({
            id: entry._id || Date.now(),
            title: entry.title,
            date: new Date(entry.createdAt).toLocaleDateString(),
            type: entry.type || "text",
            content: entry.content || entry.title,
          }))
        );
      }
    } catch (error) {
      console.log("Failed to load saved history", error);
    }
  };

  const saveHistoryToServer = async (entry) => {
    if (!user?.id) return;

    try {
<<<<<<< HEAD
      await axios.post("https://novamind-server.onrender.com/history", {
=======
      await axios.post("http://localhost:5000/history", {
>>>>>>> a19a7d528e5330c4249ad795280404037c2dee34
        userId: user.id,
        title: entry.title,
        type: entry.type || "text",
        content: entry.content || entry.title,
      });
    } catch (error) {
      console.log("Failed to save history", error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("novaMindUser");
    const storedHistory = localStorage.getItem("novaMindHistory");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
<<<<<<< HEAD
      // eslint-disable-next-line react-hooks/set-state-in-effect
=======
>>>>>>> a19a7d528e5330c4249ad795280404037c2dee34
      setUser(parsedUser);
      if (parsedUser.id) {
        fetchSavedHistory(parsedUser.id);
      }
    }

    if (storedHistory) {
      setChatHistory(JSON.parse(storedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("novaMindHistory", JSON.stringify(chatHistory));
    if (user) {
      localStorage.setItem("novaMindUser", JSON.stringify(user));
    }
  }, [chatHistory, user]);

  const animateReply = (text) => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    const safeText = typeof text === "string" ? text : String(text || "");

    if (!safeText) {
      setReply("No response received.");
      setTyping(false);
      return;
    }

    setTyping(true);
    setReply(safeText);
    setTyping(false);
  };

  // PASTE IMAGE HANDLING
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              setUploadedFile(file);
              const imageURL = URL.createObjectURL(file);
              setImagePreview(imageURL);
              setChatStarted(true);
              setInfoText("Image pasted. Add a prompt and click Send to analyze.");
            }
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  // MOCK DATA


  const savedPrompts = [
    { id: 1, text: "Explain this concept in simple terms", category: "Education" },
    { id: 2, text: "Generate code examples for", category: "Programming" },
    { id: 3, text: "Write a professional email about", category: "Writing" },
    { id: 4, text: "Create a step-by-step guide for", category: "How-to" },
    { id: 5, text: "Analyze the pros and cons of", category: "Analysis" },
  ];

  const assistantInfo = [
    { title: "Code Analysis", description: "Get instant feedback on your code" },
    { title: "Image Recognition", description: "Upload images for AI analysis" },
    { title: "Writing Assistant", description: "Help with emails, articles, and content" },
    { title: "Research Help", description: "Find information and summaries on any topic" },
    { title: "Brainstorming", description: "Generate ideas for projects and content" },
  ];

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!message.trim() && !uploadedFile) return;

    setChatStarted(true);
    setInfoText(uploadedFile ? "Analyzing image..." : "Searching...");

    try {
      let replyText = "";

      if (uploadedFile) {
        const formData = new FormData();
        formData.append("image", uploadedFile);
        formData.append("message", message || "Analyze this image");

        const res = await axios.post(
<<<<<<< HEAD
          "https://novamind-server.onrender.com/analyze-image",
=======
          "http://localhost:5000/analyze-image",
>>>>>>> a19a7d528e5330c4249ad795280404037c2dee34
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        replyText =
          (res.data.reply || res.data.analysis || ``).toString().trim() ||
          `Image "${uploadedFile.name}" analyzed.`;
      } else {
<<<<<<< HEAD
        const res = await axios.post("https://novamind-server.onrender.com/chat", {
=======
        const res = await axios.post("http://localhost:5000/chat", {
>>>>>>> a19a7d528e5330c4249ad795280404037c2dee34
          message,
        });

        replyText = (res.data.reply || "No reply available.").toString();
      }

      animateReply(replyText);

      const entry = {
        id: Date.now(),
        title: message || `Image: ${uploadedFile?.name}`,
        date: new Date().toLocaleDateString(),
        type: uploadedFile ? "image" : "text",
        content: replyText,
      };

      const updatedHistory = [entry, ...chatHistory.slice(0, 9)];
      setChatHistory(updatedHistory);
      saveHistoryToServer(entry);

      setMessage("");
      setInfoText("");
      setUploadedFile(null);
      setImagePreview("");
    } catch (error) {
      console.log(error);
      setReply("Error connecting to backend");
      setInfoText("Unable to reach the server. Please try again later.");
      setTyping(false);
    }
  };

<<<<<<< HEAD
=======
  const handleSearch = async () => {
    if (!message.trim()) return;

    setChatStarted(true);
    setInfoText("Searching the web for the latest information...");

    try {
      const res = await axios.post("http://localhost:5000/search", {
        query: message,
      });

      const answer = res.data.answer || "No search results available.";
      animateReply(answer);

      const entry = {
        id: Date.now(),
        title: `Search: ${message}`,
        date: new Date().toLocaleDateString(),
        type: "search",
        content: answer,
      };

      const updatedHistory = [entry, ...chatHistory.slice(0, 9)];
      setChatHistory(updatedHistory);
      saveHistoryToServer(entry);

      setMessage("");
      setInfoText("");
    } catch (error) {
      console.log("Search error", error);
      setReply("Error connecting to backend search");
      setInfoText("Unable to reach the server. Please try again later.");
      setTyping(false);
    }
  };

>>>>>>> a19a7d528e5330c4249ad795280404037c2dee34
  // FILE SELECT
  const handleFileSelect = (e) => {

    const file = e.target.files[0];

    if (file) {

      setUploadedFile(file);

      const imageURL = URL.createObjectURL(file);

      setImagePreview(imageURL);

    }

  };

  // VOICE SEARCH
  const startVoiceSearch = () => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onresult = (event) => {

      const transcript =
        event.results[0][0].transcript;

      setMessage(transcript);

    };

    recognition.start();

  };

  const handlePanelClick = (panel) => {
    setActiveTab(panel);
    setChatStarted(true);
    setReply("");
    setUploadedFile(null);
    setImagePreview("");

    if (panel === "history") {
      setDisplayData(chatHistory);
      setInfoText("Your recent searches. Click any to load it.");
    } else if (panel === "assistant") {
      setDisplayData(assistantInfo);
      setInfoText("NovaMind can help you with these tasks:");
    } else if (panel === "prompts") {
      setDisplayData(savedPrompts);
      setInfoText("Your saved prompts. Click to use them.");
    } else {
      setInfoText("");
    }
  };

  const newChat = () => {
    setMessage("");
    setReply("");
    setUploadedFile(null);
    setImagePreview("");
    setChatStarted(false);
    setActiveTab("chat");
    setInfoText("Type a prompt or upload an image, then press the arrow to search.");
  };

  const instagramUsername = "sonalkar_dnyaneshwar_45"; // Replace with your real Instagram username
  const instagramUrl = `https://www.instagram.com/${instagramUsername}`;

  const handleUpgrade = () => {
    if (!user) {
      setReply("Please sign in first to upgrade.");
      setChatStarted(true);
      return;
    }
    setChatStarted(true);
    setActiveTab("chat");
    setInfoText("Upgrade feature coming soon! Premium features will be available shortly.");
    setReply("");
  };

  return (

    <div className="flex h-screen bg-black text-white overflow-hidden">

      {/* SIDEBAR */}
      <div className="w-72 bg-[#111111] border-r border-gray-800 p-4 hidden lg:flex lg:flex-col overflow-hidden">

        <button
          onClick={newChat}
          className="w-full bg-[#1f2a44] hover:bg-[#263352] p-4 rounded-2xl text-left font-semibold mb-6"
        >
          + New Chat
        </button>

        <div className="space-y-3 flex-1 overflow-y-auto">

          <div
            onClick={() => handlePanelClick("history")}
            className={`p-3 rounded-xl cursor-pointer ${activeTab === "history" ? "bg-gray-700" : "hover:bg-gray-800"}`}
          >
            Chat History
          </div>

          <div
            onClick={() => handlePanelClick("assistant")}
            className={`p-3 rounded-xl cursor-pointer ${activeTab === "assistant" ? "bg-gray-700" : "hover:bg-gray-800"}`}
          >
            AI Assistant
          </div>

          <div
            onClick={() => handlePanelClick("prompts")}
            className={`p-3 rounded-xl cursor-pointer ${activeTab === "prompts" ? "bg-gray-700" : "hover:bg-gray-800"}`}
          >
            Saved Prompts
          </div>

        </div>

      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <div className="flex justify-between items-center p-5 border-b border-gray-800">

          <div>

            <h1 className="text-3xl font-bold">
              NovaMind
            </h1>

          </div>

          <div className="flex gap-3 items-center">

            {user ? (
              <div className="flex items-center gap-3">
<<<<<<< HEAD
                {user.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.name || "User"}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-semibold text-white">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold">{user.name || "Guest"}</p>
=======
                <img 
                  src={user.picture} 
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold">{user.name}</p>
>>>>>>> a19a7d528e5330c4249ad795280404037c2dee34
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-full border border-gray-600 hover:border-white flex items-center gap-2"
                >
                  <FiLogOut size={18} />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => login()}
                  className="px-5 py-2 rounded-full border border-gray-600 hover:border-white"
                >
                  Sign In
                </button>

                <button
                  onClick={handleUpgrade}
                  className="px-5 py-2 rounded-full bg-white text-black font-semibold hover:bg-gray-200"
                >
                  Upgrade
                </button>
              </>
            )}

          </div>

        </div>

        {/* CHAT AREA */}
        <div className={`flex-1 flex flex-col items-center px-4 transition-all duration-500 overflow-y-auto ${chatStarted ? "justify-start pt-10" : "justify-center"}`}>

          <div className="w-full max-w-3xl">

            {!chatStarted && !user && (
              <div className="flex justify-center mb-12 pt-20">
                <div className="text-center max-w-2xl px-6">
                  <h2 className="text-4xl font-bold mb-4">Welcome to NovaMind</h2>
                  <p className="text-lg text-gray-300 mb-3">Your AI workspace for chat, image analysis, and smarter prompts.</p>
                  <p className="text-gray-500">Sign in to personalize your experience, or type anything below to get started right away.</p>
                </div>
              </div>
            )}

            {!chatStarted && user && (

              <div className="flex justify-center mb-12 pt-20">

                <div className="text-center">
<<<<<<< HEAD
                  <h2 className="text-5xl font-bold mb-6">Hi {user.given_name || user.name?.split(" ")[0] || "there"}</h2>
=======
                  <h2 className="text-5xl font-bold mb-6">Hi {user.given_name}</h2>
>>>>>>> a19a7d528e5330c4249ad795280404037c2dee34
                  <p className="text-xl text-gray-400">Welcome to NovaMind</p>
                  <p className="text-gray-500 mt-4">Ask anything or paste an image below</p>
                </div>

              </div>

            )}

            {/* INPUT */}
            <div className="bg-[#1b1b1b] border border-gray-700 rounded-[35px] p-5 shadow-2xl mb-6">

              <div className="flex items-center gap-3">

                {/* UPLOAD */}
                <button
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="h-12 w-12 rounded-full border border-gray-700 flex items-center justify-center hover:border-white"
                >
                  <FiPlus size={20} />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />

                {/* INPUT */}
                <input
                  type="text"
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  placeholder="Ask anything or paste an image..."
                  className="flex-1 bg-transparent outline-none text-lg text-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                />

                {/* VOICE */}
                <button
                  onClick={startVoiceSearch}
                  className={`h-12 px-4 rounded-full border border-gray-700 flex items-center gap-2 hover:border-white ${listening ? "text-green-400" : ""}`}
                >
                  <FiMic />
                </button>

                {/* REAL-TIME INFO */}
                <button
                  onClick={() => setMessage(`Current time: ${new Date().toLocaleString()}`)}
                  className="h-12 px-4 rounded-full border border-gray-700 flex items-center gap-2 hover:border-white"
                >
                  🕒
                </button>

                {/* SEND */}
                <button
                  onClick={sendMessage}
                  className="h-12 w-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200"
                >
                  <FiChevronRight size={24} />
                </button>

              </div>

            </div>

            {(infoText || (uploadedFile && !reply)) && (
              <div className="bg-[#111111] border border-gray-700 rounded-3xl p-6 mb-6 min-h-[110px] text-[17px] leading-7 shadow-lg">
                <p className="text-gray-300">
                  {infoText}
                </p>
                {uploadedFile && !reply && (
                  <p className="mt-3 text-white">
                    Selected image: {uploadedFile.name}
                  </p>
                )}
              </div>
            )}

            {typing && (
              <div className="text-gray-400 mb-4">AI is typing...</div>
            )}

            {displayData.length > 0 && (
              <div className="w-full mb-6 space-y-3">
                {activeTab === "history" && displayData.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setMessage(item.title);
                      setDisplayData([]);
                      setInfoText("Loaded from history. Edit and Send to search again.");
                    }}
                    className="bg-[#1c1c1c] border border-gray-700 rounded-2xl p-4 hover:border-white cursor-pointer transition-all"
                  >
                    <p className="text-white font-semibold">{item.title}</p>
                    <p className="text-gray-400 text-sm mt-1">{item.date}</p>
                  </div>
                ))}

                {activeTab === "assistant" && displayData.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#1c1c1c] border border-gray-700 rounded-2xl p-4 hover:border-white cursor-pointer transition-all"
                  >
                    <p className="text-white font-semibold">{item.title}</p>
                    <p className="text-gray-300 text-sm mt-2">{item.description}</p>
                  </div>
                ))}

                {activeTab === "prompts" && displayData.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setMessage(item.text);
                      setDisplayData([]);
                      setInfoText("Edit the prompt and click Send to execute it.");
                    }}
                    className="bg-[#1c1c1c] border border-gray-700 rounded-2xl p-4 hover:border-white cursor-pointer transition-all"
                  >
                    <p className="text-white">{item.text}</p>
                    <p className="text-gray-400 text-xs mt-2">{item.category}</p>
                  </div>
                ))}
              </div>
            )}

            {imagePreview && (
              <div className="mb-5 flex justify-center">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-56 rounded-2xl border border-gray-700"
                />
              </div>
            )}

            {reply && (
              <div className="bg-[#1c1c1c] border border-gray-700 rounded-3xl p-6 mb-6 whitespace-pre-wrap text-[17px] leading-8 shadow-lg">
                {reply}
              </div>
            )}

          </div>

          <div className="border-t border-gray-800 p-4 flex justify-center">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#1b1b1b] border border-gray-700 text-white hover:border-white transition shadow-sm"
            >
              <FaInstagram className="text-pink-500" />
              Follow on Instagram @{instagramUsername}
            </a>
          </div>

        </div>

      </div>

    </div>

  );

}

export default function App() {
  return (
<<<<<<< HEAD
    <GoogleOAuthProvider clientId="165317681676-sqln5rta4g0qlsle5tkt10jkmqhjttkj.apps.googleusercontent.com">
=======
    <GoogleOAuthProvider clientId="281883916056-t14msa0h2kej5clsfiopq4oq0fq50b3a.apps.googleusercontent.com">
>>>>>>> a19a7d528e5330c4249ad795280404037c2dee34
      <AppContent />
    </GoogleOAuthProvider>
  );
}