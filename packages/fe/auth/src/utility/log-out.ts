import { signOut } from "@/auth";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";

const handleLogout = async (accessToken?: string) => {
  try {
    // If we have an access token, call the backend logout endpoint
    if (accessToken) {
      await fetch(`${process.env.NEXT_PUBLIC_APP_API}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }).catch(() => {}); // Silently fail if logout API fails
    }

    // Perform client-side sign out
    await signOut({
      redirect: false,
    });

    // Show success notification
    notifications.show({
      title: "Logout successful",
      message: "You have been logged out",
      color: "green",
    });

    modals.closeAll();

    return true;
  } catch (error) {
    console.error("Logout error:", error);
    modals.closeAll();
    notifications.show({
      title: "Logout failed",
      message: "Please try again later",
      color: "red",
    });
    return false;
  }
};
export default  handleLogout