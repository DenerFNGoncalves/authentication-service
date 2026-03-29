/** @typedef {import('eslint').Linter.RulesRecord} RulesRecord */

export const formattingConfig = {
	useTabs: true,
	tabWidth: 2,
	singleQuote: true,
	semi: true,
	trailingComma: 'none',
	printWidth: 100,
	objectCurlySpacing: 'always'
};

/** @type {import('prettier').Config} */
export const prettierStyleConfig = {
	useTabs: formattingConfig.useTabs,
	tabWidth: formattingConfig.tabWidth,
	singleQuote: formattingConfig.singleQuote,
	semi: formattingConfig.semi,
	trailingComma: formattingConfig.trailingComma,
	printWidth: formattingConfig.printWidth
};

/** @type {RulesRecord} */
export const eslintStyleRules = {
	'comma-dangle': [
		'error',
		formattingConfig.trailingComma === 'none' ? 'never' : 'always-multiline'
	],
	indent: [
		'error',
		formattingConfig.useTabs ? 'tab' : formattingConfig.tabWidth,
		{ SwitchCase: 1 }
	],
	'no-tabs': 'off',
	'no-mixed-spaces-and-tabs': 'error',
	'object-curly-spacing': ['error', formattingConfig.objectCurlySpacing],
	quotes: ['error', formattingConfig.singleQuote ? 'single' : 'double', { avoidEscape: true }],
	semi: ['error', formattingConfig.semi ? 'always' : 'never']
};
