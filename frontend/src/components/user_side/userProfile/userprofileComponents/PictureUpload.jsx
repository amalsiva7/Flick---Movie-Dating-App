import axiosInstance from "../../../../utils/axiosConfig";


export const uploadProfilePictures = async (formData) => {
  try {

    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ', pair[1]); // This will show the field name and file
    }


    const response = await axiosInstance.post('/users/set-user-pic/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    // The axiosInstance will handle the toast notifications
    throw error;
  }
};

export const updateProfilePicture = async (imageField, file) => {
  try {
    const formData = new FormData();
    formData.append(imageField, file);

    const response = await axiosInstance.patch('/users/update-user-pic/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    // The axiosInstance will handle the toast notifications
    throw error;
  }
};

export const getUserPictures = async () => {
  try {
    const response = await axiosInstance.get('/users/set-user-pic/');
    return response.data;
  } catch (error) {
    // The axiosInstance will handle the toast notifications
    throw error;
  }
};

export const deleteProfilePicture = async (imageField) => {
  try {
    const response = await axiosInstance.delete('/users/update-user-pic/', {
      data: { image_field: imageField }, // Send the image field name
    });
    console.log("In deleteProfilePic pictureUpload",response.data)
    return response.data;
  } catch (error) {
    throw error; // Axios will handle errors
  }
};
