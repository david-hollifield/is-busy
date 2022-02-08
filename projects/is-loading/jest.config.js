const baseConfig = require("../../jest.config");

module.exports = {
  ...baseConfig,
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/projects/is-loading/tsconfig.spec.json",
    },
  },
};
