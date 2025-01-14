import React, { useState, useRef, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { deleteProfilePicture, getUserPictures, updateProfilePicture, uploadProfilePictures } from './PictureUpload';
const UserProfilePic = () => {
  const [pictures, setPictures] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingPictures, setExistingPictures] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchExistingPictures();
  }, []);

  const fetchExistingPictures = async () => {
    setIsLoading(true);
    try {
      const data = await getUserPictures();
      console.log('Fetched pictures data:', data); // Debug log
      
      if (!data) {
        console.error('No data received from server');
        return;
      }

      setExistingPictures(data);
      
      // Create previews for existing images
      const existingPreviews = Object.entries(data)
        .filter(([_, url]) => url && typeof url === 'string')
        .map(([key, url]) => ({
          id: key,
          url: url.startsWith('http') 
            ? url 
            : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${url}`,
          isExisting: true
        }));
      
      console.log('Created previews:', existingPreviews);
      setPreviews(existingPreviews);
    } catch (error) {
      console.error('Error fetching pictures:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);
    
    // Reset input value to allow selecting the same file again
    event.target.value = '';
    
    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload only image files');
        return false;
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('File size should be less than 5MB');
        return false;
      }
      
      return true;
    });
    
    if (previews.length + validFiles.length > 4) {
      toast.error('You can only upload up to 4 pictures');
      return;
    }

    const newPreviews = validFiles.map(file => ({
      id: URL.createObjectURL(file),
      url: URL.createObjectURL(file),
      file: file,
      isExisting: false
    }));

    setPictures(prev => [...prev, ...validFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemovePicture = async (preview) => {
    setIsLoading(true);
    try {
      if (preview.isExisting) {
        await deleteProfilePicture(preview.id); 
        
        // Update the existingPictures state
        setExistingPictures(prev => ({
          ...prev,
          [preview.id]: null
        }));

        // Update previews state
        setPreviews(prev => prev.filter(p => p.id !== preview.id));
        
        toast.success('Picture removed successfully');
        
        // Refresh pictures after removal
        await fetchExistingPictures();
      } else {
        // For new pictures that haven't been uploaded yet
        URL.revokeObjectURL(preview.url);
        setPreviews(prev => prev.filter(p => p.id !== preview.id));
        setPictures(prev => prev.filter(file => 
          URL.createObjectURL(file) !== preview.url
        ));
      }
    } catch (error) {
      console.error('Error removing picture:', error);
      toast.error('Failed to remove picture');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Find available slots and append files
      let filesAdded = 0;
      ['image1', 'image2', 'image3', 'image4'].forEach(slot => {
        if (filesAdded < pictures.length && (!existingPictures[slot] || existingPictures[slot] === null)) {
          formData.append(slot, pictures[filesAdded]);
          filesAdded++;
        }
      });

      if (filesAdded === 0) {
        toast.error('No available slots for new pictures');
        return;
      }

      const response = await uploadProfilePictures(formData);
      console.log('Upload response:', response); // Debug log
      
      // Clean up object URLs
      previews.forEach(preview => {
        if (!preview.isExisting) {
          URL.revokeObjectURL(preview.url);
        }
      });

      // Reset states and fetch fresh data
      setPictures([]);
      toast.success('Pictures uploaded successfully!');
      await fetchExistingPictures();
    } catch (error) {
      console.error('Error uploading pictures:', error);
      toast.error('Failed to upload pictures');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Profile Pictures</h2>
        <p className="text-gray-600">Upload up to 4 profile pictures</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previews.map((preview) => (
            <div key={preview.id} className="relative aspect-square bg-gray-100 rounded-lg">
              <img
                src={preview.url}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  console.error('Image load error for:', preview.url);
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
              <button
                onClick={() => handleRemovePicture(preview)}
                className="absolute top-2 right-2 p-1 bg-gray-300 opacity-70 text-white rounded-full hover:bg-red-600 disabled:opacity-50"
                disabled={isLoading}
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {previews.length < 4 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              <Upload size={24} className="text-gray-400" />
              <span className="text-sm text-gray-500">Add Picture</span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          disabled={isLoading}
        />

        {pictures.length > 0 && (
          <button
            onClick={handleUpload}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Uploading...' : 'Upload Pictures'}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserProfilePic;