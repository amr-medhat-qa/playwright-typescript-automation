/**
 * Public demo accounts published on https://www.saucedemo.com login page.
 * They are not secrets, but can be overridden through environment variables.
 */
const PASSWORD = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

export const users = {
  standard: { username: 'standard_user', password: PASSWORD },
  lockedOut: { username: 'locked_out_user', password: PASSWORD },
  problem: { username: 'problem_user', password: PASSWORD },
  performanceGlitch: { username: 'performance_glitch_user', password: PASSWORD },
  /** Renders the inventory with visual defects only — functionally everything still works. */
  visual: { username: 'visual_user', password: PASSWORD },
} as const;

export type User = { username: string; password: string };

export const checkoutInfo = {
  firstName: 'Test',
  lastName: 'Automation',
  postalCode: '11511',
};
