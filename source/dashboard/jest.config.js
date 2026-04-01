/** @type {import('jest').Config} */
export default {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/app/frontend"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/app/frontend/$1",
    "\\.(css|less|scss)$": "identity-obj-proxy",
  },
  transform: {
    "^.+\\.tsx?$": "@swc/jest",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: [
    "**/__tests__/**/*.{ts,tsx}",
    "**/*.{test,spec}.{ts,tsx}",
  ],
  collectCoverageFrom: [
    "app/frontend/**/*.{ts,tsx}",
    "!app/frontend/**/*.d.ts",
    "!app/frontend/entrypoints/**",
  ],
};
