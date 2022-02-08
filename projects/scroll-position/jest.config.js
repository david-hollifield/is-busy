const baseConfig = require("../../jest.config");

module.exports = {
  ...baseConfig,
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/projects/scroll-position/tsconfig.spec.json",
    },
  },
};
