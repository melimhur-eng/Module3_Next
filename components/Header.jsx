import Link from "next/link";
import CartBadge from "./CartBadge";
import NavLinks from "./NavLinks";

export default function Header() {
  return (
    <>
      <header className="site-header">
        <div>
          <h1>
            <Link href="/">Addis Eats</Link>
          </h1>
          <p>Order great food across Addis.</p>
        </div>
        <CartBadge />
      </header>
      <NavLinks />
    </>
  );
}
