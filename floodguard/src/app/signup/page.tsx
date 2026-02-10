"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/FormInput";
import { useState } from "react";

// 1. Define validation schema
const signupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Signup Data:", data);
    setSuccess(true);
    reset();
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Create Account</h1>

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-center">
            Signup successful!
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput
            label="Name"
            name="name"
            register={register}
            error={errors.name}
            placeholder="John Doe"
          />
          <FormInput
            label="Email"
            name="email"
            type="email"
            register={register}
            error={errors.email}
            placeholder="john@example.com"
          />
          <FormInput
            label="Password"
            name="password"
            type="password"
            register={register}
            error={errors.password}
            placeholder="••••••"
          />
           <FormInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            register={register}
            error={errors.confirmPassword}
            placeholder="••••••"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </main>
  );
}
