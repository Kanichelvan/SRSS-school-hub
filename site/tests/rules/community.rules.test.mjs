import { readFile } from "node:fs/promises";
import { before, after, beforeEach, test } from "node:test";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
let env;
const [host, port = "8080"] = (
  process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080"
).split(":");
const roles = {
  parent: ["parent"],
  other: ["parent"],
  teacher: ["teacher", "classTeacher"],
  leader: ["leadership"],
  admin: ["schoolAdmin"],
};
const as = (n) => env.authenticatedContext(n, { roles: roles[n] }).firestore();
const seed = (p, v) =>
  env.withSecurityRulesDisabled((c) => setDoc(doc(c.firestore(), p), v));
before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-srss-tests",
    firestore: {
      host,
      port: Number(port),
      rules: await readFile(
        new URL("../../firestore.rules", import.meta.url),
        "utf8",
      ),
    },
  });
});
after(() => env?.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  for (const uid of Object.keys(roles))
    await seed(`users/${uid}`, {
      roles: roles[uid],
      childIds: uid === "parent" ? ["a"] : [],
      classIds: uid === "teacher" ? ["c"] : [],
      homeroomClassIds: uid === "teacher" ? ["c"] : [],
      audienceKeys: ["school"],
      familyClassIds: uid === "parent" ? ["c"] : [],
    });
  await seed("students/a", { currentClassId: "c" });
});
test("onboarding progress is own and role-checked", async () => {
  await assertSucceeds(
    getDoc(doc(as("parent"), "onboardingProgress/parent_parent")),
  );
  const p = {
    ownerUid: "parent",
    role: "parent",
    version: 1,
    completed: ["welcome"],
    checkInDate: "",
    updatedAt: serverTimestamp(),
  };
  await assertSucceeds(
    setDoc(doc(as("parent"), "onboardingProgress/parent_parent"), p),
  );
  await assertFails(
    getDoc(doc(as("other"), "onboardingProgress/parent_parent")),
  );
  await assertSucceeds(
    getDoc(doc(as("admin"), "onboardingProgress/parent_parent")),
  );
  await assertFails(
    setDoc(doc(as("parent"), "onboardingProgress/parent_teacher"), {
      ...p,
      role: "teacher",
    }),
  );
});
test("family story is private and has no public publishing flag", async () => {
  const p = {
    ownerUid: "parent",
    needs: ["calendar"],
    language: "Tamil",
    contact: "hub",
    voice: "Our story",
    allowContact: false,
    updatedAt: serverTimestamp(),
  };
  await assertSucceeds(
    setDoc(doc(as("parent"), "familyPreferences/parent"), p),
  );
  await assertFails(getDoc(doc(as("teacher"), "familyPreferences/parent")));
  await assertSucceeds(getDoc(doc(as("admin"), "familyPreferences/parent")));
  await assertFails(
    setDoc(doc(as("parent"), "familyPreferences/parent"), {
      ...p,
      published: true,
    }),
  );
});
test("medical forms are own-child, private and append-only", async () => {
  const f = {
    ownerUid: "parent",
    studentId: "a",
    classId: "c",
    studentName: "A",
    formId: "medical",
    title: "Medical",
    activity: "Trip",
    date: "2026-10-16",
    signature: "Parent",
    version: 1,
    status: "submitted",
    createdAt: serverTimestamp(),
    medical: "Allergy",
  };
  await assertSucceeds(setDoc(doc(as("parent"), "activityForms/a"), f));
  await assertFails(getDoc(doc(as("teacher"), "activityForms/a")));
  await assertFails(getDoc(doc(as("other"), "activityForms/a")));
  await assertSucceeds(getDoc(doc(as("admin"), "activityForms/a")));
  await assertFails(
    updateDoc(doc(as("parent"), "activityForms/a"), { medical: "changed" }),
  );
  await assertFails(
    setDoc(doc(as("other"), "activityForms/b"), { ...f, ownerUid: "other" }),
  );
  await assertFails(
    setDoc(doc(as("parent"), "activityForms/c"), { ...f, formId: "incident" }),
  );
});
test("teachers reflect but cannot assess themselves or read colleague reviews", async () => {
  const r = {
    staffUid: "teacher",
    year: 2026,
    stage: "midyear",
    meetingDate: "2026-10-16",
    goals: "Feedback",
    deliveryBand: "meets",
    status: "active",
    createdBy: "leader",
    createdAt: serverTimestamp(),
    updatedBy: "leader",
    updatedAt: serverTimestamp(),
  };
  await assertSucceeds(setDoc(doc(as("leader"), "staffAppraisals/a"), r));
  await assertSucceeds(
    updateDoc(doc(as("teacher"), "staffAppraisals/a"), {
      selfReflection: "My evidence",
      updatedBy: "teacher",
      updatedAt: serverTimestamp(),
    }),
  );
  await assertFails(
    updateDoc(doc(as("teacher"), "staffAppraisals/a"), {
      deliveryBand: "strong",
      updatedBy: "teacher",
      updatedAt: serverTimestamp(),
    }),
  );
  await assertFails(getDoc(doc(as("admin"), "staffAppraisals/a")));
  await seed("staffAppraisals/b", { ...r, staffUid: "other" });
  await assertFails(getDoc(doc(as("teacher"), "staffAppraisals/b")));
});
test("read acknowledgement requires the notice audience", async () => {
  await seed("announcements/a", {
    audienceKeys: ["school"],
    status: "published",
  });
  await seed("announcements/b", {
    audienceKeys: ["role:staff"],
    status: "published",
  });
  const r = {
    ownerUid: "parent",
    announcementId: "a",
    readAt: serverTimestamp(),
  };
  await assertSucceeds(
    setDoc(doc(as("parent"), "announcementReads/parent_a"), r),
  );
  await assertFails(
    setDoc(doc(as("parent"), "announcementReads/parent_b"), {
      ...r,
      announcementId: "b",
    }),
  );
  await assertFails(setDoc(doc(as("other"), "announcementReads/parent_a"), r));
});
test("plans cannot be stolen by changing the owner", async () => {
  const p = {
    title: "Plan",
    ownerUid: "teacher",
    classId: "c",
    subjectId: "math",
    weekOf: "2026-10-19",
    syllabus: "Counting",
    learning: "Tasks",
    createdAt: serverTimestamp(),
    createdBy: "teacher",
    updatedAt: serverTimestamp(),
    updatedBy: "teacher",
  };
  await assertSucceeds(setDoc(doc(as("teacher"), "lessonPlans/a"), p));
  await seed("lessonPlans/b", { ...p, ownerUid: "other" });
  await assertFails(
    updateDoc(doc(as("teacher"), "lessonPlans/b"), {
      ownerUid: "teacher",
      updatedAt: serverTimestamp(),
      updatedBy: "teacher",
    }),
  );
});
test("conversations require school contacts and protect message participants", async () => {
  const t = {
    subject: "Question",
    participantUids: ["parent", "teacher"],
    createdBy: "parent",
    createdAt: serverTimestamp(),
  };
  await assertSucceeds(setDoc(doc(as("parent"), "messageThreads/a"), t));
  await assertFails(
    setDoc(doc(as("parent"), "messageThreads/b"), {
      ...t,
      participantUids: ["parent", "other"],
    }),
  );
  await assertFails(
    setDoc(doc(as("other"), "messageThreads/a/messageItems/x"), {
      senderUid: "other",
      body: "Hello",
      createdAt: serverTimestamp(),
    }),
  );
  await assertSucceeds(
    setDoc(doc(as("teacher"), "messageThreads/a/messageItems/y"), {
      senderUid: "teacher",
      body: "Hello",
      createdAt: serverTimestamp(),
    }),
  );
});
test("families see published results only and teachers cannot rewrite a published report", async () => {
  await seed("studentResults/a", {
    studentId: "a",
    classId: "c",
    status: "draft",
  });
  await assertFails(getDoc(doc(as("parent"), "studentResults/a")));
  await seed("studentResults/a", {
    studentId: "a",
    classId: "c",
    status: "published",
  });
  await assertSucceeds(getDoc(doc(as("parent"), "studentResults/a")));
  await seed("reportCards/a", {
    studentId: "a",
    classId: "c",
    status: "published",
    termId: "t",
    createdBy: "teacher",
  });
  await assertFails(
    updateDoc(doc(as("teacher"), "reportCards/a"), { status: "draft" }),
  );
});
test("an offer can be accepted only by its applicant without altering the offer", async () => {
  await seed("applications/a", {
    applicantUid: "parent",
    status: "offer",
    offerText: "School offer",
  });
  const patch = {
    status: "accepted",
    acceptedBy: "parent",
    acceptedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    updatedBy: "parent",
  };
  await assertFails(updateDoc(doc(as("other"), "applications/a"), patch));
  await assertFails(
    updateDoc(doc(as("parent"), "applications/a"), {
      ...patch,
      offerText: "Changed",
    }),
  );
  await assertSucceeds(updateDoc(doc(as("parent"), "applications/a"), patch));
});

