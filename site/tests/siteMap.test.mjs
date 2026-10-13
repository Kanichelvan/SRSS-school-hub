// Route map integrity (Website Architecture v2.0): every link in the menus resolves, every redirect
// lands on a real page, and the hierarchy has no gaps.
import { test } from "node:test";
import assert from "node:assert/strict";
import { REDIRECTS, SITE, breadcrumbs, resolvePath } from "../src/data/siteMap.js";
import { siteNav, signInLink } from "../src/data/navigation.js";

test("every public path is listed once, in lowercase with hyphens", () => {
  const paths = SITE.map((entry) => entry.path);
  assert.equal(new Set(paths).size, paths.length);
  for (const path of paths) assert.match(path, /^\/([a-z0-9-]+(\/[a-z0-9-]+)*)?$/, path);
});

test("every parent exists, so breadcrumbs never break", () => {
  for (const entry of SITE) {
    if (entry.parent) assert.ok(SITE.some((item) => item.path === entry.parent), `${entry.path} → ${entry.parent}`);
    assert.equal(breadcrumbs(entry).at(-1), entry);
  }
});

test("section URLs name the page and anchor they live in", () => {
  for (const entry of SITE.filter((item) => item.status === "section")) assert.ok(entry.page && entry.anchor, entry.path);
});

test("every menu link resolves to a page in the route map", () => {
  const hrefs = siteNav.flatMap((item) => [item.href, ...item.groups.flatMap((group) => [group.href, ...group.links.map(([, href]) => href)])]).filter(Boolean);
  for (const href of hrefs) assert.notEqual(resolvePath(href).entry?.page, "notFound", href);
  assert.equal(signInLink.href, "/login");
});

test("old addresses redirect to existing pages", () => {
  for (const [from, to] of Object.entries(REDIRECTS)) {
    assert.deepEqual(resolvePath(from), { redirect: to });
    const target = resolvePath(to);
    assert.ok(target.entry && target.entry.page !== "notFound", `${from} → ${to}`);
  }
});
