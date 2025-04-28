import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../../../utils/axiosConfig';

const ChatInterface = () => {
  const { id: userId } = useSelector((state) => state.authentication_user);
  const { room_name } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const chatBoxRef = useRef(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const token = localStorage.getItem('access');

  const fetchMessages = useCallback(async (pageNumber = 1) => {
    if (!room_name || !token) return;

    setLoadingMessages(true);

    try {
      const response = await axiosInstance.get(
        `/dm_chat/chat/${room_name}/messages/`,
        {
          params: { page: pageNumber, page_size: 20 },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const fetchedMessages = response.data.results;
      const orderedMessages = fetchedMessages.slice().reverse();

      if (pageNumber === 1) {
        setMessages(orderedMessages);
      } else {
        setMessages((prev) => [...orderedMessages, ...prev]);
      }

      setHasMore(response.data.next !== null);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [room_name, token]);

  useEffect(() => {
    if (room_name && token) {
      setPage(1);
      fetchMessages(1);
    }
  }, [room_name, token, fetchMessages]);

  useEffect(() => {
    if (!userId || !room_name || !token) return;

    const wsUrl = `ws://localhost:8000/ws/chat/${room_name}/${userId}/?token=${token}`;
    const newSocket = new WebSocket(wsUrl);

    setSocket(newSocket);

    newSocket.onopen = () => {
      console.log('WebSocket connected');
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, data]);
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
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
  }, [room_name, userId, token]);

  useEffect(() => {
    if (chatBoxRef.current && page === 1) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, page]);

  const handleScroll = () => {
    if (!chatBoxRef.current || loadingMessages || !hasMore) return;

    if (chatBoxRef.current.scrollTop === 0) {
      const currentScrollHeight = chatBoxRef.current.scrollHeight;
      const nextPage = page + 1;
      
      fetchMessages(nextPage).then(() => {
        setPage(nextPage);
        setTimeout(() => {
          if (chatBoxRef.current) {
            const newScrollHeight = chatBoxRef.current.scrollHeight;
            chatBoxRef.current.scrollTop = newScrollHeight - currentScrollHeight;
          }
        }, 100);
      });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (newMessage.trim() && socket) {
      socket.send(JSON.stringify({ message: newMessage.trim() }));
      setNewMessage('');
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col h-full max-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Chat Room: {room_name}</h2>
      <div
        ref={chatBoxRef}
        onScroll={handleScroll}
        className="flex-grow h-96 overflow-y-auto border rounded p-2 mb-2 space-y-2"
      >
        {loadingMessages && page === 1 && (
          <div className="text-center text-gray-500 mb-2">Loading messages...</div>
        )}
        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`flex ${msg.sender === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`p-3 rounded-lg max-w-xs md:max-w-md lg:max-w-lg ${
                msg.sender === userId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <div className="break-words">{msg.message}</div>
              <div className={`text-xs mt-1 ${
                msg.sender === userId ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}
        {loadingMessages && page > 1 && (
          <div className="text-center text-gray-500 mt-2">Loading more messages...</div>
        )}
        {!hasMore && (
          <div className="text-center text-gray-400 mt-2 text-sm">No more messages</div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          className="flex-grow border rounded p-2 mr-2"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          autoComplete="off"
        />
        <button type="submit" className="bg-blue-500 text-white rounded p-2">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
