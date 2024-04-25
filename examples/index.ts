import { Type } from '@sinclair/typebox';
import { Spreadsheet, Table } from '../src';

const userTable = Table('users', {
	id: Type.Number(),
	value: Type.String(),
});

const itemTable = Table('items', {
	id: Type.Number(),
	name: Type.String(),
});

const sheet = Spreadsheet('1SbX2kgAGsslbhGuB-EI_YdSAnIt3reU1_OEtWmDVOVk', [
	userTable,
	itemTable,
]);

const users = sheet.get('users');
const items = sheet.get('items');
