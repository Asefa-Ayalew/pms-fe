"use client";

export const getCurrentSession = (): any | null => {
  if (typeof window === "undefined") {
    return null; // Prevents error on server
  }

  const stored = localStorage.getItem("usersInfo");
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to parse session:", error);
    return null;
  }
};
