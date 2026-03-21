/**
 * src/test/setup.ts
 *
 * Vitest global setup — referenced in vitest.config.ts → setupFiles.
 * Manages the MSW server lifecycle for every test file automatically.
 */

import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mswServer';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
