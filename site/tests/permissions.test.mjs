import assert from "node:assert/strict";
import { test } from "node:test";
import { MODULES, OFFICE_ASSIGNABLE_ROLES, PRIMARY_ROLES, ROLE_IDS, assignableRoles, can, canOpen, hubsFor, isElevated, matrixForTesting, primaryHub } from "../src/auth/permissions.js";
import { OFFICE_ASSIGNABLE_ROLES as FUNCTION_OFFICE_ROLES, ROLE_IDS as FUNCTION_ROLE_IDS } from "../functions/roles.js";
import { hubRoutes } from "../src/hub/routes.js";
import { authErrorMessage } from "../src/auth/authErrors.js";

test("every matrix cell names a known role and module", () => {
  for (const [module, cells] of Object.entries(matrixForTesting.MATRIX)) {
    assert.ok(MODULES[module], `unknown module ${module}`);
    for (const role of Object.keys(cells)) assert.ok(ROLE_IDS.includes(role), `${module}: unknown role ${role}`);
  }
});

test("Cloud Functions accept exactly the hub roles", () => {
  assert.deepEqual([...FUNCTION_ROLE_IDS].sort(), [...ROLE_IDS].sort());
  assert.deepEqual([...FUNCTION_OFFICE_ROLES].sort(), [...OFFICE_ASSIGNABLE_ROLES].sort());
});

test("the six initial roles exist; a person can hold several", () => {
  assert.deepEqual(PRIMARY_ROLES, ["superAdmin", "schoolAdmin", "teacher", "parent", "student", "contentEditor"]);
  assert.deepEqual(hubsFor(["teacher", "parent"]), ["teacher", "parent"]);
  assert.equal(primaryHub(["superAdmin"]), "admin");
});

test("only a Super Administrator can grant elevated roles; the office grants family and teacher roles", () => {
  assert.deepEqual(assignableRoles(["superAdmin"]), ROLE_IDS);
  assert.deepEqual(assignableRoles([], { accessAdmin: true }), ROLE_IDS);
  assert.deepEqual(assignableRoles(["schoolAdmin"]).sort(), [...OFFICE_ASSIGNABLE_ROLES].sort());
  for (const role of ["schoolAdmin", "superAdmin", "leadership", "contentEditor"]) assert.equal(isElevated(role), true, role);
  for (const role of ["teacher", "parent", "student"]) assert.equal(isElevated(role), false, role);
  assert.deepEqual(assignableRoles(["teacher"]), []);
  assert.deepEqual(assignableRoles(["contentEditor"]), []);
});

test("a Super Administrator holds the widest of office, leadership and technical rights", () => {
  assert.equal(can(["superAdmin"], "calendar", "U"), "all");
  assert.equal(can(["superAdmin"], "content", "A"), "all");
  assert.equal(can(["superAdmin"], "accessAdministration", "U"), "all");
  assert.equal(can(["superAdmin"], "settings", "U"), "all");
  assert.equal(can(["superAdmin"], "fees", "U"), null);
});

test("every hub route points at a known module", () => {
  for (const route of hubRoutes) assert.ok(MODULES[route.module], `${route.path} → ${route.module}`);
});

test("families see only their own child; teachers their class (PRD §44)", () => {
  assert.equal(can(["student"], "attendance"), "own");
  assert.equal(can(["parent"], "attendance"), "child");
  assert.equal(can(["teacher"], "attendance", "U"), "class");
  assert.equal(can(["specialistTeacher"], "students"), "assigned");
});

test("content editors and admissions officers get no student-record access", () => {
  assert.equal(canOpen(["contentEditor"], "students"), false);
  assert.equal(can(["admissionsOfficer"], "students"), "restricted");
  assert.equal(canOpen(["admissionsOfficer"], "students"), false);
  assert.equal(can(["admissionsOfficer"], "admissions", "U"), "all");
});

test("financial records are separated from teacher access (PRD §17, §36)", () => {
  for (const role of ["teacher", "classTeacher", "specialistTeacher"]) assert.equal(can([role], "fees"), null);
  assert.equal(can(["parent"], "fees"), "child");
  assert.equal(can(["financeOfficer"], "fees", "U"), "all");
});

test("only the portfolio moderator or leadership approves public showcase (CON-002)", () => {
  const approvers = ROLE_IDS.filter((role) => can([role], "showcase", "A"));
  assert.deepEqual(approvers.sort(), ["leadership", "portfolioModerator", "superAdmin"]);
  assert.equal(can(["teacher"], "showcase", "C"), "class");
});

test("results are visible to families only once published", () => {
  assert.equal(can(["parent"], "assessments"), "published");
  assert.equal(can(["academicCoordinator"], "assessments", "A"), "all");
});

test("multi-role users default to the highest-privilege hub (AUTH-001 AC3)", () => {
  assert.deepEqual(hubsFor(["parent", "teacher"]), ["teacher", "parent"]);
  assert.equal(primaryHub(["parent", "teacher", "contentEditor"]), "admin");
  assert.equal(primaryHub(["student"]), "student");
});

test("Library is reserved for a future phase", () => {
  assert.equal(MODULES.library.phase, 3);
  assert.equal(canOpen(["student"], "library"), true);
});

test("auth errors map to friendly, non-revealing messages (AUTH-001 AC4)", () => {
  assert.equal(authErrorMessage({ code: "auth/user-not-found" }), authErrorMessage({ code: "auth/wrong-password" }));
  assert.match(authErrorMessage({ code: "auth/too-many-requests" }), /Too many attempts/);
  assert.match(authErrorMessage({ code: "something/else" }), /did not complete/);
});
