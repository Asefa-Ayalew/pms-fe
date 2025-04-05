"use client";

import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";

export function AuthProfileHandler() {
  const { data: session } = useSession();

  useEffect(() => {
    // Check if there's a profileScript in the session
    const script = (session as any)?.profileScript;
    if (script) {
      // Execute the script to store profile in localStorage
      try {
        eval(script);
      } catch (error) {
        console.error("Error storing profile:", error);
      }
    }
  }, [session]);

  return null; // This component doesn't render anything
}
