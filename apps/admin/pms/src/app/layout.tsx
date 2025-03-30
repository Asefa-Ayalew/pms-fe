import type { Metadata } from "next";
import "./globals.css";
import MantineProviderRegistry from "./mantine";
import { Shell } from "@pms/core";

export const metadata: Metadata = {
  title: "PMS",
  description: "property Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MantineProviderRegistry>
          <Shell>{children}</Shell>
        </MantineProviderRegistry>{" "}
      </body>
    </html>
  );
}
