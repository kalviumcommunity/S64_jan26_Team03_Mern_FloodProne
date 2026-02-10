"use client";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import toast from "react-hot-toast";
import { fetcher } from "@/lib/fetcher";
import AddUser from "@/components/users/AddUser";
import Modal from "@/components/ui/Modal";
import Loader from "@/components/ui/Loader";

export default function UsersPage() {
  const { data, error, isLoading } = useSWR("/api/users?page=1&limit=10", fetcher, {
    suspense: true,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Accessing data deeply based on API structure: { success: true, data: { users: [...] } }
  const users = data?.data?.users || [];

  const confirmDelete = (user: any) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        // Optimistic delete could be done here too
        // await fetch(\`/api/users/\${userToDelete.id}\`, { method: "DELETE" });
        // For now, valid simulation:
        
        toast.success(`User ${userToDelete.name} deleted!`);
        
        // Mutate cache to remove user locally
        mutate("/api/users?page=1&limit=10", (currentData: any) => ({
            ...currentData,
            data: {
                ...currentData?.data,
                users: currentData?.data?.users.filter((u: any) => u.id !== userToDelete.id)
            }
        }), false);

        setIsDeleteModalOpen(false);
    } catch (err) {
        toast.error("Failed to delete user.");
    } finally {
        setIsDeleting(false);
        setUserToDelete(null);
    }
  };

  if (error) return <p className="text-red-500 p-6">Failed to load users.</p>;
  if (isLoading) return <div className="p-6"><Loader /></div>;

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">User List (SWR + Feedback)</h1>
      
      <AddUser />

      <ul className="mt-6 space-y-3">
        {users.length === 0 ? (
            <p>No users found.</p>
        ) : (
            users.map((user: any) => (
            <li key={user.id} className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition flex justify-between items-center">
                <div>
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                    <div className="text-xs text-gray-500 mt-1">Role: {user.role}</div>
                </div>
                <button 
                  onClick={() => confirmDelete(user)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 border border-red-200 rounded hover:bg-red-50"
                  aria-label={`Delete ${user.name}`}
                >
                  Delete
                </button>
            </li>
            ))
        )}
      </ul>

      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <p className="mb-6 text-gray-600 dark:text-gray-300">
            Are you sure you want to delete <strong>{userToDelete?.name}</strong>? This action cannot be undone.
        </p>
        
        <div className="flex justify-end gap-3">
            <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
                Cancel
            </button>
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
                {isDeleting && <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div>}
                {isDeleting ? "Deleting..." : "Confirm"}
            </button>
        </div>
      </Modal>
    </main>
  );
}
