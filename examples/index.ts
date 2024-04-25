import { Spreadsheet, Table, Column } from '../src';

const userTable = Table('users', {
	id: Column.Number(),
	value: Column.String(),
});

const itemTable = Table('items', {
	id: Column.Number(),
	name: Column.String(),
});

const sheet = Spreadsheet('1SbX2kgAGsslbhGuB-EI_YdSAnIt3reU1_OEtWmDVOVk', [
	userTable,
	itemTable,
]);

const users = sheet.get('users');
const items = sheet.get('items');
