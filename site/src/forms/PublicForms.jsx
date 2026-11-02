// Public forms on the school website (/forms and /forms/<id>): the registry's "public" forms, sent to the
// Forms & Response Centre through the submitForm Cloud Function. No sign-in; the reply comes by email.
import { useState } from "react";
import { CATEGORIES, FORM, FORMS } from "../../functions/forms-registry.js";
import { FormRunner } from "../hub/forms/FormRunner";
import "../hub/hub.css";

const PUBLIC = FORMS.filter((form) => form.availability === "public");

export function PublicForms() {
  const id = window.location.pathname.split("/")[2] || "";
  const form = FORM[id.toUpperCase()];
  const [sent, setSent] = useState(null);
  document.title = form ? `${form.title} · SRSS` : "Forms · SRSS";
  return <div className="hub-signin hub-public-forms">
    <header><a href="/">← Return to SRSS</a><a href="/" className="hub-brand" aria-label="Sekolah Rendah Sathya Sai · go to the school homepage"><img src="/assets/srss-logo.png" alt="" /><strong>Sekolah Rendah Sathya Sai</strong></a></header>
    <main id="main">
      {form?.availability === "public" ? <section aria-labelledby="form-title">
        <p className="hub-kicker">{CATEGORIES[form.category].name}</p>
        <h1 id="form-title">{form.title}</h1>
        {sent ? <div className="hub-form-sent" role="status">
          <h2>Thank you — we've received it.</h2>
          <p>Your reference number is <strong>{sent.reference}</strong>. We've emailed you a copy, and the right person at school will contact you.</p>
          <p><a href="/forms">Send another form</a> · <a href="/">Back to the school website</a></p>
        </div> : <>
          <p>{form.intro}</p>
          <FormRunner form={form} onSent={setSent} />
          <p className="hub-hint">We use your details only to respond to this submission. See our <a href="/legal/privacy">Privacy Policy</a>.</p>
        </>}
      </section> : <section aria-labelledby="forms-title">
        <p className="hub-kicker">Sekolah Rendah Sathya Sai</p>
        <h1 id="forms-title">Forms</h1>
        <p>{id ? "That form isn't available online. Choose one below or contact the school office." : "Send these to the school without signing in. Parents, staff and pupils with a hub account will find more forms under My requests & forms."}</p>
        <ul className="hub-list hub-public-form-list">{PUBLIC.map((item) => <li key={item.id}><a href={`/forms/${item.id}`}><strong>{item.title}</strong></a><p>{item.intro}</p></li>)}</ul>
        <p><a href="/resources/contact">Contact the school office</a> · <a href="/login">Sign in to the hub</a></p>
      </section>}
    </main>
  </div>;
}
