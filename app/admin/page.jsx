"use client";
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";

const AdminDashboard = () => {
  const { getToken, user } = useAppContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch role requests
  const fetchRequests = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/admin/role-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setRequests(data.requests);
      else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Approve seller request
  const approveSeller = async (userId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/updateRole",
        { userId, newRole: "seller" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success("Role updated!");
        setRequests((prev) => prev.filter((u) => u.id !== userId));
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (user?.publicMetadata?.role === "admin") fetchRequests();
  }, [user]);

  // Unauthorized view
  if (!user || user.publicMetadata.role !== "admin") {
    return (
      <>
        <Navbar />
        <div className="p-10 text-center text-red-600 font-semibold">
          Unauthorized Access
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-10 min-h-[70vh]">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Admin Dashboard
        </h1>
        <h2 className="text-xl font-medium mb-4 text-gray-700">
          Seller Role Requests
        </h2>

        {loading ? (
          <Loading />
        ) : requests.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No pending requests.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  {["User ID", "Name", "Email", "Action"].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-gray-700 font-medium border-b"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 border-b">{u.id}</td>
                    <td className="px-4 py-3 border-b">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-4 py-3 border-b">{u.email}</td>
                    <td className="px-4 py-3 border-b">
                      <button
                        onClick={() => approveSeller(u.id)}
                        className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition"
                      >
                        Approve Seller
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
