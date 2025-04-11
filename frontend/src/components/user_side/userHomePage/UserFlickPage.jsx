import { useEffect, useRef, useState } from "react";
import FlickQuestionSender from "../flickmessage/FlickQuestionSender";
import { useSelector } from "react-redux";
import axiosInstance from "../../../utils/axiosConfig";

const UserFlickPage= () =>{
    const { id: userId } = useSelector((state) => state.authentication_user);
    const [answers, setAnswers] = useState([]);
    const [socket, setSocket] = useState(null);
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
        const fetchAnswers = async () => {
            try {
                const response = await axiosInstance.get(`users/answers/${userId}/`);
                setAnswers(response.data);
            } catch (error) {
                console.error("Error fetching answers:", error);
            }
        };

        fetchAnswers();

        // Establish WebSocket connection
        const newSocket = new WebSocket(`ws://localhost:8000/ws/answers/${userId}/`);

        newSocket.onopen = () => {
            console.log("WebSocket connected");
            setSocket(newSocket);
        };

        newSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'new_answer') {
                const newAnswer = data.answer;
        
                // Avoid duplicates if same answer already present
                setAnswers(prevAnswers => {
                    const alreadyExists = prevAnswers.some(ans => ans.id === newAnswer.id);
                    if (alreadyExists) return prevAnswers;
                    return [...prevAnswers, newAnswer];
                });
            }
        };
        

        newSocket.onclose = () => {
            console.log("WebSocket disconnected");
        };

        return () => {
            newSocket.close();
        };
    }, [userId]);

    return(
        <div>
            <div>
                <FlickQuestionSender/>
            </div>
            <div>
            <div>
                <h3 className="text-lg font-semibold mb-4">Answers</h3>
               

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {answers.map((answer, index) => (
                    <div key={index} className="border p-4 rounded-xl shadow-sm relative">
                    <div className="flex items-center mb-3">
                        <img
                        src={answer.responder.profile_image}
                        className="w-12 h-12 rounded-full object-cover mr-3"
                        alt="Profile"
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
        </div>
        
    )
}


export default UserFlickPage;