module.exports = {
  testEnvironment: "jsdom",
  transform: {'^.+\\.(js|jsx)$': 'babel-jest',},
  moduleNameMapper: {'\\.(css|scss)$': 'identity-obj-proxy','\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/mocks/mock1.js',},
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleFileExtensions: ['js', 'jsx'],
};
