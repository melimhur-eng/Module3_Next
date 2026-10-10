import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Providers from "@/components/Providers";

// Downloaded at build time and served from this site: no request to Google,
// no render-blocking stylesheet, and a size-matched fallback so text does not jump.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata = {
  title: "Addis Eats",
  description: "Order great food across Addis Ababa.",
};

// A server component: Providers is the only client piece, and it receives the
// rest of the page as children.
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <script src="/chat-widget.js" async></script>
      </head>
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
