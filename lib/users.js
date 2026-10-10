import "server-only";
import { scryptSync, timingSafeEqual } from "node:crypto";

// Demo accounts standing in for a users table. Only a salted scrypt hash of
// each password is stored — never the password itself. The demo passwords are
// listed in the README so the app can be tried out.
const users = [
  {
    id: "usr_almaz",
    name: "Almaz",
    phone: "0911000001",
    role: "customer",
    passwordHash:
      "94c26c1926e44ccb59380d88e46adc0f:11fac1c21993de8575a60362c73d910462e8ef016026fcd8e173ba0c252a71ba",
  },
  {
    id: "usr_dawit",
    name: "Dawit",
    phone: "0911000002",
    role: "customer",
    passwordHash:
      "a34b9ecf97476d54911525e2db1c3747:bead858b15f66c69fc44b221eb053f4c8f6c63a55615c8f7a64c455368871992",
  },
  {
    id: "usr_hana",
    name: "Hana",
    phone: "0911000003",
    role: "staff",
    passwordHash:
      "80936725e7c249faf96ca8bc2636d2b5:04df4d8fd3b6d2001e3d64f5f7ca9ae224dad21c7e7d65c2b573c8399cef4b12",
  },
];

function passwordMatches(password, stored) {
  const [salt, hash] = stored.split(":");
  const attempt = scryptSync(password, salt, 32);
  return timingSafeEqual(attempt, Buffer.from(hash, "hex"));
}

// Returns { id, name, role } for a correct phone and password, otherwise null.
export function checkCredentials(phone, password) {
  const user = users.find((u) => u.phone === phone.replace(/\s/g, ""));
  if (!user || !passwordMatches(password, user.passwordHash)) return null;
  return { id: user.id, name: user.name, role: user.role };
}
