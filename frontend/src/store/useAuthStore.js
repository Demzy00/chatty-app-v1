import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

console.log(axiosInstance);

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLogging: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      console.log(res);
      set({ authUser: res.data });
    } catch (error) {
      console.log("Error in authCheck:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      console.log(res.data);
      set({ authUser: res.data.user });

      //
      toast.success("Signup successful! Welcome to Chatty App.");
    } catch (error) {
      toast.error(error.response.data.message || "Failed to signup");
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (data) => {
    set({ isLogging: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      console.log(res.data);
      set({ authUser: res.data.user });

      //
      toast.success("Login successful! Welcome back to Chatty App.");
    } catch (error) {
      toast.error(error.response.data.message || "Failed to login");
    } finally {
      set({ isLogging: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
      console.log("Logout error:", error);
    }
  },
}));
