import { describe, expect, it } from 'bun:test';
import { Column, fetchCsv, t } from '../../src';
import { mockFetch } from '../setup';

describe('fetchCsv', () => {
	const csvUrl = '/somefile.csv';

	const tableSchema = t.Object({
		id: Column(t.Number()),
		value: Column(t.String()),
	});

	it('should call fetch with given url', async () => {
		mockFetch.mockResolvedValue(new Response('id,value\n0,a'));

		await fetchCsv(csvUrl, tableSchema);

		const requestedURL = mockFetch.mock.lastCall?.[0];

		expect(requestedURL).toBe(csvUrl);
	});

	it('should return parsed csv', async () => {
		mockFetch.mockResolvedValue(new Response('id,value\n0,a'));

		const res = await fetchCsv(csvUrl, tableSchema);

		expect(res).toEqual([{ id: 0, value: 'a' }]);
	});
});
