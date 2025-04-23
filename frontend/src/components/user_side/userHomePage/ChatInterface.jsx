import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

const ChatInterface = () => {
  const { receiver_id } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const chatBoxRef = useRef(null);

  const userId = localStorage.getItem('user_id'); // Replace with your actual user ID retrieval

  useEffect(() => {
    if (!userId || !receiver_id) return;

    const wsUrl = `ws://localhost:8000/ws/chat/${receiver_id}/`; // Adjust URL
    const newSocket = new WebSocket(wsUrl);

    setSocket(newSocket);

    newSocket.onopen = () => {
      console.log('WebSocket connected');
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, data]);
    };

    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      newSocket.close();
    };
  }, [receiver_id, userId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);


  const handleSubmit = (event) => {
    event.preventDefault();
    if (newMessage && socket) {
      socket.send(JSON.stringify({ message: newMessage }));
      setNewMessage('');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Chat with {receiver_id}</h2>
      <div
        ref={chatBoxRef}
        className="h-96 overflow-y-auto border rounded p-2 mb-2"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded ${
              msg.sender === userId ? 'bg-blue-100 ml-auto w-fit max-w-2/3' : 'bg-gray-100 mr-auto w-fit max-w-2/3'
            }`}
          >
            <div className="text-sm text-gray-600">{msg.sender}</div>
            <div>{msg.message}</div>
            <div className="text-xs text-gray-500">{msg.timestamp}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          className="flex-grow border rounded p-2 mr-2"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white rounded p-2">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
