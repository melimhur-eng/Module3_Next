// A label, the control passed as children, and its error message.
// The control itself sets aria-invalid and aria-describedby={`${id}-error`}.
export default function Field({ id, label, error, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && (
        <p id={`${id}-error`} className="error" role="alert">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}
