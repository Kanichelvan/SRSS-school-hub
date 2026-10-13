// Consent: the parent's one page per child (Parental Consent policy §9–§14) and the staff
// confidentiality acknowledgement (framework Part V). Records are append-only; a change is a new record.
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { doc, getDoc, serverTimestamp, setDoc, writeBatch, collection } from "firebase/firestore";
import { db } from "../../lib/firebase-firestore";
import { useAuth } from "../../auth/AuthProvider";
import { consentItems, getMany, today, useLoad } from "../data";
import { ACKNOWLEDGEMENT, CONSENT_FORM_VERSION, consentQuestion, formVersionLabel, isCurrent, responseFor } from "../consentForm";
import { EmptyState, ErrorNote, Loading, PageHeader, formatDate } from "../ui";

const answerFrom = (response) => (response === "granted" ? "yes" : response === "declined" || response === "withdrawn" ? "no" : "");

// `office` mode records the answers from a signed paper form, for families without a hub account.
export function ChildConsent({ child, items, status, guardian, office = false, onSaved }) {
  const auth = useAuth();
  const name = child.preferredName || child.name?.split(" ")[0] || "your child";
  const initial = useMemo(() => Object.fromEntries(items.map((item) => [item.type, isCurrent(status?.[item.type], item) ? answerFrom(status[item.type].response) : ""])), [status, items]);
  const [answers, setAnswers] = useState(initial);
  const [acknowledged, setAcknowledged] = useState(false);
  const [paperName, setPaperName] = useState("");
  const [state, setState] = useState({ busy: false, saved: false, error: null });
  useEffect(() => setAnswers(initial), [initial]);

  const unanswered = items.filter((item) => !answers[item.type]);
  const changed = items.filter((item) => answers[item.type] && answers[item.type] !== initial[item.type]);
  const lastUpdated = Math.max(0, ...Object.values(status || {}).map((entry) => Number(entry.at) || 0)) || null;

  async function save(event) {
    event.preventDefault();
    if (unanswered.length || !acknowledged || (office && !paperName.trim())) return;
    setState({ busy: true, saved: false, error: null });
    try {
      const batch = writeBatch(db);
      const base = { studentId: child.id, classId: child.currentClassId || "", definitionVersion: CONSENT_FORM_VERSION, choice: null, effectiveFrom: today(), createdAt: serverTimestamp(), createdBy: auth.user.uid,
        ...(office ? { guardianUid: null, guardianName: paperName.trim(), recordedBy: auth.user.uid, source: "paperForm" } : { guardianUid: auth.user.uid, source: "parentPortal" }) };
      for (const item of changed) {
        batch.set(doc(collection(db, "consentRecords")), { ...base, consentType: item.type, definitionId: item.type, definitionVersion: item.version ?? CONSENT_FORM_VERSION, response: responseFor(answers[item.type], status?.[item.type]?.response) });
      }
      batch.set(doc(collection(db, "consentRecords")), { ...base, consentType: ACKNOWLEDGEMENT.type, definitionId: ACKNOWLEDGEMENT.type, response: "granted" });
      await batch.commit();
      setAcknowledged(false);
      setState({ busy: false, saved: true, error: null });
      onSaved(child.id, Object.fromEntries(items.map((item) => [item.type, { response: responseFor(answers[item.type], status?.[item.type]?.response), version: item.version ?? CONSENT_FORM_VERSION, at: Date.now() }])));
    } catch (reason) {
      setState({ busy: false, saved: false, error: reason.code === "permission-denied" ? (office ? "Your role can’t record consent. Ask the school office or the privacy steward." : "Your account isn’t linked to this child yet. Please contact the school office.") : "Your choices couldn’t be saved. Check your connection and try again." });
    }
  }

  return (
    <form className="hub-consent-child" id={`child-${child.id}`} onSubmit={save} aria-labelledby={`consent-${child.id}`}>
      <header>
        <div><h2 id={`consent-${child.id}`}>{child.name}</h2><p>{[child.currentStandard && `Standard ${child.currentStandard}`, child.studentNumber && `Student no. ${child.studentNumber}`].filter(Boolean).join(" · ")}</p></div>
        <dl>{!office && <div><dt>Parent or guardian</dt><dd>{guardian}</dd></div>}{lastUpdated && <div><dt>Last updated</dt><dd>{formatDate(lastUpdated, { day: "numeric", month: "short", year: "numeric" })}</dd></div>}</dl>
      </header>
      <ol className="hub-consent-items">
        {items.map((item) => (
          <li key={item.type}>
            <fieldset>
              <legend><strong>{item.title}</strong><span>{consentQuestion(item, name)}</span></legend>
              <p>{item.detail} <a href={item.policy} target="_blank" rel="noreferrer">More about this</a></p>
              <div className="hub-yesno">
                {[["yes", "Yes"], ["no", "No"]].map(([value, label]) => <label key={value} className={answers[item.type] === value ? `is-${value}` : ""}><input type="radio" name={`${child.id}-${item.type}`} value={value} checked={answers[item.type] === value} onChange={() => { setAnswers({ ...answers, [item.type]: value }); setState({ busy: false, saved: false, error: null }); }} />{label}</label>)}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>
      {office && <label className="hub-paper-name">Parent or guardian who signed the paper form<input required value={paperName} onChange={(event) => setPaperName(event.target.value)} autoComplete="off" /></label>}
      <label className="hub-check hub-consent-ack"><input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} />{office
        ? <span>I have the paper form signed by {name}’s parent or legal guardian, and the answers above match it.</span>
        : <span>I am {name}’s parent or legal guardian, and I have read the <a href="/legal/terms" target="_blank" rel="noreferrer">Terms of Use</a> and <a href="/legal/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</span>}</label>
      <div className="hub-form-actions">
        <button type="submit" className="hub-button" disabled={state.busy || unanswered.length > 0 || !acknowledged || (office && !paperName.trim())}>{state.busy ? "Saving…" : office ? "Save paper answers" : `Save ${name}’s choices`}</button>
        {unanswered.length > 0 && <span className="hub-hint">{unanswered.length === 1 ? "1 choice left to answer." : `${unanswered.length} choices left to answer.`}</span>}
        {!unanswered.length && !acknowledged && <span className="hub-hint">Tick the box above to save.</span>}
      </div>
      {state.saved && <p className="hub-status" role="status">{office ? "Saved. The paper form can be filed with the pupil’s records." : "Saved. You can change these choices at any time."}</p>}
      {state.error && <p className="hub-error" role="alert">{state.error}</p>}
    </form>
  );
}

export function ParentConsent() {
  const auth = useAuth();
  const childIds = auth.scope?.childIds || [];
  const [params] = useSearchParams();
  const [overrides, setOverrides] = useState({});
  const { data, loading, error } = useLoad(async () => {
    const [children, statuses, items] = await Promise.all([getMany("students", childIds), getMany("studentConsentStatus", childIds), consentItems()]);
    return { items, children: children.sort((a, b) => (b.currentStandard || 0) - (a.currentStandard || 0)), statuses: Object.fromEntries(statuses.map((status) => [status.id, status.types || {}])) };
  }, [childIds.join("|")]);
  useEffect(() => { const id = params.get("student"); if (data && id) document.getElementById(`child-${id}`)?.scrollIntoView(); }, [data, params]);
  const guardian = auth.user.displayName || auth.user.email;

  return <>
    <PageHeader kicker="My family" title="Consent choices">A few yes or no questions for each child. Saying no will never stop your child taking part in lessons or school activities, and you can change your answers at any time.</PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : !data.children.length ? <EmptyState title="No children are linked to this account yet.">Please contact the school office to link your account.</EmptyState> : <>
      {data.children.map((child) => <ChildConsent key={child.id} child={child} items={data.items} guardian={guardian} status={{ ...data.statuses[child.id], ...overrides[child.id] }} onSaved={(id, types) => setOverrides((current) => ({ ...current, [id]: types }))} />)}
      <p className="hub-hint hub-consent-note">The School will always ask you separately before sharing anything with outside organisations or news media, and before any use not listed here. Read more in the <a href="/legal/media-consent" target="_blank" rel="noreferrer">Photography, Video, Student Work & Media Consent Policy</a> and the <a href="/legal/parental-consent" target="_blank" rel="noreferrer">Parental Consent Policy</a>.</p>
    </>}
  </>;
}

// Staff confidentiality and acceptable-use acknowledgement (framework Part V), asked once per version.
export const STAFF_ACK_VERSION = 1;
const STAFF_ROLES = ["teacher", "classTeacher", "specialistTeacher", "academicCoordinator", "schoolAdmin", "admissionsOfficer", "financeOfficer", "leadership", "safeguardingLead", "privacySteward", "portfolioModerator", "contentEditor", "technicalAdmin", "librarian", "auditor"];

export function StaffAcknowledgement() {
  const auth = useAuth();
  const isStaff = auth.roles.some((role) => STAFF_ROLES.includes(role));
  const [state, setState] = useState("checking");
  useEffect(() => {
    if (!isStaff) return;
    getDoc(doc(db, "policyAcknowledgements", auth.user.uid))
      .then((snap) => setState(snap.exists() && snap.data().version >= STAFF_ACK_VERSION ? "done" : "needed"))
      .catch(() => setState("done")); // never block work if the check itself fails
  }, [isStaff, auth.user.uid]);
  if (!isStaff || state !== "needed" && state !== "saving" && state !== "error") return null;

  async function confirm() {
    setState("saving");
    try { await setDoc(doc(db, "policyAcknowledgements", auth.user.uid), { uid: auth.user.uid, version: STAFF_ACK_VERSION, acknowledgedAt: serverTimestamp() }); setState("done"); }
    catch { setState("error"); }
  }
  return (
    <section className="hub-staff-ack" aria-labelledby="staff-ack-title">
      <h2 id="staff-ack-title">Before you continue: confidentiality and safe use</h2>
      <ul>
        <li>I will keep pupil, family and staff information confidential and look only at what my role needs.</li>
        <li>I will use approved school channels to communicate with pupils and families, and keep professional boundaries.</li>
        <li>I will report any safeguarding concern to the Designated Safeguarding Lead without delay.</li>
      </ul>
      <p>See the <a href="/legal/terms" target="_blank" rel="noreferrer">Terms of Use</a>, <a href="/legal/data-protection-retention" target="_blank" rel="noreferrer">Data Protection Policy</a> and <a href="/legal/child-safeguarding" target="_blank" rel="noreferrer">Child Protection & Safeguarding Policy</a>.</p>
      <button type="button" className="hub-button" disabled={state === "saving"} onClick={confirm}>{state === "saving" ? "Saving…" : "I agree"}</button>
      {state === "error" && <p className="hub-error" role="alert">That didn’t save. Please try again.</p>}
    </section>
  );
}

// Printable paper form for families without a hub account (Accessibility policy §5). Pre-filled when a pupil is given.
export function ConsentPrint() {
  const { studentId } = useParams();
  const { data } = useLoad(async () => ({ child: studentId ? (await getMany("students", [studentId]))[0] || null : null, items: await consentItems() }), [studentId]);
  const child = data?.child;
  const items = data?.items || [];
  const name = child ? child.preferredName || child.name?.split(" ")[0] : null;
  return (
    <div className="hub-print-form">
      <p className="hub-print-actions"><button type="button" className="hub-button" onClick={() => window.print()}>Print this form</button> <Link to="/hub/admin/consent">Back to consent</Link></p>
      <article>
        <header><img src="/assets/srss-logo.png" alt="" /><div><strong>Sekolah Rendah Sathya Sai</strong><span>Consent choices · form version {formVersionLabel(items)}</span></div></header>
        <p>Please answer each question, sign below and return this form to the school office. Saying no will never stop your child taking part in lessons or school activities. You can change your answers at any time by contacting the office or through the Parents Hub.</p>
        <dl><div><dt>Child’s name</dt><dd>{child?.name || ""}</dd></div><div><dt>Standard / class</dt><dd>{child?.currentStandard ? `Standard ${child.currentStandard}` : ""}</dd></div></dl>
        <ol>{items.map((item) => <li key={item.type}><strong>{item.title}</strong><span>{consentQuestion(item, name)}</span><small>{item.detail}</small><em>☐ Yes &nbsp;&nbsp; ☐ No</em></li>)}</ol>
        <p>I am this child’s parent or legal guardian, and I have read the Terms of Use and Privacy Policy at {window.location.host}/legal, or on request from the office.</p>
        <dl className="hub-print-sign"><div><dt>Parent or guardian name</dt><dd /></div><div><dt>Signature</dt><dd /></div><div><dt>Date</dt><dd /></div></dl>
        <footer>The School will always ask separately before sharing anything with outside organisations or news media. Questions: +60 12-600 1926 · saischoolpuchong@gmail.com</footer>
      </article>
    </div>
  );
}
