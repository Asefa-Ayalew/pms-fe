"use client";

import { getCurrentSession } from "@pms/auth";
import { useEffect } from "react";

export function AuthProfileHandler() {
  const { data: session } = getCurrentSession();

  useEffect(() => {
    const script = (session as any)?.profileScript;
    if (script) {
      try {
        eval(script);
      } catch (error) {
        console.error("Error storing profile:", error);
      }
    }
  }, [session]);

  return null;
}
