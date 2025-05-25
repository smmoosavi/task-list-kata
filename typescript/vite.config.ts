/// <reference types="vitest" />
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    test: {
        reporters: ['default', 'junit'],
        outputFile: {
            junit: 'coverage/report.xml',
        },
        coverage: {
            all: true,
            provider: 'istanbul',
            include: ['src/**'],
            reporter: ['clover', 'json', 'lcov', 'text', 'cobertura'],
        },
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'src/main.ts'),
            formats: ['es'],
            fileName: 'task-list',
        },
        rollupOptions: {
            external: [
                "readline",
                "util",
            ],
        },
        minify: false
    },
})
