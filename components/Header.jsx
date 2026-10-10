import Link from "next/link";
import CartBadge from "./CartBadge";
import NavLinks from "./NavLinks";

export default function Header() {
  return (
    <>
      <header className="site-header">
        <div>
          {/* the site name, not the page's subject: each page has its own h1 */}
          <p className="logo">
            <Link href="/">Addis Eats</Link>
          </p>
          <p>Order great food across Addis.</p>
        </div>
        <CartBadge />
      </header>
      <NavLinks />
    </>
  );
}
