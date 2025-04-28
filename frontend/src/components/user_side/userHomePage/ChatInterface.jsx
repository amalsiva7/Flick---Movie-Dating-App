import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosConfig';
import ChatHeader from './Chatheader';

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

  const [chatPartner, setChatPartner] = useState(null);

  const token = localStorage.getItem('access');

  const fetchMessages = useCallback(
    async (pageNumber = 1) => {
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

        const fetchedMessages = response.data.results.map((msg) => ({
          ...msg,
          sender: typeof msg.sender === 'object' ? msg.sender.id : msg.sender,
        }));

        // Reverse to show oldest first at top
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
    },
    [room_name, token]
  );

  useEffect(() => {
    const fetchChatPartner = async () => {
      if (!room_name || !userId) return;
      
      try {
        // Extract partner ID from room name (assuming format: "chat_user1_user2")
        const users = room_name.replace('chat_', '').split('_');
        const partnerId = users.find(id => id !== String(userId));
        
        const response = await axiosInstance.get(
          `/dm_chat/chat-userdetail/${partnerId}/`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        console.log(response.data,'**************chatting user in chat interface*******************')
        
        setChatPartner(response.data);

      } catch (error) {
        console.error('Error fetching chat partner:', error);
        setChatPartner({ 
          username: 'Unknown User',
          profile_image: '/default-profile.png'
        });
      }
    };
  
    fetchChatPartner();
  }, [room_name, userId, token]);

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

      const normalizedData = {
        id: data.id || Math.random().toString(36).substr(2, 9),
        sender: typeof data.sender === 'object' ? data.sender.id : data.sender,
        message: data.message,
        timestamp: data.timestamp,
      };

      setMessages((prevMessages) => [...prevMessages, normalizedData]);

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
    <div className="h-full bg-white relative shadow-md rounded-lg">
      <div className="p-2.5 rounded-lg">
      <div className="container mx-auto px-4">
      <div className="container mx-auto p-4 flex flex-col h-full max-h-screen">
      <ChatHeader user={chatPartner}/>
      <div
        ref={chatBoxRef}
        onScroll={handleScroll}
        className="flex-grow h-96 overflow-y-auto border rounded p-4 mb-2 space-y-2 bg-white"
        style={{ backgroundColor: '#f6fff8' }} // WhatsApp-like background
      >
        {loadingMessages && page === 1 && (
          <div className="text-center text-gray-500 mb-2">Loading messages...</div>
        )}
        {messages.map((msg, index) => {
          const isMe = String(msg.sender) === String(userId);
          return (
            <div
              key={msg.id || index}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-3 rounded-lg max-w-xs md:max-w-md lg:max-w-lg shadow
                  ${isMe
                    ? 'bg-yellow-300 text-black rounded-br-none'
                    : 'bg-white text-gray-900 rounded-bl-none'
                  }`}
                style={{
                  borderBottomRightRadius: isMe ? 0 : undefined,
                  borderBottomLeftRadius: !isMe ? 0 : undefined,
                  wordBreak: 'break-word',
                }}
              >
                <div>{msg.message}</div>
                <div className={`text-xs mt-1 ${isMe ? 'text-black-100' : 'text-gray-500'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}
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
        <button type="submit" className="bg-slate-500 hover:bg-slate-800 text-white rounded p-2 transition-colors duration-200">
          Send
        </button>
      </form>
    </div>
      </div>
      </div>
      
    </div>
            
    
  );
};

export default ChatInterface;
