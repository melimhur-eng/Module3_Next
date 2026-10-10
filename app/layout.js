import { Poppins } from "next/font/google";
import Script from "next/script";
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
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <footer className="footer">© Addis Eats · Bole, Addis Ababa</footer>
        </Providers>
        {/* The help-chat widget is nice to have, not needed to order: load it
            only once the page is idle, so it never competes with the menu. */}
        <Script src="/chat-widget.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
