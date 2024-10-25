import { describe, expect, it } from 'bun:test';
import { Column, parseCsv, t } from '../src';
import { expectToThrow } from './matchers';

describe('parseCsv', () => {
	describe('Headers', () => {
		const schema = t.Object({
			a: Column('a', t.String()),
			b: Column('b', t.String()),
		});

		it('should throw error if columns are missing', () =>
			expectToThrow(() => parseCsv('unknown_column\na', schema)));
	});

	describe('Column', () => {
		it('should trim each cell before parsing', async () => {
			const schema = t.Object({
				value: Column('value', t.String()),
			});

			const res = parseCsv('value\n a ', schema);
			expect(res).toEqual([{ value: 'a' }]);
		});

		describe('String', () => {
			const schema = t.Object({
				value: Column('value', t.String()),
			});

			it('should parse valid value', async () => {
				const res = parseCsv('value\na\n"with\nnewlint"', schema);
				expect(res).toEqual([{ value: 'a' }, { value: 'with\nnewlint' }]);
			});

			it('should throw if empty', () =>
				expectToThrow(() => parseCsv('value\n\n', schema)));
		});

		describe('Number', () => {
			const schema = t.Object({
				value: Column('value', t.Number()),
			});

			it('should parse valid value', async () => {
				const res = parseCsv('value\n100\n-5\n4.2', schema);
				expect(res).toEqual([{ value: 100 }, { value: -5 }, { value: 4.2 }]);
			});

			it('should throw if empty', () =>
				expectToThrow(() => parseCsv('value\n\n', schema)));

			it('should throw if invalid', () =>
				expectToThrow(() => parseCsv('value\na\n', schema)));
		});

		describe('Boolean', () => {
			const schema = t.Object({
				value: Column('value', t.Boolean()),
			});

			it('should parse valid value', async () => {
				const res = parseCsv(
					'value\ntrue\nTRUE\nTrue\n1\nfalse\nFALSE\nFalse\n0',
					schema,
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
				expectToThrow(() => parseCsv('value\n\n', schema)));

			it('should throw if invalid', () =>
				expectToThrow(() => parseCsv('value\na\n', schema)));
		});

		describe('Date', () => {
			const schema = t.Object({
				value: Column('value', t.Date()),
			});

			it('should parse valid value (ISO format)', async () => {
				const res = parseCsv('value\n1996-11-13', schema);
				expect(res).toEqual([{ value: new Date('1996-11-13') }]);
			});

			it('should throw if empty', () =>
				expectToThrow(() => parseCsv('value\n\n', schema)));

			it('should throw if invalid', () =>
				expectToThrow(() => parseCsv('value\nnotdate\n', schema)));
		});

		describe('OneOf', () => {
			const schema = t.Object({
				value: Column('value', t.OneOf(['a', 1])),
			});

			it('should parse valid value', async () => {
				const res = parseCsv('value\na\n1', schema);
				expect(res).toEqual([{ value: 'a' }, { value: 1 }]);
			});

			it('should throw if empty', () =>
				expectToThrow(() => parseCsv('value\n\n', schema)));

			it('should throw if value is not in the definition', () =>
				expectToThrow(() => parseCsv('value\nb\n', schema)));
		});

		describe('Optional', () => {
			const schema = t.Object({
				a: Column('a', t.Number()),
				b: Column('b', t.Optional(t.Number())),
			});

			it('should not include optional column key if empty', async () => {
				const res = parseCsv('a,b\n1,1\n2,', schema);
				expect(res).toEqual([{ a: 1, b: 1 }, { a: 2 }]);
			});
		});
	});
});
