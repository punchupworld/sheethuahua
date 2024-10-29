import { describe, expect, it } from 'bun:test';
import { Column, as, parseCsv, t } from '../src';

describe('Headers', () => {
	const schema = t.Object({
		a: Column('a', as.String()),
		b: Column('b', as.String()),
	});

	it('should throw error if column is missing', () =>
		expect(() => parseCsv('unknown_column\na', schema)).toThrow(
			'Column "a" is not found',
		));
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

describe('Column', () => {
	it('should trim each cell before parsing', () => {
		const schema = Column('value', as.String());

		const res = parseCsv('value\n a ', schema);
		expect(res).toStrictEqual(['a']);
	});

	it('should throw if empty', () => {
		const schema = Column('value', as.String());

		expect(() => parseCsv('value\n\n', schema)).toThrow(
			'Column "value" cannot be empty (row 1)',
		);
	});

	it('should not include object optional column key if empty', () => {
		const schema = t.Object({
			a: Column('a', as.Number()),
			b: t.Optional(Column('b', as.Number())),
		});

		const res = parseCsv('a,b\n1,1\n2,', schema);
		expect(res).toEqual([{ a: 1, b: 1 }, { a: 2 }]);
	});
});
