import { beforeEach, describe, expect, it } from 'bun:test';
import { asString, Column, Spreadsheet, withCache } from '../../src';
import { mockConsoleDebug, mockFetch } from '../setup';

describe('.get', () => {
	const cache = new Map();
	const sheets = withCache(Spreadsheet('some-sheets-id'), cache);

	const tableName = 'Users';
	const columnSchema = Column('value', asString());

	function getCacheKey(sheet: string, range?: string, headers?: string) {
		return [sheet, range, headers].join('|');
	}

	beforeEach(() => {
		mockFetch.mockResolvedValue(new Response('value\na'));
		cache.clear();
	});

	it('should fetch from the given table name if the cache is not available', async () => {
		const value = await sheets.get(tableName, columnSchema);

		const requestedURL = mockFetch.mock.lastCall?.[0];

		expect(requestedURL).toInclude(tableName);
		expect(value).toEqual(['a']);
	});

	it('should save parsed output value to the cache', async () => {
		const value = await sheets.get(tableName, columnSchema);

		expect(cache.get(getCacheKey(tableName))).toEqual(value);
	});

	it('should retrieve the data from cache if the request table name is available', async () => {
		cache.set(getCacheKey(tableName), ['b']);
		const value = await sheets.get(tableName, columnSchema);

		expect(mockFetch).not.toHaveBeenCalled();
		expect(value).toEqual(['b']);
	});

	it('should refetch if range or header option are changed', async () => {
		cache.set(getCacheKey(tableName), ['b']);

		const value = await sheets.get(tableName, columnSchema, {
			range: '2',
			headers: 2,
		});

		expect(mockFetch).toHaveBeenCalled();
		expect(value).toEqual(['a']);
	});

	it('should not call console.debug when debug is not enabled', async () => {
		await sheets.get(tableName, columnSchema);

		expect(mockConsoleDebug).toHaveBeenCalledTimes(0);
	});

	it('should call console.debug when debug is enabled', async () => {
		await withCache(Spreadsheet('some-sheets-id'), cache, { debug: true }).get(
			tableName,
			columnSchema,
		);

		expect(mockConsoleDebug).not.toHaveBeenCalledTimes(0);
	});
});
