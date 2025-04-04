import type { Metadata } from "next";
import "./globals.css";
import MantineProviderRegistry from "./mantine";
import { Shell } from "@pms/core";
import { AuthProvider } from "@pms/auth";

export const metadata: Metadata = {
  title: "Training Center",
  description: "Training Center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="dark:bg-black dark:text-white">
        <MantineProviderRegistry>
          <AuthProvider>
            <Shell>{children}</Shell>
          </AuthProvider>
        </MantineProviderRegistry>
      </body>
    </html>
  );
}
