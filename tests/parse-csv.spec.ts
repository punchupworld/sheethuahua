import { describe, expect, it } from 'bun:test';
import { Column, parseCsv, t } from '../src';
import { expectToThrow } from './matchers';

describe('Headers', () => {
	const schema = t.Object({
		a: Column('a', t.String()),
		b: Column('b', t.String()),
	});

	it('should throw error if columns are missing', () =>
		expectToThrow(
			() => parseCsv('unknown_column\na', schema),
			'Column "a" is referenced in the schema but does not found',
		));
});

describe('Column', () => {
	it('should trim each cell before parsing', async () => {
		const schema = Column('value', t.String());

		const res = parseCsv('value\n a ', schema);
		expect(res).toEqual(['a']);
	});

	describe('String', () => {
		const schema = Column('value', t.String());

		it('should parse valid value', async () => {
			const res = parseCsv('value\na\n"with\nnewlint"', schema);
			expect(res).toEqual(['a', 'with\nnewlint']);
		});

		it('should throw if empty', () =>
			expectToThrow(
				() => parseCsv('value\n\n', schema),
				'Column "value" cannot be empty (row 1)',
			));
	});

	describe('Number', () => {
		const schema = Column('value', t.Number());

		it('should parse valid value', async () => {
			const res = parseCsv('value\n100\n-5\n4.2', schema);
			expect(res).toEqual([100, -5, 4.2]);
		});

		it('should throw if empty', () =>
			expectToThrow(
				() => parseCsv('value\n\n', schema),
				'Column "value" cannot be empty (row 1)',
			));

		it('should throw if invalid', () =>
			expectToThrow(
				() => parseCsv('value\na\n', schema),
				'Unexpected value in the column "value", "a" is not a number (row 1)',
			));
	});

	describe('Boolean', () => {
		const schema = Column('value', t.Boolean());

		it('should parse valid value', async () => {
			const res = parseCsv(
				'value\ntrue\nTRUE\nTrue\n1\nfalse\nFALSE\nFalse\n0',
				schema,
			);
			expect(res).toEqual([true, true, true, true, false, false, false, false]);
		});

		it('should throw if empty', () =>
			expectToThrow(
				() => parseCsv('value\n\n', schema),
				'Column "value" cannot be empty (row 1)',
			));

		it('should throw if invalid', () =>
			expectToThrow(
				() => parseCsv('value\na\n', schema),
				'Unexpected value in the column "value", "a" is not a boolean (row 1)',
			));
	});

	describe('Date', () => {
		const schema = Column('value', t.Date());

		it('should parse valid value (ISO format)', async () => {
			const res = parseCsv('value\n1996-11-13', schema);
			expect(res).toEqual([new Date('1996-11-13')]);
		});

		it('should throw if empty', () =>
			expectToThrow(
				() => parseCsv('value\n\n', schema),
				'Column "value" cannot be empty (row 1)',
			));

		it('should throw if invalid', () =>
			expectToThrow(
				() => parseCsv('value\nnotdate\n', schema),
				'Unexpected value in the column "value", "notdate" is not a date (row 1)',
			));
	});

	describe('OneOf', () => {
		const schema = Column('value', t.OneOf(['a', 1]));

		it('should parse valid value', async () => {
			const res = parseCsv('value\na\n1', schema);
			expect(res).toEqual(['a', 1]);
		});

		it('should throw if empty', () =>
			expectToThrow(
				() => parseCsv('value\n\n', schema),
				'Column "value" cannot be empty (row 1)',
			));

		it('should throw if value is not in the definition', () =>
			expectToThrow(
				() => parseCsv('value\na\nb', schema),
				'Unexpected value in the column "value", "b" is not a union (row 2)',
			));
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

describe('Schema', () => {
	it('should support single root column', () => {
		const schema = Column('value', t.String());

		const res = parseCsv('value\n a ', schema);
		expect(res).toEqual(['a']);
	});

	it('should support object schema', () => {
		const schema = t.Object({
			email: Column('email', t.String()),
			phone: Column('phone', t.Number()),
		});

		const res = parseCsv('email,phone\ntest@email,1234', schema);
		expect(res).toEqual([{ email: 'test@email', phone: 1234 }]);
	});

	it('should support object schema', () => {
		const schema = t.Object({
			email: Column('email', t.String()),
			phone: Column('phone', t.Number()),
		});

		const res = parseCsv('email,phone\ntest@email,1234', schema);
		expect(res).toEqual([{ email: 'test@email', phone: 1234 }]);
	});

	it('should support tuple schema', () => {
		const schema = t.Tuple([
			Column('email', t.String()),
			Column('phone', t.Number()),
		]);

		const res = parseCsv('email,phone\ntest@email,1234', schema);
		expect(res).toEqual([['test@email', 1234]]);
	});

	it('should support nested schema', () => {
		const schema = t.Object({
			contact: t.Object({
				email: Column('email', t.String()),
				phone: t.Tuple([
					Column('phone1', t.Number()),
					Column('phone2', t.Number()),
				]),
			}),
		});

		const res = parseCsv('email,phone1,phone2\ntest@email,1234,5678', schema);
		expect(res).toEqual([
			{ contact: { email: 'test@email', phone: [1234, 5678] } },
		]);
	});
});
