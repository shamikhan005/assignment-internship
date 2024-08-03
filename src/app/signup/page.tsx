"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    email: "",
    username: "",
    password: "",
    role: "student",
  });
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const onSignUp = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/users/signup", user);
      const token = response.headers["authorization"]?.split(" ")[1];
      const { id, role } = response.data.user;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("userId", id);
        localStorage.setItem("userRole", role);
      }
      console.log("SignUp success", response.data);
      router.push("/login");
    } catch (error: any) {
      console.log(
        "SignUp failed",
        error.response?.data?.error || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setButtonDisabled(
      user.email.length === 0 ||
        user.password.length === 0 ||
        user.username.length === 0
    );
  }, [user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gradient-to-r from-gradient-start to-gradient-end">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h1 className="text-2xl mb-4">Sign Up</h1>
        <hr className="w-1/4 mb-4" />

        <label htmlFor="username">Username</label>
        <input
          className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600 text-black w-full"
          id="username"
          value={user.username}
          onChange={(e) => setUser({ ...user, username: e.target.value })}
          placeholder="Username"
          type="text"
        />

        <label htmlFor="email">Email</label>
        <input
          className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600 text-black w-full"
          id="email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          placeholder="Email"
          type="email"
        />

        <label htmlFor="password">Password</label>
        <input
          className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600 text-black w-full"
          id="password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          placeholder="Password"
          type="password"
        />

        <label htmlFor="role">Role</label>
        <select
          className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600 text-black w-full"
          id="role"
          value={user.role}
          onChange={(e) => setUser({ ...user, role: e.target.value })}
        >
          <option value="student">Student</option>
          <option value="expert">Expert</option>
        </select>

        <button
          onClick={onSignUp}
          className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600 w-full"
          disabled={buttonDisabled || loading}
        >
          {loading ? "Processing..." : "Sign Up"}
        </button>
        <Link href="/login" className="text-blue-500 hover:underline">
          Already have an account? Log in
        </Link>
      </div>
    </div>
  );
}
