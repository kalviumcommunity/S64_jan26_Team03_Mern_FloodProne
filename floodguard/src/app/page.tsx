"use client";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";

export default function Home() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme, sidebarOpen, toggleSidebar } = useUI();

  return (
    <main className="p-6 bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen transition-colors duration-300">
      <h1 className="text-2xl font-bold mb-4">
        Context & Hooks Demo (+ Responsive/Themed)
      </h1>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Auth State</h2>
        {isAuthenticated ? (
          <>
            <p className="mb-2">Logged in as: {user}</p>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => login("KalviumUser")}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition"
          >
            Login
          </button>
        )}
      </section>

      <section className="mb-8">
        <h2 className="font-semibold mb-2">UI Controls</h2>
        <p className="mb-2">Current Theme: {theme}</p>
        <div className="flex gap-3">
            <button
            onClick={toggleTheme}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition"
            >
            Toggle Theme
            </button>
            <button
            onClick={toggleSidebar}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded transition"
            >
            {sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
            </button>
        </div>
      </section>

      <section className="mb-12 text-center p-4 md:p-8 lg:p-12 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm transition-colors border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Responsive & Themed
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
          This UI adapts to your device size and color preference.
          Try resizing the window or toggling the theme!
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
            <div className="w-full sm:w-auto bg-brand-light p-4 rounded text-black font-semibold shadow">
                Brand Light
            </div>
             <div className="w-full sm:w-auto bg-brand p-4 rounded text-white font-semibold shadow">
                Brand Default
            </div>
             <div className="w-full sm:w-auto bg-brand-dark p-4 rounded text-white font-semibold shadow">
                Brand Dark
            </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full max-w-2xl">
        <a
          href="/users"
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition text-center border border-gray-200 dark:border-gray-700 block"
        >
          <h2 className="text-xl font-semibold mb-2">Manage Users &rarr;</h2>
          <p className="text-gray-600 dark:text-gray-400">
            View, add, and remove users.
          </p>
        </a>
         <a
          href="/signup"
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition text-center border border-gray-200 dark:border-gray-700 block"
        >
          <h2 className="text-xl font-semibold mb-2">Sign Up &rarr;</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create a new account.
          </p>
        </a>
      </div>
    </main>
  );
}
