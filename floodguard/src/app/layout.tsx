import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <nav className="flex gap-4 p-4 bg-gray-200">
          <Link href="/">Home</Link>
          <Link href="/login">Login</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/users/1">User 1</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
