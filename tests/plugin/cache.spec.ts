import { beforeEach, describe, expect, it } from 'bun:test';
import { asNumber, asString, Column, Spreadsheet, withCache } from '../../src';
import { mockConsoleDebug, mockFetch } from '../setup';

describe('.get', () => {
	const cache = new Map();
	const sheets = withCache(Spreadsheet('some-sheets-id'), cache);

	const tableName = 'Users';
	const columnSchema = Column('value', asString());

	beforeEach(() => {
		mockFetch.mockImplementation(async () => new Response('value\na'));
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

		expect(cache.size).toBe(1);
		expect([...cache.values()][0]).toEqual(value);
	});

	it('should retrieve the data from cache if the request table name is available', async () => {
		await sheets.get(tableName, columnSchema);
		cache.set([...cache.keys()][0], ['b']);
		mockFetch.mockClear();

		const value = await sheets.get(tableName, columnSchema);

		expect(mockFetch).not.toHaveBeenCalled();
		expect(value).toEqual(['b']);
	});

	it('should refetch if range or header option are changed', async () => {
		await sheets.get(tableName, columnSchema);
		mockFetch.mockClear();

		const value = await sheets.get(tableName, columnSchema, {
			range: '2',
			headers: 2,
		});

		expect(mockFetch).toHaveBeenCalled();
		expect(value).toEqual(['a']);
	});

	it('should refetch if the schema is changed', async () => {
		mockFetch.mockImplementation(async () => new Response('value\n1'));
		await sheets.get(tableName, columnSchema);
		mockFetch.mockClear();

		const value = await sheets.get(tableName, Column('value', asNumber()));

		expect(mockFetch).toHaveBeenCalled();
		expect(value).toEqual([1]);
	});

	it('should not share cache entries between different spreadsheets', async () => {
		await sheets.get(tableName, columnSchema);
		mockFetch.mockClear();

		const otherSheets = withCache(Spreadsheet('other-sheets-id'), cache);
		await otherSheets.get(tableName, columnSchema);

		expect(mockFetch).toHaveBeenCalled();
		expect(cache.size).toBe(2);
	});

	it('should include global options in the cache key', async () => {
		await sheets.get(tableName, columnSchema);
		mockFetch.mockClear();

		const rangedSheets = withCache(
			Spreadsheet('some-sheets-id', { range: 'A:B' }),
			cache,
		);
		await rangedSheets.get(tableName, columnSchema);

		expect(mockFetch).toHaveBeenCalled();
		expect(cache.size).toBe(2);
	});

	it('should throw if the cache setter fails', async () => {
		const failingSheets = withCache(Spreadsheet('some-sheets-id'), {
			get: () => undefined,
			set: () => Promise.reject(new Error('Cache is down')),
		});

		expect(failingSheets.get(tableName, columnSchema)).rejects.toThrow(
			'Cache is down',
		);
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
