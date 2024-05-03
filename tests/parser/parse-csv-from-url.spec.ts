import { describe, expect, it } from 'bun:test';
import { Column, Table, parseCSVFromUrl } from '../../src';
import { mockFetch } from '../setup';

describe('parseCSVFromUrl', () => {
	const csvUrl = '/somefile.csv';

	const tableSchema = Table({
		id: Column.Number(),
		value: Column.String(),
	});

	it('should call fetch with given url', async () => {
		mockFetch.mockResolvedValue(new Response());

		await parseCSVFromUrl(csvUrl, tableSchema);

		const requestedURL = mockFetch.mock.lastCall?.[0];

		expect(requestedURL).toBe(csvUrl);
	});

	it('should return parsed csv', async () => {
		mockFetch.mockResolvedValue(new Response('id,value\n0,a'));

		const res = await parseCSVFromUrl(csvUrl, tableSchema);

		expect(res).toEqual([{ id: 0, value: 'a' }]);
	});
});
