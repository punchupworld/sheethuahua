import { Object, Tuple } from '@sinclair/typebox';
import { describe, expect, it } from 'bun:test';
import { asNumber, asString, Column, formatToCsv } from '../../src';

describe('Schema', () => {
	it('should parsed column to csv string', () => {
		const schema = Column('ID', asNumber());

		const output = formatToCsv([1, 2], schema);

		expect(output).toBe('ID\n1\n2');
	});

	it('should parsed object to csv string', () => {
		const schema = Object({
			id: Column('ID', asNumber()),
			name: Column('Name', asString()),
		});

		const output = formatToCsv(
			[
				{ id: 1, name: 'a' },
				{ id: 2, name: 'b,c' },
			],
			schema,
		);

		expect(output).toBe('ID,Name\n1,a\n2,"b,c"');
	});

	it('should parsed tuple to csv string', () => {
		const schema = Tuple([
			Column('ID', asNumber()),
			Column('Name', asString()),
		]);

		const output = formatToCsv(
			[
				[1, 'a'],
				[2, 'b,c'],
			],
			schema,
		);

		expect(output).toBe('ID,Name\n1,a\n2,"b,c"');
	});
});

describe('Column', () => {
	it('should throw if column is required but missing', () => {
		const schema = Object({
			id: Column('ID', asNumber()),
		});

		expect(() =>
			formatToCsv(
				[
					{ id: 1 },
					// @ts-expect-error missing key
					{},
				],
				schema,
			),
		).toThrow('Expected number for column "ID" but received undefined');
	});

	it('should get empty string if optional column is missing', () => {
		const schema = Column('ID', asNumber().optional());

		const output = formatToCsv([1, undefined, 3], schema);

		expect(output).toBe('ID\n1\n\n3');
	});
});
