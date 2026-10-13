// Shared hub components (PRD §59 design component library): stat card, status badge, empty state,
// last-updated line, data table, child switcher, Actions Required.
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export function PageHeader({ kicker, title, children, actions }) {
  return <header className="hub-page-head"><div><p className="hub-kicker">{kicker}</p><h1>{title}</h1>{children && <p className="hub-lede">{children}</p>}</div>{actions && <div className="hub-page-actions">{actions}</div>}</header>;
}

export function Section({ title, action, children, className = "" }) {
  return <section className={`hub-section ${className}`}><div className="hub-section-head"><h2>{title}</h2>{action}</div>{children}</section>;
}

export function StatCard({ label, value, detail, tone = "neutral", to }) {
  const body = <><span className="hub-stat-label">{label}</span><strong className="hub-stat-value">{value ?? "—"}</strong>{detail && <span className="hub-stat-detail">{detail}</span>}</>;
  return to ? <Link className={`hub-stat hub-tone-${tone}`} to={to}>{body}</Link> : <div className={`hub-stat hub-tone-${tone}`}>{body}</div>;
}

const BADGE_TONES = { scheduled: "info", transferred: "neutral", completed: "neutral", disabled: "bad", excused: "info", returned: "warn", submitted: "good", present: "good", published: "good", granted: "good", active: "good", approved: "good", complete: "good", missing: "warn", open: "info", pending: "warn", late: "warn", review: "info", underReview: "info", absent: "bad", declined: "bad", withdrawn: "bad", overdue: "bad", new: "info", handled: "good" };
const LABELS = { family: "Parent-visible", internal: "Internal", scheduled: "Scheduled", transferred: "Moved class", disabled: "Disabled", submitted: "Submitted", missing: "Not submitted", open: "In progress", underReview: "Under review", showcaseCandidate: "Showcase candidate", publicShowcase: "Public showcase", visitBooked: "Visit booked", review: "In review", draft: "Draft", archived: "Archived", handled: "Handled" };
export function StatusBadge({ status, label }) {
  // Text always accompanies colour — no colour-only status (PRD §54).
  return <span className={`hub-badge hub-tone-${BADGE_TONES[status] || "neutral"}`}>{label || LABELS[status] || String(status ?? "").replace(/^\w/, (c) => c.toUpperCase())}</span>;
}

export function EmptyState({ title, children }) {
  return <div className="hub-empty"><strong>{title}</strong>{children && <p>{children}</p>}</div>;
}

export function Loading({ label = "Loading…" }) { return <div className="hub-inline-loading" role="status">{label}</div>; }
export function ErrorNote({ error }) {
  if (!error) return null;
  const denied = error.code === "permission-denied";
  return <p className="hub-error" role="alert">{denied ? "You don't have access to this information." : "Something went wrong loading this section. Please try again."}</p>;
}

