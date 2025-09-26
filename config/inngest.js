import User from "@/models/User";
import { Inngest } from "inngest";
import connectDB from "./db";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

// Inngest Function to save user data to a database
export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
  },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;

      // Handle empty email_addresses array
      const email =
        email_addresses && email_addresses.length > 0
          ? email_addresses[0].email_address
          : `${id}@temp.com`; // fallback email

      const userData = {
        _id: id,
        email: email,
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        imageUrl: image_url,
      };

      await connectDB();
      await User.create(userData);
      console.log("User created:", id);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
);

// Inngest function to update user data in database
export const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
  },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;

      // Handle empty email_addresses array
      const email =
        email_addresses && email_addresses.length > 0
          ? email_addresses[0].email_address
          : `${id}@temp.com`; // fallback email

      const userData = {
        _id: id,
        email: email,
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        imageUrl: image_url,
      };

      await connectDB();
      await User.findByIdAndUpdate(id, { $set: userData }, { new: true });
      console.log("User updated:", id);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
);

// Inngest Function to delete user from database
export const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
  },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      const { id } = event.data;

      await connectDB();
      await User.findByIdAndDelete(id);
      console.log("User deleted:", id);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
);
