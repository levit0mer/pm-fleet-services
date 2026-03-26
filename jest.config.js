module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@playmobility/shipping-core$': '<rootDir>/packages/shipping-core/src/index.ts',
    '^@playmobility/rate-engine$': '<rootDir>/packages/rate-engine/src/index.ts',
    '^@playmobility/tracking-utils$': '<rootDir>/packages/tracking-utils/src/index.ts',
  },
};
