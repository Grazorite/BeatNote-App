import { test as base, expect as baseExpect } from '@playwright/test';

// Use base test without complex fixtures
export const test = base;

// Use base expect
export const expect = baseExpect;

// Re-export everything else
export { Page, Locator, BrowserContext } from '@playwright/test';