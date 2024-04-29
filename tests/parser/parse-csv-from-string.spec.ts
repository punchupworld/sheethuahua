import { describe, expect, it } from 'bun:test';
import { Column, Table, parseCSVFromString } from '../../src';

describe('parser > parseCSVFromString', () => {
	it('should correctly parse string', async () => {
		const input = 'value\na\n"with\nnewlint"';

		const res = await parseCSVFromString(
			input,
			Table({
				value: Column.String(),
			}),
		);

		expect(res).toEqual([{ value: 'a' }, { value: 'with\nnewlint' }]);
	});

	it('should correctly parse number', async () => {
		const input = 'value\n100\n-5\n4.2';

		const res = await parseCSVFromString(
			input,
			Table({
				value: Column.Number(),
			}),
		);

		expect(res).toEqual([{ value: 100 }, { value: -5 }, { value: 4.2 }]);
	});

	it('should correctly parse boolean', async () => {
		const input = 'value\ntrue\nTRUE\nTrue\n1\nfalse\nFALSE\nFalse\n0';

		const res = await parseCSVFromString(
			input,
			Table({
				value: Column.Boolean(),
			}),
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

	it('should correctly parse date', async () => {
		const input = 'value\n1996-11-13';

		const res = await parseCSVFromString(
			input,
			Table({
				value: Column.Date(),
			}),
		);
		expect(res).toEqual([{ value: new Date('1996-11-13') }]);
	});
});
