import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import HelpChat from "@/components/HelpChat";
import Providers from "@/components/Providers";
import { SITE_URL } from "@/lib/site";

// Downloaded at build time and served from this site: no request to Google,
// no render-blocking stylesheet, and a size-matched fallback so text does not jump.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

// Defaults for every page. Each page only supplies its own part of the title.
export const metadata = {
  // makes relative image paths in social previews absolute (needed by Telegram & co.)
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s · Addis Eats",
    default: "Addis Eats — food delivery in Addis Ababa",
  },
  description:
    "Order Doro Wat, Tibs, Kitfo and Shiro from Addis Eats. Delivery across Bole, Kazanchis, Megenagna and Piassa, paid with TeleBirr.",
  openGraph: {
    siteName: "Addis Eats",
    type: "website",
    locale: "en_ET",
  },
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
        {/* The help-chat widget is nice to have, not needed to order: its
            script loads only when someone taps "Need help?". */}
        <HelpChat />
      </body>
    </html>
  );
}
