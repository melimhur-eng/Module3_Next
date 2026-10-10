import "./globals.css";
import Header from "@/components/Header";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Addis Eats",
  description: "Order great food across Addis Ababa.",
};

// A server component: Providers is the only client piece, and it receives the
// rest of the page as children.
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <footer className="footer">© Addis Eats · Bole, Addis Ababa</footer>
        </Providers>
      </body>
    </html>
  );
}
