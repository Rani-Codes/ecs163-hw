import "./globals.css";


export const metadata = {
  title: "Hw3",
  description: "ECS 163 Homework 3 project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
