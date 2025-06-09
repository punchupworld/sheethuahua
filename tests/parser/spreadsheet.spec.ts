import { beforeEach, describe, expect, it } from 'bun:test';
import { Column, Object, Spreadsheet, asString } from '../../src';
import { mockConsoleDebug, mockFetch } from '../setup';

const tableName = 'Users';
const sheetsId = 'some-sheets-id';
describe('.get', () => {
	it('should fetch with given sheetsId', async () => {
		const sheets = Spreadsheet(sheetsId);

		mockFetch.mockResolvedValue(new Response('value\na'));

		await sheets.get(tableName, Column('value', asString()));

		const requestedURL = mockFetch.mock.lastCall?.[0];

		expect(requestedURL).toInclude(sheetsId);
	});

	it('should include sheet from given table name and csv export type from fetch query', async () => {
		const sheets = Spreadsheet(sheetsId);

		mockFetch.mockResolvedValue(new Response('value\na'));

		await sheets.get(tableName, Column('value', asString()));

		const queryParams = new URLSearchParams(
			mockFetch.mock.lastCall?.[0].split('?')[1],
		);

		expect(queryParams.get('sheet')).toBe(tableName);
		expect(queryParams.get('tqx')).toBe('out:csv');
	});

	it('should add headers with value 1 by default', async () => {
		const sheets = Spreadsheet(sheetsId);

		mockFetch.mockResolvedValue(new Response('value\na'));

		await sheets.get(tableName, Column('value', asString()));

		const queryParams = new URLSearchParams(
			mockFetch.mock.lastCall?.[0].split('?')[1],
		);

		expect(queryParams.get('headers')).toBe('1');
	});

	it('should include range and overwrite headers in fetch query if specified', async () => {
		const range = 'A1:ZZZ999';
		const headers = 2;

		const sheets = Spreadsheet(sheetsId, {
			range,
			headers,
		});

		mockFetch.mockResolvedValue(new Response('id,value\n0,a'));

		await sheets.get(tableName, Object({}));

		const queryParams = new URLSearchParams(
			mockFetch.mock.lastCall?.[0].split('?')[1],
		);

		expect(queryParams.length).toBe(4);
		expect(queryParams.get('sheet')).toBe(tableName);
		expect(queryParams.get('tqx')).toBe('out:csv');
	});

	it('should overwrite global options with get options if given', async () => {
		const range = 'A1:ZZZ999';
		const headers = 2;

		const sheets = Spreadsheet(sheetsId, {
			range: 'A:B',
			headers: 1,
		});

		mockFetch.mockResolvedValue(new Response('id,value\n0,a'));

		await sheets.get(tableName, Object({}), { range, headers });

		const queryParams = new URLSearchParams(
			mockFetch.mock.lastCall?.[0].split('?')[1],
		);

		expect(queryParams.length).toBe(4);
		expect(queryParams.get('sheet')).toBe(tableName);
		expect(queryParams.get('tqx')).toBe('out:csv');
	});
});

describe('Options', () => {
	const sheets = Spreadsheet(sheetsId);
	const schema = Column('value', asString());

	beforeEach(() => {
		mockFetch.mockResolvedValue(new Response('value\na'));
	});

	it('should not call console.debug when debug is not enabled', async () => {
		await sheets.get(tableName, schema);

		expect(mockConsoleDebug).toHaveBeenCalledTimes(0);
	});

	it('should call console.debug when debug is enabled', async () => {
		await sheets.get(tableName, schema, { debug: true });

		expect(mockConsoleDebug).not.toHaveBeenCalledTimes(0);
	});
});