const fmt = new Intl.DateTimeFormat("en-MY", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
export const asDate = (value) => (value?.toDate ? value.toDate() : value ? new Date(value) : null);
export const formatDate = (value, options = { day: "numeric", month: "short" }) => { const date = asDate(value); return date && !Number.isNaN(date) ? new Intl.DateTimeFormat("en-MY", options).format(date) : "—"; };

// PRD §42 / srss "Last updated should be everywhere it matters".
export function LastUpdated({ record, people = {} }) {
  const at = asDate(record?.updatedAt);
  if (!at) return null;
  const who = people[record.updatedBy] || (record.updatedBy === "seed-script" ? "data import" : "school staff");
  return <p className="hub-updated">Last updated {fmt.format(at)} by {who}</p>;
}

// Data table: search, filters, sortable columns, pagination, CSV export (PRD §59 Data components).
export function DataTable({ columns, rows, searchKeys = [], filters = [], initialFilters = {}, pageSize = 15, exportName, onRowClick, rowHref, empty = "No records match.", initialSort }) {
  const [term, setTerm] = useState("");
  const [values, setValues] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort || { key: columns[0]?.key, dir: 1 });
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return rows
      .filter((row) => !needle || searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(needle)))
      .filter((row) => filters.every((filter) => !values[filter.key] || String(filter.value ? filter.value(row) : row[filter.key]) === values[filter.key]))
      .sort((a, b) => {
        const column = columns.find((item) => item.key === sort.key);
        const va = column?.sortValue ? column.sortValue(a) : a[sort.key];
        const vb = column?.sortValue ? column.sortValue(b) : b[sort.key];
        return (va > vb ? 1 : va < vb ? -1 : 0) * sort.dir;
      });
  }, [rows, term, values, sort, columns, filters, searchKeys]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice(page * pageSize, page * pageSize + pageSize);

  function exportCsv() {
    const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const lines = [columns.map((column) => escape(column.label)).join(","), ...filtered.map((row) => columns.map((column) => escape(column.csv ? column.csv(row) : row[column.key])).join(","))];
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    link.download = `${exportName || "export"}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return <div className="hub-table-wrap">
    <div className="hub-filterbar" role="search">
      {searchKeys.length > 0 && <label className="hub-search"><span className="hub-visually-hidden">Search</span><input type="search" placeholder="Search…" value={term} onChange={(event) => { setTerm(event.target.value); setPage(0); }} /></label>}
      {filters.map((filter) => <label key={filter.key}><span className="hub-visually-hidden">{filter.label}</span><select value={values[filter.key] || ""} onChange={(event) => { setValues({ ...values, [filter.key]: event.target.value }); setPage(0); }}><option value="">{filter.label}: all</option>{filter.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>)}
      <span className="hub-count">{filtered.length} {filtered.length === 1 ? "record" : "records"}</span>
      {exportName && <button type="button" className="hub-button hub-button-quiet hub-button-small" onClick={exportCsv}>Export CSV</button>}
    </div>
    {filtered.length === 0 ? <EmptyState title={empty} /> : <div className="hub-table-scroll"><table className="hub-table">
      <thead><tr>{columns.map((column) => <th key={column.key} scope="col" aria-sort={sort.key === column.key ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>{column.sortable === false ? column.label : <button type="button" onClick={() => setSort({ key: column.key, dir: sort.key === column.key ? -sort.dir : 1 })}>{column.label}{sort.key === column.key ? (sort.dir === 1 ? " ↑" : " ↓") : ""}</button>}</th>)}</tr></thead>
      <tbody>{visible.map((row) => <tr key={row.id} className={onRowClick || rowHref ? "hub-row-link" : ""} onClick={onRowClick ? () => onRowClick(row) : undefined}>{columns.map((column, index) => <td key={column.key} data-label={column.label}>{index === 0 && rowHref ? <Link to={rowHref(row)}>{column.render ? column.render(row) : row[column.key]}</Link> : column.render ? column.render(row) : row[column.key]}</td>)}</tr>)}</tbody>
    </table></div>}
    {pages > 1 && <nav className="hub-pagination" aria-label="Pagination"><button type="button" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page + 1} of {pages}</span><button type="button" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Next</button></nav>}
  </div>;
}

// Child switcher for multi-child families (PRD §14).
export function ChildSwitcher({ children, selectedId, onSelect }) {
  if (children.length <= 1) return null;
  return <div className="hub-child-switcher" role="tablist" aria-label="Choose a child">{children.map((child) => <button key={child.id} type="button" role="tab" aria-selected={child.id === selectedId} className={child.id === selectedId ? "active" : ""} onClick={() => onSelect(child.id)}><strong>{child.preferredName || child.name}</strong><span>Standard {child.currentStandard ?? "—"}</span></button>)}</div>;
}

// Actions Required (DASH-001): sits above announcements and routes straight to the action.
const ACTION_ICONS = { consent: "Consent", form: "Form", payment: "Payment", meeting: "Meeting" };
export function ActionsRequired({ actions, loading }) {
  return <section className="hub-actions" aria-labelledby="actions-title">
    <div className="hub-section-head"><h2 id="actions-title">Actions required</h2><span className="hub-actions-count">{loading ? "…" : actions.length}</span></div>
    {loading ? <Loading /> : actions.length === 0 ? <EmptyState title="You're all caught up.">Nothing needs your attention right now.</EmptyState> : <ul>{actions.map((action, index) => <li key={`${action.kind}-${action.studentId}-${index}`}><Link to={action.to}><span className={`hub-action-kind hub-kind-${action.kind}`}>{ACTION_ICONS[action.kind] || "Action"}</span><span className="hub-action-text"><strong>{action.title}</strong><small>{[action.childName, action.detail, action.dueDate ? `due ${formatDate(action.dueDate)}` : null].filter(Boolean).join(" · ")}</small></span>{action.overdue && <StatusBadge status="overdue" />}<span aria-hidden="true">→</span></Link></li>)}</ul>}
  </section>;
}

// Minimal inline bar chart for trends (answers a question, not decoration — PRD §12).
export function TrendBars({ points, format = (v) => `${v}%`, label }) {
  const max = Math.max(100, ...points.map((point) => point.value || 0));
  return <figure className="hub-trend" aria-label={label}><div className="hub-trend-bars">{points.map((point) => <div key={point.label} className="hub-trend-bar"><span style={{ height: `${((point.value || 0) / max) * 100}%` }} /><small>{point.value == null ? "—" : format(point.value)}</small><em>{point.label}</em></div>)}</div><figcaption>{label}</figcaption></figure>;
}
