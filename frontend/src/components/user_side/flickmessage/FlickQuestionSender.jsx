import React, { useState, useEffect, useRef } from "react";
import { SendHorizontal } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from 'react-hot-toast';
import axiosInstance from "../../../utils/axiosConfig";

const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const timeDiff = Math.floor((now - new Date(timestamp)) / 1000);

  if (timeDiff < 60) return "moments ago";
  if (timeDiff < 3600) return `${Math.floor(timeDiff / 60)} minutes ago`;
  if (timeDiff < 86400) return `${Math.floor(timeDiff / 3600)} hours ago`;
  if (timeDiff < 2592000) return `${Math.floor(timeDiff / 86400)} days ago`;
  
  return `${Math.floor(timeDiff / 2592000)} months ago`;
};

const FlickQuestionSender = () => {
  const [question, setQuestion] = useState("");
  const [prevQuestions, setPrevQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPrevQuestions, setShowPrevQuestions] = useState(false);
  const { userId } = useSelector((state) => state.authentication_user);
  const ws = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (userId) {
      const wsUrl = `ws://localhost:8000/ws/notifications/${userId}/`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket connection established");
      };

      ws.current.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === "notification") {

          fetchPrevQuestions(); 
        }
        if (data.type === "previous_notifications") {
          fetchPrevQuestions();
        }
      };

      ws.current.onerror = (e) => {
        console.error("WebSocket error:", e);
        toast.error("Connection error. Some updates might be delayed.");
      };

      ws.current.onclose = () => {
        console.log("WebSocket connection closed");
      };
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [userId]);

  // Fetch previous questions
  useEffect(() => {
    fetchPrevQuestions();
  }, []);

  const fetchPrevQuestions = async () => {
    try {
      const response = await axiosInstance.get("users/flick-questions/");
      setPrevQuestions(response.data);
    } catch (error) {
      console.error("Error fetching previous questions:", error);
      toast.error("Couldn't fetch your previous questions.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Create the new question
      await axiosInstance.post("users/flick-questions/", { question_text: question, is_active: true });
      
      // Clear input field
      setQuestion("");
      toast.success("Your question has been posted!");
      
      
    } catch (error) {
      console.error("Error sending question:", error);
      toast.error("Failed to post your question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputFocus = () => {
    setShowPrevQuestions(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowPrevQuestions(false), 200); 
  };

  const handlePreviousQuestionClick = (q) => {
    setQuestion(q.question_text);
    setShowPrevQuestions(false); 
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg bg-white shadow-md">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-center relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Post your question here"
            className="w-full py-3 px-4 pr-12 text-gray-700 bg-[#f8f4e9] rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
            disabled={isLoading}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          <button
            type="submit"
            className="absolute right-3 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors disabled:opacity-50"
            disabled={isLoading || !question.trim()}
            aria-label="Send question"
          >
            <SendHorizontal className="w-5 h-5 text-black" />
          </button>
        </div>
        
        {/* Display previous questions if needed */}
        {showPrevQuestions && prevQuestions.length > 0 && (
          <div className="px-4 pb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Previous Questions</h3>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {prevQuestions.map((q) => (
                <li
                  key={q.id}
                  className={`text-sm p-2 rounded cursor-pointer ${
                    q.is_active ? "bg-blue-50 text-blue-800" : "bg-gray-50 text-gray-600"
                  }`}
                  onClick={() => handlePreviousQuestionClick(q)}
                >
                  {q.question_text} 
                  <span className="ml-2 text-xs text-gray-400">{formatTimeAgo(q.created_at)}</span>
                  {q.is_active && <span className="ml-2 text-xs text-blue-600">(Active)</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
};

export default FlickQuestionSender;
