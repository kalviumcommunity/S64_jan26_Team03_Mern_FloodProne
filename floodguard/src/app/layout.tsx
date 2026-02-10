import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";
import ThemeToggle from "@/components/ui/ThemeToggle";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <UIProvider>
            {children}
            <ThemeToggle />
            <Toaster position="top-right" />
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
