import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import authSeller from "@/lib/authSeller";
import connectDB from "@/config/db";
import Product from "@/models/Product";

export async function GET(request) {
    
    try {
        
        const { userId } = getAuth(request)
        
        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse.json({ success: false, message: "Not authorized" });
        }
        await connectDB();
        

        const products = await Product.find({ userId });
        return NextResponse.json({ success: true, products });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}