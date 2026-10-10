export const AREAS = ["Bole", "Kazanchis", "Megenagna", "Piassa"];

// 09XXXXXXXX or +2519XXXXXXXX
const TELEBIRR = /^(09\d{8}|\+2519\d{8})$/;

// Pure: takes the form, returns an errors object. No state, no side effects,
// so it can be called on every render and the errors are always up to date.
export function validate(form) {
  const errors = {};

  if (form.name.trim() === "") {
    errors.name = "Enter your name so the courier knows who to ask for.";
  } else if (form.name.trim().length < 2) {
    errors.name = "Your name needs at least 2 letters.";
  }

  const phone = form.phone.replace(/\s/g, "");
  if (phone === "") {
    errors.phone = "Enter the TeleBirr number you will pay with.";
  } else if (!TELEBIRR.test(phone)) {
    errors.phone = "Use 09XXXXXXXX or +2519XXXXXXXX.";
  }

  if (!AREAS.includes(form.area)) {
    errors.area = "Choose one of the areas we deliver to.";
  }

  if (form.notes.length > 200) {
    errors.notes = `Keep notes under 200 characters (now ${form.notes.length}).`;
  }

  return errors;
}
