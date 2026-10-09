import assert from "node:assert/strict";
import { test } from "node:test";
import { MODULES, ROLE_IDS, can, canOpen, hubsFor, matrixForTesting, primaryHub } from "../src/auth/permissions.js";
import { ROLE_IDS as FUNCTION_ROLE_IDS } from "../functions/roles.js";
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
  assert.deepEqual(approvers.sort(), ["leadership", "portfolioModerator"]);
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