test("admissions selection notes are internal and cannot be read by the applicant", async () => {
  const record = {
    applicationId: "a",
    meritRank: 1,
    criteriaReference: "School review meeting",
    notes: "Discussed by admissions",
    updatedAt: serverTimestamp(),
    updatedBy: "admin",
  };
  await assertSucceeds(
    setDoc(doc(as("admin"), "applicationReviews/a"), record),
  );
  await assertFails(getDoc(doc(as("parent"), "applicationReviews/a")));
  await assertSucceeds(getDoc(doc(as("leader"), "applicationReviews/a")));
  await assertFails(
    setDoc(doc(as("parent"), "applicationReviews/b"), {
      ...record,
      applicationId: "b",
      updatedBy: "parent",
    }),
  );
});
test("a requested form can be answered without changing its recipient or assignment", async () => {
  await seed("formSubmissions/a", {
    formId: "emergency",
    studentId: "a",
    requestedFromUid: "parent",
    createdBy: "admin",
    status: "pending",
  });
  const answers = {
    answers: { primaryContact: "Fictional contact" },
    submittedByUid: "parent",
    submittedAt: serverTimestamp(),
    status: "submitted",
    updatedAt: serverTimestamp(),
    updatedBy: "parent",
  };
  await assertFails(
    updateDoc(doc(as("parent"), "formSubmissions/a"), {
      ...answers,
      assignedToUid: "other",
    }),
  );
  await assertSucceeds(
    updateDoc(doc(as("parent"), "formSubmissions/a"), answers),
  );
  await assertFails(
    updateDoc(doc(as("parent"), "formSubmissions/a"), {
      answers: { primaryContact: "Overwritten" },
    }),
  );
});
