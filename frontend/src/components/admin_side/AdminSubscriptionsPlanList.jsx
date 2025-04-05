"use client";

import React, { useState, useEffect, Fragment } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-hot-toast";
import { PlusIcon } from "@heroicons/react/24/solid";
import { Dialog, Transition } from "@headlessui/react";

const AdminSubscriptionsPlanList = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePlanCount, setActivePlanCount] = useState(0);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: "",
    description: "",
    duration: "",
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axiosInstance.get("user-admin/subscription-plans/");
        setPlans(response.data);
        setLoading(false);

        const activeCount = response.data.filter(
          (plan) => plan.is_active && !plan.is_paused
        ).length;
        setActivePlanCount(activeCount);
      } catch (error) {
        console.error("Error fetching subscription plans:", error);
        toast.error("Failed to load subscription plans");
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handlePauseResume = async (planId, isPaused) => {
    try {
      const endpoint = isPaused
        ? `user-admin/subscription-plans/${planId}/unpause/`
        : `user-admin/subscription-plans/${planId}/pause/`;
      await axiosInstance.post(endpoint);

      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan.id === planId ? { ...plan, is_paused: !isPaused } : plan
        )
      );
      setActivePlanCount((prevCount) => (isPaused ? prevCount + 1 : prevCount - 1));
      toast.success(`Subscription plan ${isPaused ? "resumed" : "paused"}`);
    } catch (error) {
      console.error("Error pausing/resuming plan:", error);
      toast.error("Failed to update subscription plan status");
    }
  };

  const handleActivateDeactivate = async (planId, isActive) => {
    try {
      const endpoint = isActive
        ? `user-admin/subscription-plans/${planId}/deactivate/`
        : `user-admin/subscription-plans/${planId}/reactivate/`;
      await axiosInstance.post(endpoint);

      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan.id === planId ? { ...plan, is_active: !isActive } : plan
        )
      );
      toast.success(`Subscription plan ${isActive ? "deactivated" : "activated"}`);
    } catch (error) {
      console.error("Error activating/deactivating plan:", error);
      toast.error("Failed to update subscription plan status");
    }
  };

  const handleInputChange = (e) => {
    setNewPlan({ ...newPlan, [e.target.name]: e.target.value });
  };

  const handleCreatePlan = async () => {
    try {
      const response = await axiosInstance.post("user-admin/subscription-plans/", newPlan);
      setPlans((prevPlans) => [...prevPlans, response.data]);
      setActivePlanCount((prevCount) => prevCount + 1);
      toast.success("Subscription plan created successfully");

      closeCreateModal();
    } catch (error) {
      console.error("Error creating subscription plan:", error);
      toast.error(error.response?.data?.error || "Failed to create subscription plan");
    }
  };

  function openCreateModal() {
    setIsCreateModalOpen(true);
  }
  function closeCreateModal() {
    setIsCreateModalOpen(false);
  }

  if (loading) {
    return <div>Loading subscription plans...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <button
          className={`flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed`}
          onClick={openCreateModal}
          disabled={activePlanCount >= 3}
        >
          <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
          Create Plan
        </button>
      </div>

      {/* Create Plan Modal */}
      <Transition appear show={isCreateModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeCreateModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Create New Subscription Plan
                  </Dialog.Title>
                  <div className="mt-2">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                          Plan Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="price" className="block text-sm font-medium text-gray-900">
                          Price
                        </label>
                        <input
                          type="number"
                          name="price"
                          id="price"
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-900">
                          Description
                        </label>
                        <textarea
                          name="description"
                          id="description"
                          rows="3"
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-900">
                            Duration
                        </label>
                            <select
                                name="duration"
                                id="duration"
                                onChange={handleInputChange}
                                value={newPlan.duration}
                                className="mt-1 block w-full rounded-md border border-gray-300 bg-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">Select duration</option>
                                <option value="3M">3 Months</option>
                                <option value="6M">6 Months</option>
                                <option value="1Y">1 Year</option>
                            </select>
                    </div>

                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleCreatePlan}
                      className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                    >
                      Create
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Plans Display */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Price:</strong> ${plan.price}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Description:</strong> {plan.description}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Duration:</strong> {plan.duration} days
              </p>
              <p className="text-sm text-gray-500">
                <strong>Created At:</strong>{" "}
                {new Date(plan.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              <button
                onClick={() => handlePauseResume(plan.id, plan.is_paused)}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  plan.is_paused
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-yellow-500 hover:bg-yellow-600 text-white"
                }`}
              >
                {plan.is_paused ? "Resume" : "Pause"}
              </button>
              <button
                onClick={() => handleActivateDeactivate(plan.id, plan.is_active)}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  plan.is_active
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {plan.is_active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSubscriptionsPlanList;
