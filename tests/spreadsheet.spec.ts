import { describe, expect, it } from 'bun:test';
import { Spreadsheet, Table } from '../src';
import { mockFetch } from './setup';

describe('Spreadsheet.get', () => {
	it('should fetch with given sheetsId and table name', async () => {
		const tableName = 'Users';
		const sheetsId = 'some-sheets-id';

		const sheets = Spreadsheet(sheetsId, [Table(tableName, {})]);

		mockFetch.mockResolvedValue(new Response('id,value\n0,a'));

		await sheets.get(tableName);

		const requestedURL = mockFetch.mock.lastCall?.[0];

		expect(requestedURL).toInclude(sheetsId);
		expect(requestedURL).toInclude(tableName);
	});
});
