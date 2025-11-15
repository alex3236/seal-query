import "@/app/globals.css";
import React from "react";
import Logo from "@/components/Logo";

export const metadata = {
  title: "Seal Sticker Query",
  description: "Query Alex3236.moe Seal Stickers"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <body>
        <div className="min-h-screen dark:bg-gray-900 p-6">
          <div className="container mx-auto bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-xl">
            {children}
            <div className="mt-8 flex justify-center">
              <Logo className="w-48 fill-current text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}