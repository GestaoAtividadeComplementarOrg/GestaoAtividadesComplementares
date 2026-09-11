import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            exclude: [
                'src/main.ts',
                'src/app/app.config.ts',
                'src/app/app.routes.ts',
                'src/environments/**',
                '**/*.model.ts',
                '**/*.spec.ts',
            ],
            thresholds: {
                lines: 100,
                functions: 100,
                branches: 100,
                statements: 100,
            },
        },
    },
});