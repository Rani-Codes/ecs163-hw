import "./globals.css";


export const metadata = {
  title: "Hw2",
  description: "ECS 163 Homework 2 project",
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
