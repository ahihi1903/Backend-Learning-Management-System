import { forwardRef, useId, useState } from "react";
import { EyeIcon, EyeOffIcon } from "../Icons.jsx";

export const Button = forwardRef(function Button({ children, className = "", variant = "primary", wide = false, loading = false, disabled, ...props }, ref) {
  const variantClass = variant === "ghost" ? "button-ghost" : variant === "secondary" ? "button-secondary" : "";
  return (
    <button
      className={`button ${variantClass} ${wide ? "button-wide" : ""} ${className}`.trim()}
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && <span className="button-loader" aria-hidden="true" />}
      {children}
    </button>
  );
});

export function FormField({ label, hint, error, id, className = "", ...inputProps }) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const descriptionId = `${fieldId}-description`;
  return (
    <label className={`form-field ${className}`.trim()} htmlFor={fieldId}>
      <span className="form-field-label">{label}</span>
      <input id={fieldId} aria-describedby={hint || error ? descriptionId : undefined} aria-invalid={Boolean(error)} {...inputProps} />
      {(hint || error) && <small id={descriptionId} className={error ? "form-field-error" : "form-field-hint"}>{error || hint}</small>}
    </label>
  );
}

export function PasswordField({ label = "Mật khẩu", hint, error, id, ...inputProps }) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const descriptionId = `${fieldId}-description`;
  const [visible, setVisible] = useState(false);

  return (
    <label className="form-field" htmlFor={fieldId}>
      <span className="form-field-label">{label}</span>
      <span className="password-control">
        <input id={fieldId} type={visible ? "text" : "password"} aria-describedby={hint || error ? descriptionId : undefined} aria-invalid={Boolean(error)} {...inputProps} />
        <button type="button" aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"} onClick={() => setVisible((current) => !current)}>
          {visible ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        </button>
      </span>
      {(hint || error) && <small id={descriptionId} className={error ? "form-field-error" : "form-field-hint"}>{error || hint}</small>}
    </label>
  );
}
