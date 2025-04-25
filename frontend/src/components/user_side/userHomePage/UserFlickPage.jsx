import React, { useEffect, useRef, useState } from "react";
import FlickQuestionSender from "../flickmessage/FlickQuestionSender";
import { useSelector } from "react-redux";
import axiosInstance from "../../../utils/axiosConfig";
import { MessageCircle } from "lucide-react"; // Use Lucide's MessageCircle
import { useNavigate } from "react-router-dom";

const UserFlickPage = () => {
  const { id: userId } = useSelector((state) => state.authentication_user);
  const [answers, setAnswers] = useState([]);
  const answersRef = useRef(answers);
  const navigate = useNavigate();

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const timeDiff = Math.floor((now - new Date(timestamp)) / 1000);

    if (timeDiff < 60) return "moments ago";
    if (timeDiff < 3600) return `${Math.floor(timeDiff / 60)} minutes ago`;
    if (timeDiff < 86400) return `${Math.floor(timeDiff / 3600)} hours ago`;
    if (timeDiff < 2592000) return `${Math.floor(timeDiff / 86400)} days ago`;

    return `${Math.floor(timeDiff / 2592000)} months ago`;
  };

  const handleAction = async (action, targetUserId) => {
    try {
      const response = await axiosInstance.post("users/match/", {
        action: action,
        target_user_id: targetUserId,
      });

      if (response.data.matched) {
        setAnswers((prevAnswers) =>
          prevAnswers.map((answer) =>
            answer.responder.id === targetUserId
              ? { ...answer, responder: { ...answer.responder, is_matched: true, chatroom: response.data.chatroom } }
              : answer
          )
        );
      }
    } catch (error) {
      console.error("Error performing action:", error);
    }
  };

  const goToChatBox = (chatRoomName) => {
    navigate(`/dm-chat/${chatRoomName}`);
  };

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    const token = localStorage.getItem("access");
    const socket = new WebSocket(`ws://localhost:8000/ws/answers/${userId}/?token=${token}`);

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "previous_answers") {
        setAnswers(data.answers);

      }

      if (data.type === "flick_answer") {
        const newAnswers = data.answers;

        setAnswers((prevAnswers) => {
          const existingIds = new Set(prevAnswers.map((ans) => ans.id));
          const uniqueNewAnswers = newAnswers.filter((newAns) => !existingIds.has(newAns.id));
          return [...uniqueNewAnswers, ...prevAnswers];
        });
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, [userId]);

  return (
    <div>
      <div>
        <FlickQuestionSender />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Answers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {answers.map((answer, index) => (
            <div key={index} className="border p-4 rounded-xl shadow-sm relative">
              <div className="flex items-center mb-3 relative">
                <img
                  src={`http://localhost:8000${answer.responder.profile_image}`}
                  className="w-12 h-12 rounded-full object-cover mr-3"
                  alt="Profile"
                  onError={(e) => {
                    e.target.src = "/default-profile.png";
                  }}
                />
                <p className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  {answer.responder.username}
                </p>

                {!answer.responder.is_matched ? (
                  <button
                    onClick={() => handleAction("flick_message", answer.responder.id)}
                    className="absolute bottom-3 right-3 p-4 h-4 w-20 flex justify-center items-center rounded-md bg-amber-300 text-white text-center border border-slate-300"
                  >
                    Match
                  </button>
                ) : (
                    <div className="absolute bottom-3 right-3 flex items-center gap-2 cursor-pointer" onClick={() => goToChatBox(answer.responder.chatroom)}>
                    <span className="text-green-500 font-semibold">Matched</span>
                    <MessageCircle
                      className="text-blue-500 hover:text-blue-700"
                      size={20}
                      strokeWidth={2.2}
                      title="Chat"
                    />
                  </div>
                )}
              </div>

              <div className="bg-blue-50 p-2 rounded mb-2">
                <p className="font-semibold text-gray-700">Q: {answer.question_text}</p>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <p className="text-gray-700">A: {answer.answer_text}</p>
              </div>

              <span className="absolute bottom-2 right-2 text-xs text-gray-400">{formatTimeAgo(answer.created_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserFlickPage;
