import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildDnsRecords,
  normalizeDomain,
  normalizeGitHubUser,
  setDomainCommand,
} from "./domain.ts";

describe("domain lock-in helpers", () => {
  it("normalizes pasted URLs into a host", () => {
    assert.equal(normalizeDomain("https://WWW.MyCalc.com/path"), "mycalc.com");
    assert.equal(normalizeDomain("mycalc.com."), "mycalc.com");
    assert.equal(normalizeDomain("not a domain"), null);
    assert.equal(normalizeDomain("localhost"), null);
  });

  it("accepts GitHub usernames", () => {
    assert.equal(normalizeGitHubUser("myoraong0703"), "myoraong0703");
    assert.equal(normalizeGitHubUser("bad user"), null);
  });

  it("builds DNS-only GitHub Pages records", () => {
    const records = buildDnsRecords("octocat");
    assert.equal(records.some((row) => row.type === "A" && row.name === "@"), true);
    assert.equal(
      records.find((row) => row.type === "CNAME")?.content,
      "octocat.github.io",
    );
    assert.ok(records.every((row) => row.proxy === "DNS only"));
    assert.equal(setDomainCommand("mycalc.com"), "npm run set-domain -- mycalc.com");
  });
});
