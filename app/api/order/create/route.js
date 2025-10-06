import { getAuth } from "@clerk/nextjs/dist/types/server"
import { NextResponse } from 'next/server'
import Product from "@/models/Product";
import { inngest } from "@/config/inngest";
import { use } from "react";

export async function POST(request) {
    
    try {
        
        const { userId } = getAuth(request)
        const { address, items } = await request.json();

        if(!address || !items) {
            return NextResponse.json({success: false, message: "Invalid data"})
        }

        // calcuate amount using items
        const amount = items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            return acc + product.price * item.quantity;

        }, 0)

        await inngest.send({
            name: 'order/create',
                data: {
                userId,
                    address,
                    items,
                    amount: amount + Math.floor(amount * 0.02),
                    date:Date.now()
            }
        
        })

        //clear user cart
        const user = await User.findById(userId);
        user.cartItems = {}
        await user.save()

        return NextResponse.json({success: true, message: "Order placed successfully"})

    }catch(error) {
        console.log(error)
        return NextResponse.json({success: false, message: error.message})
    }
}