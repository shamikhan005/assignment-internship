"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    username: "",
    password: "",
  });
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/users/login", user);
      const token = response.headers["authorization"]?.split(" ")[1];
      const { id, role, username } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("userId", id);
        localStorage.setItem("userRole", role);
        localStorage.setItem("username", username);
      }

      console.log("Login successful", response.data);

      /* Redirect based on user role */
      if (role === "student") {
        router.push("/student");
      } else if (role === "expert") {
        router.push("/expert");
      } else {
        router.push("/profile");
      }
    } catch (error: any) {
      console.log("Login failed", error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setButtonDisabled(user.username.length === 0 || user.password.length === 0);
  }, [user]);

  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gradient-to-r from-gradient-start to-gradient-end">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h1 className="text-2xl mb-4">Login</h1>
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
        <label htmlFor="password">Password</label>
        <input
          className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600 text-black w-full"
          id="password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          placeholder="Password"
          type="password"
        />
        <button
          onClick={onLogin}
          className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600 w-full"
          disabled={buttonDisabled || loading}
        >
          {loading ? "Processing..." : "Login"}
        </button>
        <Link href="/signup" className="text-blue-500 hover:underline">
        Don&apos;t have an account? Sign up
        </Link>
      </div>
    </div>
  );
}
