import { describe, expect, it } from 'bun:test';
import { Column, Table, parseCSVFromString } from '../../src';
import { expectToThrow } from '../matchers';

describe('parseCSVFromString', () => {
	describe('String column', () => {
		const table = Table({
			value: Column.String(),
		});

		it('should parse valid value', async () => {
			const res = parseCSVFromString('value\na\n"with\nnewlint"', table);
			expect(res).toEqual([{ value: 'a' }, { value: 'with\nnewlint' }]);
		});

		it('should throw if empty', async () =>
			expectToThrow(() => parseCSVFromString('value\n\n', table)));
	});

	describe('Number column', () => {
		const table = Table({
			value: Column.Number(),
		});

		it('should parse valid value', async () => {
			const res = parseCSVFromString('value\n100\n-5\n4.2', table);
			expect(res).toEqual([{ value: 100 }, { value: -5 }, { value: 4.2 }]);
		});

		it('should throw if empty', async () =>
			expectToThrow(() => parseCSVFromString('value\n\n', table)));

		it('should throw if invalid', async () =>
			expectToThrow(() => parseCSVFromString('value\na\n', table)));
	});

	describe('Boolean column', () => {
		const table = Table({
			value: Column.Boolean(),
		});

		it('should parse valid value', async () => {
			const res = parseCSVFromString(
				'value\ntrue\nTRUE\nTrue\n1\nfalse\nFALSE\nFalse\n0',
				table,
			);
			expect(res).toEqual([
				{ value: true },
				{ value: true },
				{ value: true },
				{ value: true },
				{ value: false },
				{ value: false },
				{ value: false },
				{ value: false },
			]);
		});

		it('should throw if empty', async () =>
			expectToThrow(() => parseCSVFromString('value\n\n', table)));

		it('should throw if invalid', async () =>
			expectToThrow(() => parseCSVFromString('value\na\n', table)));
	});

	describe('Date column', () => {
		const table = Table({
			value: Column.Date(),
		});

		it('should parse valid value (ISO format)', async () => {
			const res = parseCSVFromString('value\n1996-11-13', table);
			expect(res).toEqual([{ value: new Date('1996-11-13') }]);
		});

		it('should throw if empty', async () =>
			expectToThrow(() => parseCSVFromString('value\n\n', table)));

		it('should throw if invalid', async () =>
			expectToThrow(() => parseCSVFromString('value\nnotdate\n', table)));
	});

	describe('OneOf column', () => {
		const table = Table({
			value: Column.OneOf(['a', 1]),
		});

		it('should parse valid value', async () => {
			const res = parseCSVFromString('value\na\n1', table);
			expect(res).toEqual([{ value: 'a' }, { value: 1 }]);
		});

		it('should throw if empty', async () =>
			expectToThrow(() => parseCSVFromString('value\n\n', table)));

		it('should throw if value is not in the definition', async () =>
			expectToThrow(() => parseCSVFromString('value\nb\n', table)));
	});

	describe('Optional column', () => {
		it('should parse empty cell as null without throwing', async () => {
			const res = parseCSVFromString(
				'str,num,bool,date\n,,,\na,0,false,1996-11-13',
				Table({
					str: Column.Optional(Column.String()),
					num: Column.Optional(Column.Number()),
					bool: Column.Optional(Column.Boolean()),
					date: Column.Optional(Column.Date()),
				}),
			);
			expect(res).toEqual([
				{
					str: null,
					num: null,
					bool: null,
					date: null,
				},
				{
					str: 'a',
					num: 0,
					bool: false,
					date: new Date('1996-11-13'),
				},
			]);
		});
	});

	describe('options', () => {
		it('should trim value before parsing by default', async () => {
			const input = 'value\n  hi  ';

			const res = parseCSVFromString(
				input,
				Table({
					value: Column.String(),
				}),
			);
			expect(res).toEqual([{ value: 'hi' }]);
		});

		it('should not trim if option is set to false', async () => {
			const input = 'value\n  hi  ';

			const res = parseCSVFromString(
				input,
				Table({
					value: Column.String(),
				}),
				{ trim: false },
			);
			expect(res).toEqual([{ value: '  hi  ' }]);
		});
	});
});
