// One component renders every form in the registry (functions/forms-registry.js), in the hub and on the
// public website. It checks answers with the same rules the server applies, then calls `submitForm`.
import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../lib/firebase-functions";
import { fieldsFor, todayAtSchool, validateAnswers } from "../../../functions/forms-registry.js";

export const sendForm = (formId, answers) => httpsCallable(functions, "submitForm")({ formId, answers }).then((result) => result.data);

const longDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" });

// A rating grid: a table of radio buttons on wide screens; on phones each row shows its ratings as buttons.
function RatingGrid({ field, value = {}, error, onChange }) {
  const id = `form-${field.key}`;
  const set = (row, rating) => onChange({ ...value, [row]: rating });
  return <fieldset className="hub-field hub-field-wide hub-rating" aria-describedby={error ? `${id}-error` : undefined}>
    <legend>{field.label}{!field.required && <small className="hub-optional"> (optional)</small>}</legend>
    <table>
      <thead><tr><td />{field.scale.map((rating) => <th key={rating} scope="col">{rating}</th>)}</tr></thead>
      <tbody>{field.rows.map((row, index) => <tr key={row} className={error && !value[row] ? "is-missing" : undefined}>
        <th scope="row" id={`${id}-row-${index}`}>{row}</th>
        {field.scale.map((rating) => <td key={rating}><label>
          <input type="radio" name={`${id}-${index}`} value={rating} checked={value[row] === rating} onChange={() => set(row, rating)} aria-invalid={error && !value[row] ? "true" : undefined} aria-label={`${row}: ${rating}`} />
          <span aria-hidden="true">{rating}</span>
        </label></td>)}
      </tr>)}</tbody>
    </table>
    {error && <small id={`${id}-error`} className="hub-field-error">{error}</small>}
  </fieldset>;
}

// A typed signature: the full name, shown as it will be recorded, with the date it is signed.
function Signature({ field, value, error, onChange }) {
  const id = `form-${field.key}`;
  const name = typeof value === "object" && value ? value.name : value || "";
  return <div className="hub-field hub-field-wide hub-signature">
    <label htmlFor={id}>{field.label}</label>
    <input id={id} name={field.key} required={field.required} autoComplete="name" placeholder="Type your full name" maxLength={120} value={name} onChange={(event) => onChange(event.target.value)} aria-invalid={error ? "true" : undefined} aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`} />
    <div className="hub-signature-pad" aria-hidden="true"><span>{name.trim() || "\u00a0"}</span></div>
    <small id={`${id}-help`} className="hub-field-help">Typing your name here is your signature. Signed on {longDate(todayAtSchool())}.</small>
    {error && <small id={`${id}-error`} className="hub-field-error">{error}</small>}
  </div>;
}

function Field({ field, value, error, onChange, children: kids }) {
  if (field.type === "grid") return <RatingGrid field={field} value={value} error={error} onChange={onChange} />;
  if (field.type === "signature") return <Signature field={field} value={value} error={error} onChange={onChange} />;
  const id = `form-${field.key}`;
  const common = { id, name: field.key, required: field.required, "aria-invalid": error ? "true" : undefined, "aria-describedby": error ? `${id}-error` : undefined };
  const label = <span>{field.label}{!field.required && <small className="hub-optional"> (optional)</small>}</span>;
  let control;
  if (field.type === "checkbox") {
    return <div className="hub-field hub-field-wide"><label className="hub-check"><input type="checkbox" {...common} checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />{field.label}</label>{error && <small id={`${id}-error`} className="hub-field-error">{error}</small>}</div>;
  }
  if (field.type === "textarea") control = <textarea {...common} rows={5} maxLength={4000} value={value || ""} onChange={(event) => onChange(event.target.value)} />;
  else if (field.type === "select") control = <select {...common} value={value || ""} onChange={(event) => onChange(event.target.value)}><option value="">Choose…</option>{field.options.map((option) => <option key={option}>{option}</option>)}</select>;
  else if (field.type === "child") control = <select {...common} value={value || ""} onChange={(event) => onChange(event.target.value)}><option value="">{field.required ? "Choose…" : "Not about a particular child"}</option>{kids.map((child) => <option key={child.id} value={child.id}>{child.preferredName || child.name}</option>)}</select>;
  else control = <input {...common} type={{ email: "email", tel: "tel", url: "url", date: "date", time: "time", number: "number" }[field.type] || "text"} min={field.min} max={field.max} placeholder={field.placeholder} maxLength={field.type === "text" ? 300 : undefined} value={value ?? ""} onChange={(event) => onChange(event.target.value)} />;
  return <div className={`hub-field ${field.type === "textarea" ? "hub-field-wide" : ""}`}><label htmlFor={id}>{label}</label>{control}{error && <small id={`${id}-error`} className="hub-field-error">{error}</small>}</div>;
}

export function FormRunner({ form, childOptions = [], onSent, submitLabel = "Send" }) {
  const [values, setValues] = useState(() => (childOptions.length === 1 ? { studentId: childOptions[0].id } : {}));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const fields = fieldsFor(form);

  async function submit(event) {
    event.preventDefault();
    setFailure("");
    const check = validateAnswers(form, { ...values, website: undefined });
    setErrors(check.errors);
    if (!check.ok) { event.currentTarget.querySelector("[aria-invalid='true']")?.focus(); return; }
    setBusy(true);
    try {
      const result = await sendForm(form.id, { ...check.values, website: event.currentTarget.elements.website?.value || "" });
      onSent?.(result);
    } catch (error) {
      if (error.details?.errors) setErrors(error.details.errors);
      setFailure(error.code === "functions/unavailable" || error.code === "functions/internal" ? "We couldn't send that just now. Please try again in a moment, or contact the school office." : error.message);
    } finally {
      setBusy(false);
    }
  }

  return <form className="hub-form hub-form-wide hub-form-runner" onSubmit={submit} noValidate>
    {form.emergency && <p className="hub-emergency" role="note"><strong>Urgent?</strong> {form.emergency}</p>}
    {form.restrictedNote && <p className="hub-hint">Your answers are seen only by the people responsible for this kind of matter. Notification emails never include the details.</p>}
    <div className="hub-form-row">{fields.map((field) => <Field key={field.key} field={field} value={values[field.key]} error={errors[field.key]} onChange={(value) => setValues((current) => ({ ...current, [field.key]: value }))}>{childOptions}</Field>)}</div>
    {/* Spam trap: hidden from people and screen readers. */}
    <div className="hub-visually-hidden" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    {failure && <p className="hub-error" role="alert">{failure}</p>}
    <div className="hub-form-actions"><button className="hub-button" disabled={busy}>{busy ? "Sending…" : submitLabel}</button></div>
  </form>;
}
