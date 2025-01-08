import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
  Button,
  Typography
} from "@material-tailwind/react";
import { INTERESTS } from '../userProfile/userprofileComponents/ProfileInterests';
import axiosInstance from '../../../utils/axiosConfig';

const ProfileCreationDialog = ({ open, userData }) => {
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    birth_date: new Date(),
    gender: '',
    gender_preferences: '',
    interests: [],
    location: {
      latitude: 0,
      longitude: 0,
      address: '',
    },
  });

  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.interests.length < 10) {
      toast.error('Please select at least 10 interests');
      return;
    }
    
    try {
      const submitData = {
        ...formData,
        birth_date: formData.birth_date.toISOString().split('T')[0],
      };

      await axiosInstance.post('users/set-user-profile/', submitData);
      toast.success('Profile created successfully!');
      window.location.reload(); // Reload to update the profile status
    } catch (error) {
      setError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to create profile'
      );
      toast.error('Failed to create profile');
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: formData.location.address
          };
          handleFieldChange('location', newLocation);
        },
        (error) => {
          setError('Failed to get location: ' + error.message);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  return (
    <Dialog open={open} className="relative bg-white shadow-md rounded-lg border p-4 h-full w-3/4 left-32">
      <DialogHeader>
        <Typography variant="h4">Complete Your Profile</Typography>
      </DialogHeader>

      <DialogBody divider className="overflow-y-auto max-h-[calc(100vh-200px)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Name
              </Typography>
              <Input
                value={formData.name}
                readOnly
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Email
              </Typography>
              <Input
                type="email"
                value={formData.email}
                readOnly
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Date of Birth
              </Typography>
              <DatePicker
                selected={formData.birth_date}
                onChange={(date) => handleFieldChange('birth_date', date || new Date())}
                dateFormat="dd/MM/yyyy"
                className="w-full rounded-lg border-blue-gray-200 p-2 focus:border-gray-900"
              />
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Gender
              </Typography>
              <Select
                value={formData.gender}
                onChange={(value) => handleFieldChange('gender', value)}
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              >
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="other">Other</Option>
              </Select>
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Gender Preference
              </Typography>
              <Select
                value={formData.gender_preferences}
                onChange={(value) => handleFieldChange('gender_preferences', value)}
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              >
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="bi">Bi</Option>
              </Select>
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Location
              </Typography>
              <div className="space-y-2">
                <Button
                  onClick={getCurrentLocation}
                  variant="outlined"
                  fullWidth
                >
                  Get Current Location
                </Button>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    value={formData.location.latitude}
                    readOnly
                    placeholder="Latitude"
                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                  <Input
                    value={formData.location.longitude}
                    readOnly
                    placeholder="Longitude"
                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Interests (Select at least 10)
              </Typography>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => {
                      const interests = formData.interests || [];
                      const newInterests = interests.includes(interest)
                        ? interests.filter((i) => i !== interest)
                        : [...interests, interest];
                      handleFieldChange('interests', newInterests);
                    }}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.interests?.includes(interest)
                        ? 'bg-yellow-200 text-black'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <Typography variant="small" color="gray" className="mt-2">
                Selected: {formData.interests.length}/10
              </Typography>
            </div>
          </div>
        </form>
      </DialogBody>

      <DialogFooter className="space-x-2">
        <Button
          onClick={handleSubmit}
          fullWidth
          disabled={formData.interests.length < 10}
        className='text-black'>
          Create Profile
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ProfileCreationDialog;