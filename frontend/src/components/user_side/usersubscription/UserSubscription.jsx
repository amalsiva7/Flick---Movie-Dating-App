import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosConfig';
import toast from 'react-hot-toast';
import HeartLoader from '../../loader/HeartLoader';

const UserSubscription = () => {
    const [plans, setPlans] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get('users/subscription-list/');
                setPlans(response.data);
                setLoading(false);
            } catch (error) {
                setError('Failed to Fetch Subscription plan. Please try again.');
                toast.error(error.message || 'An error occurred');
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    if (loading) {
        return (<div className="relative bg-white shadow-md rounded-lg border p-4 h-full w-3/4 left-32 flex justify-center items-center">
            <HeartLoader/>
          </div>)
    }

    return (
        <div className="h-full bg-white relative shadow-md rounded-lg">
            <div className="p-2.5 rounded-lg">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-semibold mb-8">Choose Your Plan</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.name} className="rounded-xl border bg-slate-100 p-6 shadow-sm transition-all hover:shadow-md w-full text-left">
                            <h2 className="text-xl font-semibold mb-2 text-center">{plan.name}</h2>
                            <div className="text-center text-4xl font-bold mb-4">
                                {plan.price}₹
                                <span className="text-sm text-gray-400">/{plan.duration}</span>
                            </div>
                            <p className="text-gray-300 mb-4 text-center">{plan.description}</p>
                            <ul className="list-none space-y-2 flex-grow">
                                <li className="flex items-center text-green-500">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    Unlimited Access to All Features
                                </li>
                                <li className="flex items-center text-green-500">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    Unlimited Messaging & Video Calls
                                </li>
                                <li className="flex items-center text-green-500">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    Priority Profile Boosting
                                </li>
                                <li className="flex items-center text-green-500">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    Exclusive Movie Date Feature Access
                                </li>
                            </ul>
                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">Choose Plan</button>
                        </div>
                    ))}
                </div>
            </div>
            </div>
        </div>
              
        
    );
};

export default UserSubscription;
