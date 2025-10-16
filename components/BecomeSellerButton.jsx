// "use client";
// import { useAppContext } from "@/context/AppContext";
// import { useState } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";

// const BecomeSellerButton = () => {
//   const { getToken, user, fetchUserData } = useAppContext();
//   const [loading, setLoading] = useState(false);

//   const alreadyRequested = user?.publicMetadata?.roleRequest === "seller";
//   const isSeller = user?.publicMetadata?.role === "seller";

//   const handleRequest = async () => {
//     setLoading(true);
//     try {
//       const token = await getToken();
//       console.log({token});
      
//      await axios.post(
//        "/api/admin/role-requests", // <-- update this line
//        {},
//        { headers: { Authorization: `Bearer ${token}` } }
//      );
//       toast.success("Request sent to admin!");
      
//       fetchUserData && fetchUserData();
//     } catch (error) {
//       toast.error("Failed to send request");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (isSeller) return null;
//   if (alreadyRequested)
//     return (
//       <button disabled className="bg-gray-400 text-white px-4 py-2 rounded">
//         Seller Request Pending
//       </button>
//     );

//   return (
//     <button
//       onClick={handleRequest}
//       disabled={loading}
//       className="bg-blue-600 text-white px-4 py-2 rounded"
//     >
//       {loading ? "Requesting..." : "Become a Seller"}
//     </button>
//   );
// };

// export default BecomeSellerButton;

"use client";
import { useAppContext } from "@/context/AppContext";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const BecomeSellerButton = () => {
  const { getToken, user, fetchUserData } = useAppContext();
  const [loading, setLoading] = useState(false);

  const alreadyRequested = user?.publicMetadata?.roleRequest === "seller";
  const isSeller = user?.publicMetadata?.role === "seller";

  const handleRequest = async () => {
    if (alreadyRequested) return;

    setLoading(true);
    try {
      const token = await getToken();

      if (!token) {
        toast.error("Authentication failed — please sign in again");
        return;
      }

      await axios.post(
        "/api/admin/role-requests",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Request sent to admin!");
      fetchUserData && fetchUserData();
    } catch (error) {
      console.error("Error sending request:", error);
      toast.error(error.response?.data?.message || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  if (isSeller) return null;

  return (
    <button
      onClick={handleRequest}
      disabled={loading || alreadyRequested}
      className={`px-4 py-2 rounded ${
        alreadyRequested ? "bg-gray-400 text-white" : "bg-blue-600 text-white"
      }`}
    >
      {loading
        ? "Requesting..."
        : alreadyRequested
        ? "Seller Request Pending"
        : "Become a Seller"}
    </button>
  );
};

export default BecomeSellerButton;
