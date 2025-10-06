import connectDB from "@/config/db";
import User from "@/models/User";
import { verifyToken } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with clock tolerance
    const { sub: userId } = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      clockSkewInMs: 30000, // Allow 30 seconds clock skew
    });

    console.log("User ID:", userId);

    if (!userId) {
      return NextResponse.json({ success: false, message: "Invalid token" });
    }
    console.log({ userId });

    await connectDB();
    const user = await User.findById(userId);

    
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" });
    } 

    return NextResponse.json({ success: true, user: user });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}

