"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { selectItems, selectTotal, useCartStore } from "@/lib/cartStore";
import Field from "./Field";
import { AREAS, validate } from "@/lib/validate";
import { placeOrder } from "./actions";

const FIELDS = ["name", "phone", "area", "notes"];

export default function Checkout({ defaultArea, defaultName }) {
  const items = useCartStore(selectItems);
  const total = useCartStore(selectTotal);
  const clear = useCartStore((s) => s.clear);

  const [form, setForm] = useState({ name: defaultName, phone: "", area: defaultArea, notes: "" });
  const [touched, setTouched] = useState({});
  const [edited, setEdited] = useState({}); // fields changed since the server last answered
  // isPending is true while the action runs: it disables the button (no double orders)
  const [state, formAction, isPending] = useActionState(placeOrder, {});
  const formRef = useRef(null);

  // the server's message for a field stops applying once that field is edited
  const serverErrors = Object.fromEntries(
    Object.entries(state.fieldErrors ?? {}).filter(([field]) => !edited[field])
  );
  const errors = { ...validate(form), ...serverErrors };
  const show = (field) => (touched[field] || serverErrors[field] ? errors[field] : undefined);

  // when the server answers: clear the cart on success, or focus the first bad field
  useEffect(() => {
    setEdited({});
    if (state.order) clear();
    if (state.fieldErrors) {
      const firstBad = FIELDS.find((f) => state.fieldErrors[f]);
      if (firstBad) formRef.current.elements[firstBad].focus();
    }
  }, [state, clear]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setEdited({ ...edited, [e.target.name]: true });
  }

  function handleBlur(e) {
    setTouched({ ...touched, [e.target.name]: true });
  }

  // runs before the action: stop and point at the problem if the form is not valid yet
  function handleSubmit(e) {
    setTouched({ name: true, phone: true, area: true, notes: true });
    const firstBad = FIELDS.find((f) => validate(form)[f]);
    if (firstBad) {
      e.preventDefault();
      formRef.current.elements[firstBad].focus();
    }
  }

  if (state.order) {
    const receipt = state.order;
    return (
      <section className="card">
        <h1>Order placed 🎉</h1>
        <p>
          Order <strong>{receipt.id}</strong> is on its way to {receipt.area}.
        </p>
        <p>
          You will pay <strong>{receipt.total} ETB</strong> with TeleBirr ({receipt.phone}).
        </p>
        <Link href={`/orders/${receipt.id}`}>Track your order</Link> ·{" "}
        <Link href="/menu">Order something else</Link>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section>
        <h1>Checkout</h1>
        <p className="empty">Your cart is empty.</p>
        <Link href="/menu">Browse the menu</Link>
      </section>
    );
  }

  return (
    <section>
      <h1>Checkout</h1>

      {(state.formError || state.fieldErrors?.items) && (
        <p className="error banner" role="alert">
          ⚠ {state.formError ?? state.fieldErrors.items}{" "}
          {state.formError && <Link href="/login?next=/checkout">Sign in</Link>}
        </p>
      )}

      <form
        ref={formRef}
        className="order-form"
        action={formAction}
        onSubmit={handleSubmit}
        noValidate
      >
        {/* only ids and quantities are sent; the server looks up the prices */}
        <input
          type="hidden"
          name="items"
          value={JSON.stringify(items.map(({ id, qty }) => ({ id, qty })))}
        />

        <Field id="name" label="Name" error={show("name")}>
          <input
            id="name"
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={!!show("name")}
            aria-describedby={show("name") ? "name-error" : undefined}
          />
        </Field>

        <Field id="phone" label="TeleBirr number" error={show("phone")}>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="0911223344"
            value={form.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={!!show("phone")}
            aria-describedby={show("phone") ? "phone-error" : undefined}
          />
        </Field>

        <Field id="area" label="Delivery area" error={show("area")}>
          <select
            id="area"
            name="area"
            value={form.area}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={!!show("area")}
            aria-describedby={show("area") ? "area-error" : undefined}
          >
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>

        <Field id="notes" label="Notes for the courier (optional)" error={show("notes")}>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={form.notes}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={!!show("notes")}
            aria-describedby={show("notes") ? "notes-error" : undefined}
          />
        </Field>

        <button type="submit" disabled={isPending}>
          {isPending ? "Placing order…" : `Place order · ${total} ETB`}
        </button>
      </form>
    </section>
  );
}
