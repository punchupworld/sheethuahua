import { describe, expect, it } from 'bun:test';
import { Column, as, parseCsv, t } from '../src';
import { expectToThrow } from './matchers';

describe('Headers', () => {
	const schema = t.Object({
		a: Column('a', as.String()),
		b: Column('b', as.String()),
	});

	it('should throw error if columns are missing', () =>
		expectToThrow(
			() => parseCsv('unknown_column\na', schema),
			'Column "a" is not found',
		));
});

describe('Column', () => {
	it('should trim each cell before parsing', async () => {
		const schema = Column('value', as.String());

		const res = parseCsv('value\n a ', schema);
		expect(res).toStrictEqual(['a']);
	});

	describe('String', () => {
		const schema = Column('value', as.String());

		it('should parse valid value', async () => {
			const res = parseCsv('value\na\n"with\nnewlint"', schema);
			expect(res).toStrictEqual(['a', 'with\nnewlint']);
		});

		it('should throw if empty', () =>
			expectToThrow(
				() => parseCsv('value\n\n', schema),
				'Column "value" cannot be empty (row 1)',
			));
	});

	describe('Number', () => {
		const schema = Column('value', as.Number());

		it('should parse valid value', async () => {
			const res = parseCsv('value\n100\n-5\n4.2', schema);
			expect(res).toStrictEqual([100, -5, 4.2]);
		});

		it('should throw if empty', () =>
			expectToThrow(
				() => parseCsv('value\n\n', schema),
				'Column "value" cannot be empty (row 1)',
			));

		it('should throw if invalid', () =>
			expectToThrow(
				() => parseCsv('value\na\n', schema),
				'Expected number but received "a" (column "value", row 1)',
			));
	});

	describe('Boolean', () => {
		const schema = Column('value', as.Boolean());

		it('should parse valid value', async () => {
			const res = parseCsv(
				'value\ntrue\nTRUE\nTrue\n1\nfalse\nFALSE\nFalse\n0',
				schema,
			);
			expect(res).toStrictEqual([
				true,
				true,
				true,
				true,
				false,
				false,
				false,
				false,
			]);
		});

		it('should throw if empty', () =>
			expectToThrow(
				() => parseCsv('value\n\n', schema),
				'Column "value" cannot be empty (row 1)',
			));

		it('should throw if invalid', () =>
			expectToThrow(
				() => parseCsv('value\na\n', schema),
				'Expected boolean but received "a" (column "value", row 1)',
			));
	});

	describe('Date', () => {
		const schema = Column('value', as.Date());

		it('should parse valid value (ISO format)', async () => {
			const res = parseCsv('value\n1996-11-13', schema);
			expect(res).toStrictEqual([new Date('1996-11-13')]);
		});

		it('should throw if empty', () =>
			expectToThrow(
				() => parseCsv('value\n\n', schema),
				'Column "value" cannot be empty (row 1)',
			));

		it('should throw if invalid', () =>
			expectToThrow(
				() => parseCsv('value\na\n', schema),
				'Expected Date but received "a" (column "value", row 1)',
			));
	});

	describe('OneOf', () => {
		const schema = Column('value', as.OneOf(['a', 1]));

		it('should parse valid value', async () => {
			const res = parseCsv('value\na\n1', schema);
			expect(res).toStrictEqual(['a', 1]);
		});

		it('should throw if empty', () =>
			expectToThrow(
				() => parseCsv('value\n\n', schema),
				'Column "value" cannot be empty (row 1)',
			));

		it('should throw if value is not in the definition', () =>
			expectToThrow(
				() => parseCsv('value\na\nb', schema),
				'Expected one of [a, 1] but received "b" (column "value", row 2)',
			));
	});

	describe('Optional', () => {
		const schema = t.Object({
			a: Column('a', as.Number()),
			b: t.Optional(Column('b', as.Number())),
		});

		it('should not include object optional column key if empty', async () => {
			const res = parseCsv('a,b\n1,1\n2,', schema);
			expect(res).toEqual([{ a: 1, b: 1 }, { a: 2 }]);
		});
	});
});

describe('Schema', () => {
	it('should support single root column', () => {
		const schema = Column('value', as.String());

		const res = parseCsv('value\n a ', schema);
		expect(res).toStrictEqual(['a']);
	});

	it('should support object schema', () => {
		const schema = t.Object({
			email: Column('email', as.String()),
			phone: Column('phone', as.Number()),
		});

		const res = parseCsv('email,phone\ntest@email,1234', schema);
		expect(res).toStrictEqual([{ email: 'test@email', phone: 1234 }]);
	});

	it('should support object schema', () => {
		const schema = t.Object({
			email: Column('email', as.String()),
			phone: Column('phone', as.Number()),
		});

		const res = parseCsv('email,phone\ntest@email,1234', schema);
		expect(res).toStrictEqual([{ email: 'test@email', phone: 1234 }]);
	});

	it('should support tuple schema', () => {
		const schema = t.Tuple([
			Column('email', as.String()),
			Column('phone', as.Number()),
		]);

		const res = parseCsv('email,phone\ntest@email,1234', schema);
		expect(res).toStrictEqual([['test@email', 1234]]);
	});

	it('should support nested schema', () => {
		const schema = t.Object({
			contact: t.Object({
				email: Column('email', as.String()),
				phone: t.Tuple([
					Column('phone1', as.Number()),
					Column('phone2', as.Number()),
				]),
			}),
		});

		const res = parseCsv('email,phone1,phone2\ntest@email,1234,5678', schema);
		expect(res).toStrictEqual([
			{ contact: { email: 'test@email', phone: [1234, 5678] } },
		]);
	});
});
