import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import ts from 'typescript-eslint';

export default defineConfig([
	{
		files: ['**/*.ts'],
		plugins: {
			js,
			ts,
		},
		extends: ['js/recommended', 'ts/strict'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-import-type-side-effects': 'warn',
		},
	},
]);
