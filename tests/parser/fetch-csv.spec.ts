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

it('should wrap parse errors with URL context and cause chain', async () => {
	mockFetch.mockResolvedValue(new Response('wrong_header\nb'));

	try {
		await fetchCsv(csvUrl, tableSchema);
		throw new Error('should have thrown');
	} catch (e) {
		expect(e).toBeInstanceOf(Error);
		expect((e as Error).message).toInclude(
			`Failed to parse CSV from ${csvUrl}`,
		);
		expect((e as Error).message).toInclude('Column "value" is not found');
		expect((e as Error).cause).toBeInstanceOf(Error);
		expect(((e as Error).cause as Error).message).toBe(
			'Column "value" is not found',
		);
	}
});

it('should wrap HTTP errors', async () => {
	mockFetch.mockResolvedValue(
		new Response('Not Found', { status: 404, statusText: 'Not Found' }),
	);

	try {
		await fetchCsv(csvUrl, tableSchema);
		throw new Error('should have thrown');
	} catch (e) {
		expect(e).toBeInstanceOf(Error);
		expect((e as Error).message).toInclude('Failed to fetch');
		expect((e as Error).message).toInclude(csvUrl);
	}
});
it('should not call console.debug when debug is not enabled', async () => {
	await fetchCsv(csvUrl, tableSchema);

	expect(mockConsoleDebug).toHaveBeenCalledTimes(0);
});

it('should call console.debug when debug is enabled', async () => {
	await fetchCsv(csvUrl, tableSchema, { debug: true });

	expect(mockConsoleDebug).not.toHaveBeenCalledTimes(0);
});
