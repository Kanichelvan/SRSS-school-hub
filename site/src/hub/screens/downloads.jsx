import { useAuth } from "../../auth/AuthProvider";
import { RecordManager } from "../manage";
export function DownloadsManager() {
  const auth = useAuth();
  const edit = auth.roles.some((r) =>
    ["superAdmin", "schoolAdmin"].includes(r),
  );
  return (
    <RecordManager
      kicker="School operations"
      title="School downloads"
      noun="download"
      collection="documents"
      canEdit={edit}
      intro="Publish a governed school document link. Public downloads appear in Resources and the forms library. Internal links are visible only to their intended hub audience; the Drive file must have matching access."
      fields={[
        {
          key: "title",
          label: "Document title",
          required: true,
          type: "text",
          maxLength: 140,
          wide: true,
        },
        {
          key: "url",
          label: "Governed document link",
          required: true,
          type: "url",
          maxLength: 2000,
          wide: true,
        },
        {
          key: "classification",
          label: "Visibility",
          required: true,
          type: "select",
          options: [
            ["public", "Public school download"],
            ["internal", "Internal hub audience"],
          ],
        },
        {
          key: "audienceKeys",
          label: "Internal audience",
          type: "checkboxes",
          options: [
            ["school", "Whole school"],
            ["role:parents", "Parents"],
            ["role:students", "Students"],
            ["role:staff", "Staff"],
            ["role:teachers", "Teachers"],
          ],
        },
        {
          key: "description",
          label: "Description",
          type: "textarea",
          maxLength: 1000,
          wide: true,
        },
        {
          key: "retention",
          label: "Review / retention note",
          type: "text",
          maxLength: 200,
        },
      ]}
      defaults={() => ({
        classification: "internal",
        audienceKeys: ["role:staff"],
      })}
      validate={(v) => ({
        url: /^https:\/\//.test(v.url || "")
          ? null
          : "Use an HTTPS document link.",
        audienceKeys:
          v.classification === "internal" && !v.audienceKeys?.length
            ? "Choose the intended audience."
            : null,
      })}
      columns={() => [
        { key: "title", label: "Document" },
        { key: "classification", label: "Visibility" },
        {
          key: "url",
          label: "Link",
          render: (r) => (
            <a href={r.url} rel="noreferrer" target="_blank">
              Open document
            </a>
          ),
        },
      ]}
      searchKeys={["title", "description"]}
      exportName="school-downloads"
    />
  );
}
