import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
// import { uploadProfilePictures } from '../../utils/api/pictures';

export default function PictureUpload({ maxPictures = 4 }) {
  const [pictures, setPictures] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);
    if (pictures.length + files.length > maxPictures) {
      toast.error(`You can only upload up to ${maxPictures} pictures`);
      return;
    }

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPictures(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemovePicture = (index) => {
    URL.revokeObjectURL(previews[index]);
    setPictures(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    try {
      await uploadProfilePictures(pictures);
      previews.forEach(URL.revokeObjectURL);
      setPictures([]);
      setPreviews([]);
    } catch (error) {
      console.error('Error uploading pictures:', error);
      alert('Failed to upload pictures. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {previews.map((preview, index) => (
          <div key={preview} className="relative aspect-square">
            <img
              src={preview}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              onClick={() => handleRemovePicture(index)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        {pictures.length < maxPictures && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 transition-colors"
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
      />

      {pictures.length > 0 && (
        <button
          onClick={handleUpload}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Upload Pictures
        </button>
      )}
    </div>
  );
}