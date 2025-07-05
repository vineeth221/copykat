import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaRobot, FaUserCircle, FaPaperPlane } from "react-icons/fa";
import { motion } from "framer-motion";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputSend = () => {
    if (input.trim() !== "") {
      sendMessage(input);
      setInput("");
    }
  };

  const sendMessage = async (msg) => {
    if (!msg.trim()) return;

    const userMsg = { sender: "user", text: msg };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/chatbot`, {
        question: msg,
      });

      const botMsg = { sender: "bot", text: response.data.answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error getting response from server." },
      ]);
    }
  };

  return (
    <div className="w-80 mx-auto mt-6 shadow-xl rounded-2xl overflow-hidden backdrop-blur-xl bg-white/30 border border-orange-300">
      <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white p-3 text-center text-xl font-semibold shadow-inner flex items-center justify-center gap-2">
        <FaRobot className="text-2xl" />
        Zapbot
      </div>
      <div className="h-72 overflow-y-auto bg-white/40 backdrop-blur-md p-3 space-y-3 text-sm">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "bot" && (
              <FaRobot className="text-orange-500 text-xl mr-2 mt-1" />
            )}
            <div
              className={`px-3 py-2 rounded-xl shadow-sm max-w-[75%] text-xs ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white"
                  : "bg-white text-gray-700 border border-orange-200"
              }`}
            >
              {msg.text}
            </div>
            {msg.sender === "user" && (
              <FaUserCircle className="text-orange-500 text-xl ml-2 mt-1" />
            )}
          </motion.div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="flex border-t border-orange-300 p-2 bg-white/50 backdrop-blur-md">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleInputSend()}
          placeholder="Type your message..."
          className="flex-grow p-2 rounded-l-lg border border-orange-300 outline-none text-xs"
        />
        <button
          onClick={handleInputSend}
          className="bg-orange-400 hover:bg-orange-500 text-white px-3 rounded-r-lg"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
