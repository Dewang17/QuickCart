"use client";

import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";

const ContactPage = () => {
  const { router } = useAppContext();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill all fields");
      return;
    }

    // Optionally send to backend API or Email service
    toast.success("Message sent successfully!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Contact Us</h1>

      <p className="text-gray-500 text-center max-w-lg mb-10">
        Have questions or feedback? We’d love to hear from you. Fill out the
        form below and our team will get back to you soon.
      </p>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-md rounded-2xl p-6 flex flex-col gap-4"
      >
        <div>
          <label className="block text-gray-600 mb-1 font-medium">Name</label>
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1 font-medium">
            Message
          </label>
          <textarea
            name="message"
            placeholder="Type your message..."
            rows="4"
            value={formData.message}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white rounded-lg py-2.5 mt-2 hover:bg-blue-700 transition"
        >
          Send Message
        </button>
      </form>

      <div className="text-gray-500 mt-8">
        <p>
          Email:{" "}
          <span className="text-gray-700 font-medium">support@example.com</span>
        </p>
        <p>
          Phone:{" "}
          <span className="text-gray-700 font-medium">+91 98765 43210</span>
        </p>
      </div>
    </div>
  );
};

export default ContactPage;
