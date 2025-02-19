import React, { useState, useEffect, useRef } from "react";
import { SendHorizontal } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from 'react-hot-toast';
import axiosInstance from "../../../../utils/axiosConfig";


const FlickAnswerSender = ({ targetUserId, question }) => {
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useSelector((state) => state.authentication_user);
  const ws = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (userId) {
      const wsUrl = `ws://localhost:8000/ws/notifications/${userId}/`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket connection established for flick answers");
      };

      ws.current.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === "notification" || data.type === "flick_response") {
          fetchPrevAnswers();
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



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!answer.trim() || !targetUserId || !question) return;
    
    setIsLoading(true);
    
    try {
      //Send the flick answer
      await axiosInstance.post("users/flick-answers/", {target_user_id:targetUserId,question_id: question.id,answer_text:answer});
      
      // Clear input field
      setAnswer("");
      toast.success("Your flick has been sent!");
      
    } catch (error) {
      console.error("Error sending answer:", error);
      toast.error("Failed to send your answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-lg bg-white shadow-md mt-4 mb-2">
      {question && (
        <div className="p-3 bg-slate-100 rounded-t-lg">
          <p className="text-sm font-medium text-slate-700">{question.question_text}</p>
          <p className="text-xs text-slate-500">{formatTimeAgo(question.created_at)}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-3">
        <div className="flex items-center relative">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Send your answer..."
            className="w-full py-2 px-4 pr-12 text-gray-700 bg-[#f8f4e9] rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
            disabled={isLoading || !question}
          />
          <button
            type="submit"
            className="absolute right-3 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors disabled:opacity-50"
            disabled={isLoading || !answer.trim() || !question}
            aria-label="Send answer"
          >
            <SendHorizontal className="w-4 h-4 text-black" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlickAnswerSender;