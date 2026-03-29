export default {
	// Informa ao Jest para usar o SWC para arquivos TypeScript
	transform: {
		'^.+\\.(t|j)sx?$': ['@swc/jest']
	},
	testEnvironment: 'node',
	// Se você estiver usando os imports sem .js (com moduleResolution: Bundler)

	roots: ['<rootDir>/tests'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
		'^@tests/(.*)$': '<rootDir>/tests/$1'
	},
	testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.spec.ts']
};
