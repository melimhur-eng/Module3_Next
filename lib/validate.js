export const AREAS = ["Bole", "Kazanchis", "Megenagna", "Piassa"];

// 09XXXXXXXX or +2519XXXXXXXX
const TELEBIRR = /^(09\d{8}|\+2519\d{8})$/;

// Shared by the checkout form (live errors in the browser) and the server
// (POST /api/orders and the placeOrder action), so the rules exist once.
//
// Pure: takes the form, returns an errors object. No state, no side effects,
// so it can be called on every render and the errors are always up to date.
export function validate(form) {
  const errors = {};

  // the server may receive anything, so treat non-strings as empty
  const text = (value) => (typeof value === "string" ? value : "");
  const name = text(form.name);
  const notes = text(form.notes);

  if (name.trim() === "") {
    errors.name = "Enter your name so the courier knows who to ask for.";
  } else if (name.trim().length < 2) {
    errors.name = "Your name needs at least 2 letters.";
  }

  const phone = text(form.phone).replace(/\s/g, "");
  if (phone === "") {
    errors.phone = "Enter the TeleBirr number you will pay with.";
  } else if (!TELEBIRR.test(phone)) {
    errors.phone = "Use 09XXXXXXXX or +2519XXXXXXXX.";
  }

  if (!AREAS.includes(form.area)) {
    errors.area = "Choose one of the areas we deliver to.";
  }

  if (notes.length > 200) {
    errors.notes = `Keep notes under 200 characters (now ${notes.length}).`;
  }

  return errors;
}
