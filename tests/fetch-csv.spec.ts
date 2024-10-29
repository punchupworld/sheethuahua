import { expect, it } from 'bun:test';
import { Column, asString, fetchCsv } from '../src';
import { mockFetch } from './setup';

const csvUrl = '/somefile.csv';

const tableSchema = Column('value', asString());

it('should call fetch with given url', async () => {
	mockFetch.mockResolvedValue(new Response('value\na'));

	await fetchCsv(csvUrl, tableSchema);

	const requestedURL = mockFetch.mock.lastCall?.[0];

	expect(requestedURL).toBe(csvUrl);
});

it('should return parsed csv', async () => {
	mockFetch.mockResolvedValue(new Response('value\na'));

	const res = await fetchCsv(csvUrl, tableSchema);

	expect(res).toStrictEqual(['a']);
});
