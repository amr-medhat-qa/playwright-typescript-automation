import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, type TestInfo } from '@playwright/test';

export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

type Violation = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'][number];

const summarize = (violations: Violation[]) =>
  violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    helpUrl: v.helpUrl,
    targets: v.nodes.map((n) => n.target.join(' ')),
  }));

/**
 * Runs an axe-core scan, attaches the full JSON result to the report,
 * and asserts there are no WCAG 2.1 A/AA violations.
 */
export async function expectNoWcagViolations(page: Page, testInfo: TestInfo, name: string) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  await testInfo.attach(`axe-wcag-${name}.json`, {
    body: JSON.stringify(summarize(results.violations), null, 2),
    contentType: 'application/json',
  });
  expect(summarize(results.violations), `WCAG 2.1 AA violations on ${name}`).toEqual([]);
}

/**
 * Best-practice rules (beyond WCAG). Known issues are tracked explicitly:
 * a NEW rule violation fails the test, while a fixed one shows up as a diff to update the list.
 */
export async function expectOnlyKnownBestPracticeIssues(page: Page, testInfo: TestInfo, name: string, known: string[]) {
  const results = await new AxeBuilder({ page }).withTags(['best-practice']).analyze();
  const found = summarize(results.violations);
  await testInfo.attach(`axe-best-practice-${name}.json`, {
    body: JSON.stringify(found, null, 2),
    contentType: 'application/json',
  });
  for (const id of known) testInfo.annotations.push({ type: 'known a11y issue', description: `${name}: ${id}` });
  expect(found.map((v) => v.id).sort(), `best-practice issues on ${name}`).toEqual([...known].sort());
}
