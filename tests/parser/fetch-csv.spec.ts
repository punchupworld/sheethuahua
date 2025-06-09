import { beforeEach, expect, it } from 'bun:test';
import { Column, asString, fetchCsv } from '../../src';
import { mockConsoleDebug, mockFetch } from '../setup';

const csvUrl = '/somefile.csv';

const tableSchema = Column('value', asString());

beforeEach(() => {
	mockFetch.mockResolvedValue(new Response('value\na'));
});

it('should call fetch with given url', async () => {
	await fetchCsv(csvUrl, tableSchema);

	expect(mockFetch).toHaveBeenLastCalledWith(csvUrl, undefined);
});

it('should return parsed csv', async () => {
	const res = await fetchCsv(csvUrl, tableSchema);

	expect(res).toStrictEqual(['a']);
});
it('should not call console.debug when debug is not enabled', async () => {
	await fetchCsv(csvUrl, tableSchema);

	expect(mockConsoleDebug).toHaveBeenCalledTimes(0);
});

it('should call console.debug when debug is enabled', async () => {
	await fetchCsv(csvUrl, tableSchema, { debug: true });

	expect(mockConsoleDebug).not.toHaveBeenCalledTimes(0);
});
