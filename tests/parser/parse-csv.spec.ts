import { describe, expect, it } from 'bun:test';
import { Column, Object, Tuple, asNumber, asString, parseCsv } from '../../src';

describe('Headers', () => {
	const schema = Object({
		a: Column('a', asString()),
		b: Column('b', asString()),
	});

	it('should throw error if column is missing', () =>
		expect(() => parseCsv('unknown_column\na', schema)).toThrow(
			'Column "a" is not found',
		));
});

describe('Schema', () => {
	it('should support single root column', () => {
		const schema = Column('value', asString());

		const res = parseCsv('value\n a ', schema);
		expect(res).toStrictEqual(['a']);
	});

	it('should support object schema', () => {
		const schema = Object({
			email: Column('email', asString()),
			phone: Column('phone', asNumber()),
		});

		const res = parseCsv('email,phone\ntest@email,1234', schema);
		expect(res).toStrictEqual([{ email: 'test@email', phone: 1234 }]);
	});

	it('should support tuple schema', () => {
		const schema = Tuple([
			Column('email', asString()),
			Column('phone', asNumber()),
		]);

		const res = parseCsv('email,phone\ntest@email,1234', schema);
		expect(res).toStrictEqual([['test@email', 1234]]);
	});

	it('should support nested schema', () => {
		const schema = Object({
			contact: Object({
				email: Column('email', asString()),
				phone: Tuple([
					Column('phone1', asNumber()),
					Column('phone2', asNumber()),
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
		const schema = Column('value', asString());

		const res = parseCsv('value\n a ', schema);
		expect(res).toStrictEqual(['a']);
	});

	it.only('should throw if empty', () => {
		const schema = Column('value', asString());

		expect(() => parseCsv('value\n\n', schema)).toThrow(
			'Column "value" cannot be empty (row 1)',
		);
	});

	it('should not include object optional column key if empty', () => {
		const schema = Object({
			a: Column('a', asNumber()),
			b: Column('b', asNumber().optional()),
		});

		const res = parseCsv('a,b\n1,1\n2,', schema);
		expect(res).toStrictEqual([{ a: 1, b: 1 }, { a: 2 }]);
	});
});