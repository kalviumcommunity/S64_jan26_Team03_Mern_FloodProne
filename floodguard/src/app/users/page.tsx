"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import AddUser from "@/components/users/AddUser";

export default function UsersPage() {
  const { data, error, isLoading } = useSWR("/api/users?page=1&limit=10", fetcher);

  if (error) return <p className="text-red-500 p-6">Failed to load users.</p>;
  if (isLoading) return <p className="p-6">Loading users...</p>;

  // Accessing data deeply based on API structure: { success: true, data: { users: [...] } }
  const users = data?.data?.users || [];

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">User List (SWR)</h1>
      
      <AddUser />

      <ul className="mt-6 space-y-3">
        {users.length === 0 ? (
            <p>No users found.</p>
        ) : (
            users.map((user: any) => (
            <li key={user.id} className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <div className="font-semibold">{user.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                <div className="text-xs text-gray-500 mt-1">Role: {user.role}</div>
            </li>
            ))
        )}
      </ul>
    </main>
  );
}
