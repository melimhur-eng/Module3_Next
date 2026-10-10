"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Rendered into document.body with a portal, so it escapes the card that
// opened it (no clipping by overflow or stacking by z-index).
export default function Modal({ title, onClose, children }) {
  const dialogRef = useRef(null);
  // keep the latest onClose without re-running the effect on every render
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const opener = document.activeElement; // where focus goes back to
    const dialog = dialogRef.current;
    dialog.querySelector(FOCUSABLE)?.focus();

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;

      // trap focus: Tab from the last element goes to the first, and back
      const items = dialog.querySelectorAll(FOCUSABLE);
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      opener?.focus();
    };
  }, []);

  return createPortal(
    <div className="modal-backdrop" onClick={() => onCloseRef.current()}>
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title">{title}</h2>
        {children}
        <button className="modal-close" onClick={() => onCloseRef.current()}>
          Close
        </button>
      </div>
    </div>,
    document.body
  );
}

