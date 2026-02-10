"use client";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";

export default function AddUser() {
  const { data } = useSWR("/api/users?page=1&limit=10", fetcher); // Ensure key matches
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123"); // Default for demo

  const addUser = async () => {
    if (!name || !email) return;

    const newUser = { 
        name, 
        email, 
        role: "USER", 
        locationId: null, // Optional
        id: Date.now(), // Temp ID
        createdAt: new Date().toISOString()
    };

    // Optimistic update
    // We assume the data structure matches the API response: { success: true, data: { users: [...] } }
    // Or if the API returns { users: [...], meta: ... } directly inside data.
    // Based on previous files, verify API response structure.
    
    // Actually, let's verify the API response structure first before finalizing this optimistic update logic to avoid type errors.
    // Assuming standard response: { success: true, data: { users: [...] } }
    
    // For now, I'll implement a basic optimistic update and refine it if the structure differs.
    // The previous `/api/users` code returned: sendSuccess({ users, meta }, ...)
    // So `data` from SWR will be: { success: true, data: { users: [...], meta: ... } }

    mutate(
      "/api/users?page=1&limit=10",
      (currentData: any) => ({
        ...currentData,
        data: {
          ...currentData?.data,
          users: [newUser, ...(currentData?.data?.users || [])],
        },
      }),
      false // Revalidate = false
    );

    try {
      const token = localStorage.getItem("floodguard_token");
      await fetch("/api/users", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ name, email, password }),
      });
      // Trigger revalidation to get real ID and data
      mutate("/api/users?page=1&limit=10");
      setName("");
      setEmail("");
    } catch (error) {
      console.error("Failed to add user", error);
    }
  };

  return (
    <div className="mt-6 p-4 border rounded shadow-sm bg-gray-50 dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-2">Add New User</h3>
      <div className="flex gap-2 mb-2">
        <input
          className="border px-2 py-1 flex-1 rounded text-black"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <input
          className="border px-2 py-1 flex-1 rounded text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
      </div>
      <button
        onClick={addUser}
        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
      >
        Add User
      </button>
    </div>
  );
}
