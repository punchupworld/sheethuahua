import { describe, expect, it } from 'bun:test';
import { Column, parseCSVFromUrl, t } from '../../src';
import { mockFetch } from '../setup';

describe('parseCSVFromUrl', () => {
	const csvUrl = '/somefile.csv';

	const tableSchema = t.Object({
		id: Column(t.Number()),
		value: Column(t.String()),
	});

	it('should call fetch with given url', async () => {
		mockFetch.mockResolvedValue(new Response('id,value\n0,a'));

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
