import { createClerkClient, verifyToken } from "@clerk/backend";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // optional but good for clarity

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(req) {
  try {
    const { userId, newRole } = await req.json();

    // Get Authorization header (admin token)
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Missing token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const { sub: adminId } = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    if (!adminId) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Fetch admin user
    const adminUser = await clerk.users.getUser(adminId);
    if (!adminUser || adminUser.publicMetadata?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Fetch target user
    const targetUser = await clerk.users.getUser(userId);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // ✅ Update the user's role
    await clerk.users.updateUser(userId, {
      publicMetadata: {
        ...targetUser.publicMetadata,
        role: newRole,
        roleRequest: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Role updated successfully",
    });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
  