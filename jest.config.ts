export default {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.ts': 'babel-jest',
  },
};
