import { v2 as cloudinary } from "cloudinary";
export const configureCloudinary = (): void => {
  try {
    if (
      cloudinary &&
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
      console.log("☁️ Cloudinary SDK configured with API key credentials.");
    } else if (cloudinary && process.env.CLOUDINARY_URL) {
      cloudinary.config({
        cloudinary_url: process.env.CLOUDINARY_URL,
        secure: true,
      });
      console.log("☁️ Cloudinary SDK configured via CLOUDINARY_URL.");
    }
    else {
        console.warn("⚠️ Cloudinary configuration is missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET or CLOUDINARY_URL in your environment variables.");
    }
  } catch (error) {
    console.error("❌ Error configuring Cloudinary:", error);
  }
};
