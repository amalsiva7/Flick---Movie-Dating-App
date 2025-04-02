import React, { useState, useEffect } from 'react';
import { CircleChevronLeft, CircleChevronRight, Heart, HeartOff, Send, X } from 'lucide-react';
import axiosInstance from '../../../utils/axiosConfig';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux'; // Import useSelector

const QuestionDisplay = ({ activeQuestion, handleAction, currentProfile }) => {
  const [answerText, setAnswerText] = useState('');

  const handleSendAnswer = () => {
    if (answerText.trim()) {
      // Call handleAction with the answer text
      handleAction('flick_message', currentProfile.id, answerText);
      // Clear the input field after sending
      setAnswerText('');
    }
  };

  return (
    <div className="rounded-lg overflow-hidden">
      {/* Question Header */}
      <div className="bg-slate-800 text-white p-3">
        <h3 className="font-medium">{activeQuestion ? activeQuestion.question_text : "So, what's on your mind?!!"}</h3>
      </div>

      {/* White content area with input and arrow button */}
      <div className="bg-white p-3 flex justify-end">
        <input  
          type="text"
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder="Type your answer..."
          className="flex-1 outline-none text-gray-700 mr-2"
        />
        <button
          onClick={handleSendAnswer}
          className="rounded-full bg-slate-800 p-1.5 flex items-center justify-center"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6L15 12L9 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

const DatingCard = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 1,
    hasNext: false,
    totalProfiles: 0
  });

  const filters = useSelector((state) => state.filter);

  const fetchProfiles = async (page = 1) => {
    console.log("fetchProfile got called")
    try {
      setLoading(true);

      // Construct the query string based on the filters
      let queryString = `users/potential-matches/?page=${page}`;
      if (filters.ageMin) {
        queryString += `&age_min=${filters.ageMin}`;
        console.log("minimun age: ", filters.ageMin)
      }
      if (filters.ageMax) {
        queryString += `&age_max=${filters.ageMax}`;
      }
      if (filters.matchMin) {
        queryString += `&match_min=${filters.matchMin}`;
      }
      if (filters.matchMax) {
        queryString += `&match_max=${filters.matchMax}`;
      }
      if (filters.location) {
        queryString += `&location=${filters.location}`;
      }

      console.log("this is the queryString send while clicking filter: ",queryString)

      const response = await axiosInstance.get(queryString);
      const data = response.data;

      // Update pagination information
      setPaginationInfo({
        totalPages: data.total_pages,
        hasNext: data.has_next,
        totalProfiles: data.count
      });

      if (page === 1) {
        setProfiles(data.results);
        setCurrentIndex(0);
      } else {
        setProfiles(prevProfiles => [...prevProfiles, ...data.results]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchActiveQuestion = async () => {
      console.log("ActiveQuestion was called in dating card!!");
  
      const currentProfile = profiles[currentIndex];
      console.log(currentProfile, "current profile was called in dating card activeQuestions");
      if (!currentProfile) return;
  
      try {
        const response = await axiosInstance.get(`users/questions/active/${currentProfile.id}/`);
        setActiveQuestion(response.data);
      } catch (error) {
        console.error("Error fetching active question:", error);
        setActiveQuestion(null); // Clear if no active question found
      }
    };
  
    fetchActiveQuestion();
  }, [currentIndex, profiles]);
  

  useEffect(() => {
    console.log("fetch profile called  due to change in filters")
    fetchProfiles(); // Fetch profiles whenever the component mounts or filters change
  }, [filters]);

  // Reset image index when changing profiles
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [currentIndex]);

  const handleAction = async (action, userId, answerText = '') => {

    try {
      const response = await axiosInstance.post('users/card-action/', {
        target_user_id: userId,
        action: action,
        answer_text: answerText
      });

      console.log('clicked flick message in date card')
      
      if (response.data.matched) {
        const currentProfile = profiles[currentIndex]

        toast.success(
        <div className="flex flex-col items-center">
          <img 
            src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${currentProfile.images[0]}`} 
            alt={currentProfile.username}
            className="w-24 h-24 object-cover rounded-full mb-2"
          />
          <div className="text-xl font-bold">It's a match with {currentProfile.username}!</div>
        </div>,
        {
          duration: 4000,
          style: {
            minWidth: '300px',
            padding: '20px',
            background: '#f0f0f0',
            color: '#333',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }
        }
      );
      }

      // Move to next profile
      const nextIndex = currentIndex + 1;
      
      // If we're at the end of current profiles and there's a next page
      if (nextIndex >= profiles.length && paginationInfo.hasNext) {
        const nextPage = currentPage + 1;
        if (nextPage <= paginationInfo.totalPages) {
          setCurrentPage(nextPage);
          fetchProfiles(nextPage);
        }
      }
      
      setCurrentIndex(nextIndex);
      
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const handleImageNavigation = (direction) => {
    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;
    
    const totalImages = currentProfile.images.length;
    if (direction === 'left') {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? totalImages - 1 : prevIndex - 1
      );
    } else if (direction === 'right') {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === totalImages - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setLoading(true);
      axiosInstance.get(`users/potential-matches/?page=${prevPage}`)
        .then(response => {
          const data = response.data;
          setProfiles(data.results);
          setCurrentPage(prevPage);
          setCurrentIndex(data.results.length - 1);
          setPaginationInfo({
            totalPages: data.total_pages,
            hasNext: data.has_next,
            totalProfiles: data.count
          });
        })
        .catch(error => {
          console.error('Error fetching previous page:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  if (loading && profiles.length === 0) {
    return (
      <div className="relative shadow-md rounded-lg border p-4 h-full w-3/4 left-32 bg-yellow-300">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading profiles...</div>
        </div>
      </div>
    );
  }

  // Check if we've reached the end of all profiles
  if (currentIndex >= profiles.length && !paginationInfo.hasNext) {
    return (
      <div className="relative shadow-md rounded-lg border p-4 h-full w-3/4 left-32 bg-yellow-300">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-xl text-center">End of the list, let's try after some time</div>
          <button
            onClick={() => setCurrentIndex(profiles.length - 1)}
            className="bg-slate-700 text-white px-6 py-2 rounded-lg hover:bg-slate-600 transition-colors"
          >
            Go Back to Last Profile
          </button>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  if (!currentProfile) {
    return (
      <div className="relative shadow-md rounded-lg border p-4 bg-[#FFFF46] z-10 h-full w-3/4 left-32">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">No profiles available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-2/3 h-full ml-32">
      {(currentIndex > 0 || currentPage > 1) && (
        <button
          onClick={handlePrevious}
          className="absolute top-1/2 left-4 z-20 transform -translate-y-1/2 hover:scale-110 transition-transform duration-200"
          disabled={loading}
        >
          <CircleChevronLeft 
            className={`text-slate-700 hover:text-slate-600 ${loading ? 'opacity-50' : ''}`} 
            size={40} 
          />
        </button>
      )}
      <div className="relative w-full h-full">
        {/* Bottom div (Peach color) */}
        <div className="absolute inset-0 shadow-md rounded-lg border p-4 bg-[#ffc6a4] rotate-6 h-full w-3/4 left-32"></div>
  
        {/* Middle div (Brown color) */}
        <div className="absolute inset-0 shadow-md rounded-lg border p-4 bg-[#f2fedc] -rotate-6 h-full w-3/4 left-32"></div>
  
        {/* Top div (Yellow color) */}
        <div className="absolute inset-0 shadow-md rounded-lg border p-4 bg-yellow-300 z-10 h-full w-3/4 left-32">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-2xl font-semibold italic">
                {currentProfile.username}, {currentProfile.age}
              </div>
              <div className="text-sm text-gray-600">
                <Heart />
              </div>
            </div>
  
            <div className="flex gap-10">
              <div className="relative">
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${currentProfile.images[currentImageIndex]}`}
                  alt={currentProfile.username}
                  className="w-48 h-52 object-cover rounded-lg"
                />
  
                {/* Image Navigation Arrows */}
                {currentProfile.images.length > 1 && (
                  <>
                    <button
                      onClick={() => handleImageNavigation('left')}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2"
                    >
                      <CircleChevronLeft className="text-slate-100 hover:text-slate-300 transition-colors" size={32} />
                    </button>
                    <button
                      onClick={() => handleImageNavigation('right')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      <CircleChevronRight className="text-slate-100 hover:text-slate-300 transition-colors" size={32} />
                    </button>
                  </>
                )}
  
                {/* Image Dots Indicator */}
                {currentProfile.images.length > 1 && (
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {currentProfile.images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-black' : 'bg-black/30'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className='flex flex-col space-y-1'>
                <div className="text-lg font-medium italic">
                  Age: <span className="text-xl font-bold">{currentProfile.age}</span>
                </div>
                <div className="text-lg font-medium italic">
                  Match Percent: <span className="text-xl font-bold">{currentProfile.match_percentage}%</span>
                </div>
              </div>
            </div>
  
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mt-10">
                Interests :
                {currentProfile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-50 text-black rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
  
            <div className="flex justify-between mt-4">
              <button
                onClick={() => handleAction('reject', currentProfile.id)}
                className="bg-slate-700 p-4 rounded-lg hover:bg-slate-600 transition-colors"
              >
                <HeartOff className="text-red-400" size={24} />
              </button>

              <div className="w-full mt-4">
                <QuestionDisplay 
                  activeQuestion={activeQuestion} 
                  handleAction={handleAction} 
                  currentProfile={currentProfile} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {paginationInfo.hasNext && currentIndex === profiles.length -1 && (
          <button onClick={() => fetchProfiles(currentPage + 1)} className="w-full bg-gray-800 text-white rounded-lg py-2 px-4 flex items-center justify-center space-x-2">Load More</button>
      )}
    </div>
  );
};

export default DatingCard;