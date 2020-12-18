module.exports = {
  moduleNameMapper: {
    "@core/(.*)": "<rootDir>/src/app/core/$1",
  },
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  modulePathIgnorePatterns: [
    "<rootDir>/projects/is-loading/build/",
    "<rootDir>/projects/scroll-position/build/",
  ],
};
