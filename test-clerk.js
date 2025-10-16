import { clerkClient } from "@clerk/nextjs/server";

console.log("CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY);
console.log("clerkClient.users:", clerkClient.users);

(async () => {
  try {
    const user = await clerkClient.users.getUser("user_33ETVajzViH8wHxVh8WjlZhLzLZ");
    console.log("User:", user);
  } catch (e) {
    console.error(e);
  }
})();