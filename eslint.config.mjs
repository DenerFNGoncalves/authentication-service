// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import { eslintStyleRules } from './formatting.config.mjs';

export default defineConfig(
	{
		// config with just ignores is the replacement for `.eslintignore`
		ignores: ['**/build/**', '**/dist/**', 'coverage/**', 'tsconfig.json']
	},
	eslint.configs.recommended,
	{
		files: ['**/*.{ts,tsx}'],
		plugins: {
			'@typescript-eslint': tseslint.plugin
		},
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				projectService: true
			}
		},
		rules: {
			'@typescript-eslint/no-floating-promises': 'error',
			'no-undef': 'off',
			'no-unused-vars': 'off',
			...eslintStyleRules,
			'@typescript-eslint/no-unused-vars': 'off'
		}
	},
	{
		// disable type-aware linting on JS files
		files: ['**/*.{js,mjs,cjs}'],
		extends: [tseslint.configs.disableTypeChecked],
		languageOptions: {
			globals: {
				console: 'readonly',
				process: 'readonly',
				module: 'readonly',
				__dirname: 'readonly'
			}
		},
		rules: {
			...eslintStyleRules
		}
	},
	{
		// enable jest rules on test files
		files: ['tests/**']
	}
);
