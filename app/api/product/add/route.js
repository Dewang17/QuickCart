import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import authSeller from "@/lib/authSeller";
import connectDB from "@/config/db";
import Product from "@/models/Product";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json({ success: false, message: "Not authorized" });
    }

    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const files = formData.getAll("images");

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No files uploaded",
      });
    }

    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image", folder: "products" },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(error);
              } else {
                console.log("Uploaded:", result.secure_url);
                resolve(result.secure_url); // ✅ Return the URL directly
              }
            }
          );
          stream.write(buffer);
          stream.end();
        });
      })
    );

    await connectDB();
    const newProduct = await Product.create({
      userId,
      name,
      description,
      category,
      price: Number(price),
      offerPrice: Number(offerPrice),
      image: uploadedImages, // ✅ Directly assign array of URLs
      date: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Uploaded successfully",
      newProduct,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
