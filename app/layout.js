import "./globals.css";
import Header from "@/components/Header";
import CartHydration from "@/components/CartHydration";

export const metadata = {
  title: "Addis Eats",
  description: "Order great food across Addis Ababa.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartHydration />
        <Header />
        <main>{children}</main>
        <footer className="footer">© Addis Eats · Bole, Addis Ababa</footer>
      </body>
    </html>
  );
}
