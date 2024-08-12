import { v2 as cloudinary } from 'cloudinary';


const uploadImage = async (image, folder, width, height) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const result = await cloudinary.uploader.upload(image, {
      folder: folder,
      transformation: [{width: width, height: height, crop: "limit"}],
    });
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

const uploadMultipleImages = async (images, folder, width, height) => {
  try {
    const uploadPromises = images.map((image) =>
      uploadImage(image, folder, width, height)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    throw error;
  }
};


const deleteImage = async (imageUrl) => {
  try {
    const publicId = imageUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

export {uploadImage, uploadMultipleImages, deleteImage};
