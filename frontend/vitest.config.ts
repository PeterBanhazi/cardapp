// ─── vitest.config.ts ────────────────────────────────────────────────────────
// Place this in the project root.

import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
        plugins: [react(), svgr()],
        resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        environment: 'jsdom',          // browser-like DOM (localStorage, Cookies)
        setupFiles: ['./src/test/setup.ts'],
        globals: true,                 // describe/it/expect available without imports
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: [
                'src/**/*.ts',
                'src/**/*.tsx',
            ],
            exclude: [
                'src/test/**',
                'src/**/*.test.*',
                'src/**/*.d.ts',
            ],
        },
    },
});


// ─── src/test/setup.ts ───────────────────────────────────────────────────────
// Referenced in vitest.config.ts → setupFiles.
// Manages the MSW server lifecycle for all test files.
//
// Note: the MSW server is defined locally inside useAuthStore.test.ts.
// If you need it across multiple test files, extract it here:
//
// import { server } from './mswServer';
// beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());