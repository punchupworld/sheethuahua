import { describe, expect, it } from 'bun:test';
import { Column, fetchCsv, t } from '../src';
import { mockFetch } from './setup';

describe('fetchCsv', () => {
	const csvUrl = '/somefile.csv';

	const tableSchema = Column('value', t.String());

	it('should call fetch with given url', async () => {
		mockFetch.mockResolvedValue(new Response('value\na'));

		await fetchCsv(csvUrl, tableSchema);

		const requestedURL = mockFetch.mock.lastCall?.[0];

		expect(requestedURL).toBe(csvUrl);
	});

	it('should return parsed csv', async () => {
		mockFetch.mockResolvedValue(new Response('value\na'));

		const res = await fetchCsv(csvUrl, tableSchema);

		expect(res).toEqual(['a']);
	});
});
