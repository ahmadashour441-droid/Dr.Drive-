import "./globals.css";

export const metadata = {
  title: "Dr.Driveوصلني الآن",
  description: "Captain Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-100">
        {children}
      </body>
    </html>
  );
}