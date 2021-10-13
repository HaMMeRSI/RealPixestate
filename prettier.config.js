module.exports = {
	trailingComma: 'es5',
	tabWidth: 4,
	useTabs: true,
	semi: true,
	singleQuote: true,
	printWidth: 180,
	overrides: [
		{
			files: '*.sol',
			options: {
				printWidth: 280,
				tabWidth: 4,
				useTabs: true,
				singleQuote: false,
				bracketSpacing: false,
				explicitTypes: 'always',
			},
		},
	],
};
