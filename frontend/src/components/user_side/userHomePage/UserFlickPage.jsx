import { useEffect, useRef, useState } from "react";
import FlickQuestionSender from "../flickmessage/FlickQuestionSender";
import { useSelector } from "react-redux";

const UserFlickPage = () => {
    const { id: userId } = useSelector((state) => state.authentication_user);
    const [answers, setAnswers] = useState([]);
    const answersRef = useRef(answers);

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const timeDiff = Math.floor((now - new Date(timestamp)) / 1000);

        if (timeDiff < 60) return "moments ago";
        if (timeDiff < 3600) return `${Math.floor(timeDiff / 60)} minutes ago`;
        if (timeDiff < 86400) return `${Math.floor(timeDiff / 3600)} hours ago`;
        if (timeDiff < 2592000) return `${Math.floor(timeDiff / 86400)} days ago`;

        return `${Math.floor(timeDiff / 2592000)} months ago`;
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

            if (data.type === 'previous_answers') {
                setAnswers(data.answers); // initial fetch through socket
            }

            // Changed from 'new_answer' to 'flick_answer'
            if (data.type === 'flick_answer') {
                const newAnswers = data.answers;

                setAnswers(prevAnswers => {
                    // Filter out duplicates and add new answers to the top
                    const existingIds = new Set(prevAnswers.map(ans => ans.id));
                    const uniqueNewAnswers = newAnswers.filter(
                        newAns => !existingIds.has(newAns.id)
                    );
                    
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
                            <div className="flex items-center mb-3">
                                <img
                                    src={`http://localhost:8000${answer.responder.profile_image}`}
                                    className="w-12 h-12 rounded-full object-cover mr-3"
                                    alt="Profile"
                                    onError={(e) => {
                                        e.target.src = '/default-profile.png'; // Add fallback image
                                    }}
                                />
                                <p className="text-lg font-semibold text-gray-800">{answer.responder.username}</p>
                            </div>

                            <div className="bg-blue-50 p-2 rounded mb-2">
                                <p className="font-semibold text-gray-700">Q: {answer.question_text}</p>
                            </div>
                            <div className="bg-green-50 p-2 rounded">
                                <p className="text-gray-700">A: {answer.answer_text}</p>
                            </div>

                            <span className="absolute bottom-2 right-2 text-xs text-gray-400">
                                {formatTimeAgo(answer.created_at)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserFlickPage;
