import { createClerkClient, verifyToken } from "@clerk/backend";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// 🧠 GET — Admin fetches all pending seller requests
export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const { sub: adminId } = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      clockSkewInMs: 60000,
    });

    if (!adminId) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Fetch admin user
    const adminUser = await clerk.users.getUser(adminId);
    if (adminUser.publicMetadata?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Fetch all users (Clerk returns an object, not array)
    const usersResponse = await clerk.users.getUserList({ limit: 100 });
    const users = usersResponse?.data || []; // ✅ FIXED HERE

    const requests = users
      .filter(
        (u) =>
          u.publicMetadata?.roleRequest === "seller" &&
          u.publicMetadata?.role !== "seller"
      )
      .map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.emailAddresses?.[0]?.emailAddress || "",
      }));

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// 🧠 POST — User requests seller role
export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const { sub: userId } = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      clockSkewInMs: 60000,
    });

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const user = await clerk.users.getUser(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const currentMetadata = user.publicMetadata || {};

    if (currentMetadata.roleRequest === "seller") {
      return NextResponse.json({
        success: false,
        message: "Seller request already pending",
      });
    }

    const updatedMetadata = { ...currentMetadata, roleRequest: "seller" };

    await clerk.users.updateUser(userId, { publicMetadata: updatedMetadata });

    return NextResponse.json({ success: true, message: "Request sent" });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
