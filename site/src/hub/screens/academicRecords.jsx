import { useEffect, useState } from "react";
import { where } from "firebase/firestore";
import { useAuth } from "../../auth/AuthProvider";
import { can } from "../../auth/permissions";
import { getMany, list, listIn, useLoad } from "../data";
import { RecordManager } from "../manage";
import {
  ChildSwitcher,
  EmptyState,
  ErrorNote,
  Loading,
  PageHeader,
  Section,
  StatusBadge,
} from "../ui";
export function AcademicRecords() {
  const auth = useAuth(),
    family = auth.currentHub === "parent" || auth.currentHub === "student";
  const report = window.location.pathname.includes("reports");
  return family ? (
    <FamilyRecords report={report} />
  ) : (
    <AcademicRegister report={report} />
  );
}
function AcademicRegister({ report }) {
  const auth = useAuth(),
    leader = auth.roles.some((r) => ["leadership", "superAdmin"].includes(r)),
    coordinator = auth.roles.includes("academicCoordinator");
  const path = report ? "reportCards" : "studentResults",
    module = report ? "reportCards" : "assessments";
  const classes = auth.scope?.classIds || [],
    assigned = auth.scope?.assignedStudentIds || [];
  const wide = leader || coordinator || auth.roles.includes("schoolAdmin");
  const options = leader
    ? [
        ["draft", "Draft"],
        ["submitted", "Submitted"],
        ["reviewed", "Reviewed"],
        ["academicApproved", "Academic approved"],
        ["approved", "Approved"],
        ["published", "Published"],
        ["locked", "Locked"],
      ]
    : coordinator
      ? [
          ["submitted", "Submitted"],
          ["reviewed", "Reviewed"],
          [report ? "academicApproved" : "approved", "Academic approved"],
          ...(!report ? [["published", "Published"]] : []),
        ]
      : [
          ["draft", "Draft"],
          ["submitted", "Submit for review"],
        ];
  return (
    <RecordManager
      kicker="Academic records"
      title={report ? "Report cards" : "Subject results"}
      noun={report ? "report card" : "subject result"}
      collection={path}
      canCreate={
        auth.roles.some((r) =>
          ["teacher", "classTeacher", "specialistTeacher"].includes(r),
        ) ||
        (report && leader)
      }
      canEdit={!!can(auth.roles, module, "U") || !!can(auth.roles, module, "A")}
      intro="Teachers prepare records; academic staff review and leadership publishes. Families see only published or locked records. Use the school-approved grading language; this screen does not calculate rankings or promotion."
      load={async () =>
        wide
          ? list(path)
          : [
              ...new Map(
                [
                  ...(await listIn(path, "classId", classes)),
                  ...(await listIn(path, "studentId", assigned)),
                ].map((r) => [r.id, r]),
              ).values(),
            ]
      }
      lookups={async () => ({
        classes: wide
          ? await list("classes")
          : await getMany("classes", classes),
        students: wide
          ? await list("students")
          : [
              ...(await listIn("students", "currentClassId", classes)),
              ...(await getMany("students", assigned)),
            ],
        subjects: await list("subjects"),
        terms: await list("terms"),
      })}
      fields={[
        {
          key: "classId",
          label: "Class",
          type: "select",
          required: true,
          immutable: true,
          options: (l) => l.classes.map((c) => [c.id, c.name]),
        },
        {
          key: "studentId",
          label: "Student",
          type: "select",
          required: true,
          immutable: true,
          options: (l, d) =>
            l.students
              .filter((s) => s.currentClassId === d.classId)
              .map((s) => [s.id, s.name]),
        },
        {
          key: "termId",
          label: "Term",
          type: "select",
          required: true,
          immutable: true,
          options: (l) => l.terms.map((t) => [t.id, t.name]),
        },
        ...(!report
          ? [
              {
                key: "subjectId",
                label: "Subject",
                type: "select",
                required: true,
                immutable: true,
                options: (l, d) =>
                  l.subjects
                    .filter(
                      (s) =>
                        leader ||
                        coordinator ||
                        (auth.scope?.homeroomClassIds || []).includes(
                          d.classId,
                        ) ||
                        (auth.scope?.assignmentKeys || []).includes(
                          d.classId + ":" + s.id,
                        ),
                    )
                    .map((s) => [s.id, s.name]),
              },
              {
                key: "grade",
                label: "Grade / mastery level (school-approved scale)",
                required: true,
                type: "text",
                maxLength: 100,
              },
            ]
          : []),
        {
          key: "summary",
          label: report
            ? "Report narrative"
            : "Teacher comment / evidence of progress",
          type: "textarea",
          required: true,
          maxLength: 4000,
          wide: true,
        },
        {
          key: "status",
          label: "Review and publication",
          type: "select",
          required: true,
          options,
        },
      ]}
      defaults={() => ({ status: "draft" })}
      prepare={(v, { lookups }) => ({
        ...v,
        academicYearId:
          lookups.classes.find((c) => c.id === v.classId)?.academicYearId ||
          null,
      })}
      editable={(r) =>
        leader ||
        (coordinator
          ? ["submitted", "reviewed", "approved", "academicApproved"].includes(
              r.status,
            )
          : ["draft", "submitted"].includes(r.status))
      }
      archivable={() => false}
      statusOptions={null}
      nameOf={(r, l) =>
        l.students.find((s) => s.id === r.studentId)?.name || "Student"
      }
      columns={(l) => [
        {
          key: "studentId",
          label: "Student",
          render: (r) => l.students.find((s) => s.id === r.studentId)?.name,
        },
        {
          key: "termId",
          label: "Term",
          render: (r) => l.terms.find((t) => t.id === r.termId)?.name,
        },
        ...(!report
          ? [
              {
                key: "subjectId",
                label: "Subject",
                render: (r) =>
                  l.subjects.find((s) => s.id === r.subjectId)?.name,
              },
              { key: "grade", label: "Grade / mastery" },
            ]
          : []),
        {
          key: "status",
          label: "Status",
          render: (r) => <StatusBadge status={r.status} />,
        },
      ]}
      exportName={path}
    />
  );
}
function FamilyRecords({ report }) {
  const auth = useAuth();
  const ids =
    auth.currentHub === "student"
      ? [auth.scope?.studentId].filter(Boolean)
      : auth.scope?.childIds || [];
  const [selected, setSelected] = useState(ids[0] || "");
  useEffect(() => {
    if (!ids.includes(selected)) setSelected(ids[0] || "");
  }, [ids.join("|"), selected]);
  const { data, loading, error } = useLoad(
    async () => ({
      children: await getMany("students", ids),
      subjects: await list("subjects"),
      terms: await list("terms"),
      rows: selected
        ? await list(
            report ? "reportCards" : "studentResults",
            where("studentId", "==", selected),
            where("status", "in", ["published", "locked"]),
          )
        : [],
    }),
    [selected, report, ids.join("|")],
  );
  return (
    <>
      <PageHeader
        kicker="Academic records"
        title={report ? "Published report cards" : "Learning progress"}
        actions={
          <button
            className="hub-button hub-button-quiet"
            onClick={() => window.print()}
          >
            Print these records
          </button>
        }
      >
        The school publishes reviewed records here. This is a family copy;
        request an official transcript from the school office.
      </PageHeader>
      <ErrorNote error={error} />
      {loading ? (
        <Loading />
      ) : (
        data && (
          <>
            <ChildSwitcher
              children={data.children}
              selectedId={selected}
              onSelect={setSelected}
            />
            {!data.rows.length ? (
              <EmptyState title="No published records yet." />
            ) : (
              data.rows
                .sort((a, b) =>
                  String(b.academicYearId).localeCompare(
                    String(a.academicYearId),
                  ),
                )
                .map((r) => (
                  <Section
                    key={r.id}
                    title={
                      (report
                        ? "Report card"
                        : data.subjects.find((s) => s.id === r.subjectId)
                            ?.name || "Subject") +
                      " · " +
                      (data.terms.find((t) => t.id === r.termId)?.name ||
                        r.termId)
                    }
                  >
                    <p>
                      {r.academicYearId} · {r.grade || ""}
                    </p>
                    <p style={{ whiteSpace: "pre-wrap" }}>{r.summary}</p>
                  </Section>
                ))
            )}
          </>
        )
      )}
    </>
  );
}
