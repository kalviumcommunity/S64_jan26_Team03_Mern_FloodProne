"use client";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Login() {
  const router = useRouter();

  function handleLogin() {
    Cookies.set("token", "fake.jwt.token");
    router.push("/dashboard");
  }

  return (
    <main className="mt-10 text-center">
      <h1 className="text-xl">Login</h1>
      <button
        onClick={handleLogin}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Login
      </button>
    </main>
  );
}
