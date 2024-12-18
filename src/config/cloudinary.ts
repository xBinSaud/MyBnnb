// Function to upload image to Cloudinary
export const uploadImage = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'MyBNNB');
    formData.append('folder', 'receipts');

    const response = await fetch(
      'https://api.cloudinary.com/v1_1/dvl91s4ww/upload',
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary error:', errorData);
      throw new Error(`Failed to upload image: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Upload successful:', data);
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
