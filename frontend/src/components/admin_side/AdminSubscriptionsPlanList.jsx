"use client";

import React, { useState, useEffect, Fragment } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-hot-toast";
import { PlusIcon, EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { Dialog, Transition, Menu } from "@headlessui/react";

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

  const sortPlans = (plansArray) => {
    return plansArray.sort((a, b) => {
      const getRank = (p) => {
        if (p.is_active && !p.is_paused) return 0; // Active
        if (p.is_active && p.is_paused) return 1;  // Paused
        return 2;                                  // Inactive
      };
      return getRank(a) - getRank(b);
    });
  };

  const fetchPlans = async () => {
    try {
      const response = await axiosInstance.get("user-admin/subscription-plans/");
      const sortedPlans = sortPlans(response.data);
      setPlans(sortedPlans);
      const activeCount = sortedPlans.filter(
        (plan) => plan.is_active && !plan.is_paused
      ).length;
      setActivePlanCount(activeCount);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching plans", error);
      toast.error("Failed to load subscription plans");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const refreshPlans = async () => {
    try {
      const response = await axiosInstance.get("user-admin/subscription-plans/");
      const sortedPlans = sortPlans(response.data);
      setPlans(sortedPlans);
      const activeCount = sortedPlans.filter(
        (plan) => plan.is_active && !plan.is_paused
      ).length;
      setActivePlanCount(activeCount);
    } catch (error) {
      toast.error("Failed to refresh plans");
    }
  };

  const handleAction = async (plan) => {
    const { id, is_paused, is_active } = plan;

    if (!is_paused && is_active) {
      return; // Open dropdown (handled below)
    }

    if (is_paused && is_active) {
      if (activePlanCount >= 3) {
        toast.error("Cannot activate more than 3 active plans.");
        return;
      }
      try {
        await axiosInstance.post(`user-admin/subscription-plans/${id}/unpause/`);
        toast.success("Plan resumed successfully");
        refreshPlans();
      } catch (err) {
        toast.error("Error resuming plan");
      }
    } else if (!is_active) {
      if (activePlanCount >= 3) {
        toast.error("Cannot activate. 3 plans are already active.");
        return;
      }
      try {
        await axiosInstance.post(`user-admin/subscription-plans/${id}/reactivate/`);
        toast.success("Plan activated");
        refreshPlans();
      } catch (err) {
        toast.error("Error activating plan");
      }
    }
  };

  const handleDropdownAction = async (plan, action) => {
    const { id } = plan;

    try {
      if (action === "pause") {
        await axiosInstance.post(`user-admin/subscription-plans/${id}/pause/`);
        toast.success("Plan paused");
      } else if (action === "deactivate") {
        await axiosInstance.post(`user-admin/subscription-plans/${id}/pause/`);
        await axiosInstance.post(`user-admin/subscription-plans/${id}/deactivate/`);
        toast.success("Plan paused & deactivated");
      }
      refreshPlans();
    } catch {
      toast.error("Error updating plan");
    }
  };

  const handleCreatePlan = async () => {
    try {
      await axiosInstance.post("user-admin/subscription-plans/", newPlan);
      toast.success("Plan created successfully");
      closeCreateModal();
      refreshPlans();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to create subscription plan"
      );
    }
  };

  const handleInputChange = (e) => {
    setNewPlan({ ...newPlan, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  if (loading) return <div>Loading subscription plans...</div>;

  return (
    <div className="h-full bg-white shadow-md rounded-lg">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <button
            disabled={activePlanCount >= 3}
            className="flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:bg-gray-400"
            onClick={openCreateModal}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Plan
          </button>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-xl border bg-white p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{plan.name}</h2>
                  {plan.is_active && !plan.is_paused && (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                  {plan.is_active && plan.is_paused && (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Paused
                    </span>
                  )}
                  {!plan.is_active && (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-gray-700 text-sm mt-1">
                  <strong>Price:</strong> ₹{plan.price}
                </p>
                <p className="text-gray-700 text-sm">
                  <strong>Description:</strong> {plan.description}
                </p>
                <p className="text-gray-700 text-sm">
                  <strong>Duration:</strong>{" "}
                  {
                    {
                      "3M": "3 Months",
                      "6M": "6 Months",
                      "1Y": "1 Year",
                    }[plan.duration]
                  }
                </p>
                <p className="text-gray-500 text-xs mt-1">
                    <strong>Created:</strong>{" "}
                    {(() => {
                        const date = new Date(plan.created_at);
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const year = date.getFullYear();
                        return `${day}/${month}/${year}`;
                    })()}
                </p>

              </div>

              <div className="mt-4">
                {(plan.is_active && !plan.is_paused) ? (
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
                      Actions
                      <EllipsisVerticalIcon className="ml-2 h-5 w-5" />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => handleDropdownAction(plan, "pause")}
                              className={`${
                                active ? "bg-gray-100" : ""
                              } w-full text-left px-4 py-2 text-sm text-gray-700`}
                            >
                              Pause
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => handleDropdownAction(plan, "deactivate")}
                              className={`${
                                active ? "bg-gray-100" : ""
                              } w-full text-left px-4 py-2 text-sm text-gray-700`}
                            >
                              Pause & Deactivate
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Menu>
                ) : (
                  <button
                    className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    onClick={() => handleAction(plan)}
                  >
                    {plan.is_active && plan.is_paused ? "Resume" : "Activate"}
                  </button>
                )}
              </div>
            </div>
          ))}
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
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Create New Subscription Plan
                    </Dialog.Title>
                    <div className="mt-2 grid grid-cols-1 gap-4">
                      <input
                        type="text"
                        name="name"
                        placeholder="Plan Name"
                        onChange={handleInputChange}
                        className="border rounded p-2"
                      />
                      <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        onChange={handleInputChange}
                        className="border rounded p-2"
                      />
                      <textarea
                        name="description"
                        placeholder="Description"
                        rows="3"
                        onChange={handleInputChange}
                        className="border rounded p-2"
                      />
                      <select
                        name="duration"
                        onChange={handleInputChange}
                        value={newPlan.duration}
                        className="border rounded p-2"
                      >
                        <option value="">Select Duration</option>
                        <option value="3M">3 Months</option>
                        <option value="6M">6 Months</option>
                        <option value="1Y">1 Year</option>
                      </select>
                    </div>

                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={handleCreatePlan}
                        className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
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
      </div>
    </div>
  );
};

export default AdminSubscriptionsPlanList;
