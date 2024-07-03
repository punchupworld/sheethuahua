import { describe, expect, it } from 'bun:test';
import { Column, Table, parseCSVFromString } from '../../src';
import { expectToThrow } from '../matchers';

describe('parseCSVFromString', () => {
	describe('Headers', () => {
		const table = Table({
			a: Column.String(),
			b: Column.String(),
		});

		it('should throw error if columns are missing', () =>
			expectToThrow(() => parseCSVFromString('unknown_column', table)));
	});

	describe('String column', () => {
		const table = Table({
			value: Column.String(),
		});

		it('should parse valid value', async () => {
			const res = await parseCSVFromString('value\na\n"with\nnewlint"', table);
			expect(res).toEqual([{ value: 'a' }, { value: 'with\nnewlint' }]);
		});

		it('should throw if empty', () =>
			expectToThrow(() => parseCSVFromString('value\n\n', table)));
	});

	describe('Number column', () => {
		const table = Table({
			value: Column.Number(),
		});

		it('should parse valid value', async () => {
			const res = await parseCSVFromString('value\n100\n-5\n4.2', table);
			expect(res).toEqual([{ value: 100 }, { value: -5 }, { value: 4.2 }]);
		});

		it('should throw if empty', () =>
			expectToThrow(() => parseCSVFromString('value\n\n', table)));

		it('should throw if invalid', () =>
			expectToThrow(() => parseCSVFromString('value\na\n', table)));
	});

	describe('Boolean column', () => {
		const table = Table({
			value: Column.Boolean(),
		});

		it('should parse valid value', async () => {
			const res = await parseCSVFromString(
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

		it('should throw if empty', () =>
			expectToThrow(() => parseCSVFromString('value\n\n', table)));

		it('should throw if invalid', () =>
			expectToThrow(() => parseCSVFromString('value\na\n', table)));
	});

	describe('Date column', () => {
		const table = Table({
			value: Column.Date(),
		});

		it('should parse valid value (ISO format)', async () => {
			const res = await parseCSVFromString('value\n1996-11-13', table);
			expect(res).toEqual([{ value: new Date('1996-11-13') }]);
		});

		it('should throw if empty', () =>
			expectToThrow(() => parseCSVFromString('value\n\n', table)));

		it('should throw if invalid', () =>
			expectToThrow(() => parseCSVFromString('value\nnotdate\n', table)));
	});

	describe('OneOf column', () => {
		const table = Table({
			value: Column.OneOf(['a', 1]),
		});

		it('should parse valid value', async () => {
			const res = await parseCSVFromString('value\na\n1', table);
			expect(res).toEqual([{ value: 'a' }, { value: 1 }]);
		});

		it('should throw if empty', () =>
			expectToThrow(() => parseCSVFromString('value\n\n', table)));

		it('should throw if value is not in the definition', () =>
			expectToThrow(() => parseCSVFromString('value\nb\n', table)));
	});

	describe('OptionalString column', () => {
		const table = Table({
			value: Column.OptionalString(),
		});

		it('should parse valid value', async () => {
			const res = await parseCSVFromString('value\na\n"with\nnewlint"', table);
			expect(res).toEqual([{ value: 'a' }, { value: 'with\nnewlint' }]);
		});

		it('should parse as null if empty', async () => {
			const res = await parseCSVFromString('value\n\n', table);
			expect(res).toEqual([{ value: null }]);
		});
	});

	describe('OptionalNumber column', () => {
		const table = Table({
			value: Column.OptionalNumber(),
		});

		it('should parse valid value', async () => {
			const res = await parseCSVFromString('value\n100\n-5\n4.2', table);
			expect(res).toEqual([{ value: 100 }, { value: -5 }, { value: 4.2 }]);
		});

		it('should parse as null if empty', async () => {
			const res = await parseCSVFromString('value\n\n', table);
			expect(res).toEqual([{ value: null }]);
		});

		it('should throw if invalid', () =>
			expectToThrow(() => parseCSVFromString('value\na\n', table)));
	});

	describe('OptionalBoolean column', () => {
		const table = Table({
			value: Column.OptionalBoolean(),
		});

		it('should parse valid value', async () => {
			const res = await parseCSVFromString(
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

		it('should parse as null if empty', async () => {
			const res = await parseCSVFromString('value\n\n', table);
			expect(res).toEqual([{ value: null }]);
		});

		it('should throw if invalid', () =>
			expectToThrow(() => parseCSVFromString('value\na\n', table)));
	});

	describe('OptionalDate column', () => {
		const table = Table({
			value: Column.OptionalDate(),
		});

		it('should parse valid value (ISO format)', async () => {
			const res = await parseCSVFromString('value\n1996-11-13', table);
			expect(res).toEqual([{ value: new Date('1996-11-13') }]);
		});

		it('should parse as null if empty', async () => {
			const res = await parseCSVFromString('value\n\n', table);
			expect(res).toEqual([{ value: null }]);
		});

		it('should throw if invalid', () =>
			expectToThrow(() => parseCSVFromString('value\nnotdate\n', table)));
	});

	describe('OptionalOneOf column', () => {
		const table = Table({
			value: Column.OptionalOneOf(['a', 1]),
		});

		it('should parse valid value', async () => {
			const res = await parseCSVFromString('value\na\n1', table);
			expect(res).toEqual([{ value: 'a' }, { value: 1 }]);
		});

		it('should parse as null if empty', async () => {
			const res = await parseCSVFromString('value\n\n', table);
			expect(res).toEqual([{ value: null }]);
		});

		it('should throw if value is not in the definition', () =>
			expectToThrow(() => parseCSVFromString('value\nb\n', table)));
	});

	describe('options', () => {
		const table = Table({
			value: Column.String(),
		});

		it('should trim value before parsing by default', async () => {
			const res = await parseCSVFromString('value\n  hi  ', table);
			expect(res).toEqual([{ value: 'hi' }]);
		});

		it('should not trim if option is set to false', async () => {
			const res = await parseCSVFromString('value\n  hi  ', table, {
				trim: false,
			});
			expect(res).toEqual([{ value: '  hi  ' }]);
		});

		it('should not include unknown columns by default', async () => {
			const res = await parseCSVFromString('value,unknown\na,b', table);
			expect(res).toEqual([{ value: 'a' }]);
		});

		it('should include unknown columns if set to false', async () => {
			const res = await parseCSVFromString('value,unknown\na,b', table, {
				includeUnknownColumns: true,
			});
			// @ts-expect-error expects mismatch table schema
			expect(res).toEqual([{ value: 'a', unknown: 'b' }]);
		});
	});
});
