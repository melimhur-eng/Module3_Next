"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { selectItems, selectTotal, useCartStore } from "@/lib/cartStore";
import Field from "./Field";
import { AREAS, validate } from "./validate";
import { placeOrder } from "@/lib/orders";

const FIELDS = ["name", "phone", "area", "notes"];

export default function Checkout({ defaultArea }) {
  const items = useCartStore(selectItems);
  const total = useCartStore(selectTotal);
  const clear = useCartStore((s) => s.clear);

  const [form, setForm] = useState({ name: "", phone: "", area: defaultArea, notes: "" });
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | failed | succeeded
  const [receipt, setReceipt] = useState(null);
  const [failure, setFailure] = useState(null);
  const formRef = useRef(null);
  const failureRef = useRef(null);

  // derived on every render, never stored
  const errors = validate(form);
  const show = (field) => (touched[field] ? errors[field] : undefined);

  // the failure message only exists after this render, so focus it in an effect
  useEffect(() => {
    if (status === "failed") failureRef.current.focus();
  }, [status]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleBlur(e) {
    setTouched({ ...touched, [e.target.name]: true });
  }

  async function handleSubmit(e) {
    e.preventDefault(); // no page reload
    if (status === "submitting") return; // no double order

    // reveal every error, then send focus to the first field that is wrong
    setTouched({ name: true, phone: true, area: true, notes: true });
    const firstBad = FIELDS.find((f) => errors[f]);
    if (firstBad) {
      formRef.current.elements[firstBad].focus();
      return;
    }

    setStatus("submitting");
    setFailure(null);
    try {
      const placed = await placeOrder({ ...form, items, total });
      // remember the area so the next checkout starts with it
      document.cookie = `addis-eats-area=${form.area}; path=/; max-age=31536000`;
      setReceipt(placed);
      setStatus("succeeded");
      clear();
    } catch (err) {
      // never clear the form on failure: every value stays where it was
      setFailure(err.message);
      setStatus("failed");
    }
  }

  if (status === "succeeded") {
    return (
      <section className="card">
        <h2>Order placed 🎉</h2>
        <p>
          Order <strong>{receipt.id}</strong> is on its way to {receipt.area}.
        </p>
        <p>
          You will pay <strong>{receipt.total} ETB</strong> with TeleBirr ({receipt.phone}).
        </p>
        <Link href="/menu">Order something else</Link>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section>
        <h2>Checkout</h2>
        <p className="empty">Your cart is empty.</p>
        <Link href="/menu">Browse the menu</Link>
      </section>
    );
  }

  return (
    <section>
      <h2>Checkout</h2>

      {failure && (
        <p ref={failureRef} tabIndex={-1} className="error banner" role="alert">
          ⚠ {failure}
        </p>
      )}

      <form ref={formRef} className="order-form" onSubmit={handleSubmit} noValidate>
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

        <button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Placing order…" : `Place order · ${total} ETB`}
        </button>
      </form>
    </section>
  );
}
