// Writes docs/FORMS-REGISTRY.md — the master form registry as a document — from functions/forms-registry.js.
// Run after changing the registry: `node scripts/forms-registry-report.mjs`.
import { writeFile } from "node:fs/promises";
import { CATEGORIES, CLASSIFICATIONS, FORMS, FORM_TYPES, LEVELS, ROLE_LABELS, TARGETS } from "../functions/forms-registry.js";

const WHERE = { form: "Hub form", public: "Website form", module: "Own module", planned: "Planned" };
const role = (id) => ROLE_LABELS[id] || id;
const cell = (value) => String(value ?? "").replaceAll("|", "\\|");
const lines = [
  "# SRSS master form registry",
  "",
  "Generated from `functions/forms-registry.js` by `scripts/forms-registry-report.mjs` — edit the registry, then re-run the script.",
  "Routing, ownership and response targets are the specification's proposals, pending SRSS leadership approval; the School",
  "changes routing in Forms & Response Centre › Workflow rules.",
  "",
  `${FORMS.length} forms and workflows: ${FORMS.filter((f) => f.availability === "form").length} hub forms, ${FORMS.filter((f) => f.availability === "public").length} website forms, ${FORMS.filter((f) => f.availability === "module").length} handled in their own module, ${FORMS.filter((f) => f.availability === "planned").length} planned with later modules.`,
  "",
  "Where: **Hub form** runs at `/hub/requests/new/<ID>`; **Website form** at `/forms/<ID>`; **Own module** links to the hub page that already does it; **Planned** arrives with its module (Library, Fees, Assets, incidents follow-up and so on).",
  "Notification level: 1 Standard (in-app + daily summary) · 2 Action required (+ email to the PIC, reminders) · 3 Priority / confidential (restricted queue, no details in email).",
  "",
];
for (const [key, category] of Object.entries(CATEGORIES)) {
  lines.push(`## ${key} — ${category.name}`, "", `Queue: ${category.queue} · reference \`SRSS-${category.code}-YYYY-NNNN\` · default PIC ${role(category.pic)}, backup ${role(category.backup)}, escalation ${role(category.escalation)}.`, "");
  lines.push("| ID | Form | Intended user | Priority | Where | Type | PIC / backup | Target | Level | Data | Stored in |", "|---|---|---|---|---|---|---|---|---|---|---|");
  for (const form of FORMS.filter((item) => item.category === key)) {
    lines.push(`| ${form.id} | ${cell(form.title)} | ${cell(form.user)} | ${form.priority} | ${form.link ? `[${WHERE[form.availability]}](${form.link})` : WHERE[form.availability]} | ${FORM_TYPES[form.type]} | ${role(form.pic)} / ${role(form.backup)} | ${TARGETS[form.target].label} | ${form.level} ${LEVELS[form.level]} | ${CLASSIFICATIONS[form.classification]} | ${cell(form.restricted ? "restrictedCases" : form.store)} |`);
  }
  lines.push("");
}
await writeFile(new URL("../docs/FORMS-REGISTRY.md", import.meta.url), lines.join("\n"));
console.log(`Wrote docs/FORMS-REGISTRY.md (${FORMS.length} forms).`);
