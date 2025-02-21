import { v2 as cloudinary } from "cloudinary";
// import dotenv from "dotenv";

// // Load environment variables from .env
// dotenv.config();

// Configure Cloudinary with API keys
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME, // Your Cloudinary cloud name
  api_key: process.env.CLOUDINARY_API_KEY, // Your Cloudinary API key
  api_secret: process.env.CLOUDINARY_API_SECRET, // Your Cloudinary API secret
});

export default cloudinary;
