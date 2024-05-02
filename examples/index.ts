import { Column, Spreadsheet, Table, type RowType } from '../src';

const assembliesTable = Table('assemblies', {
	name: Column.String(),
	term: Column.Number(),
	startedAt: Column.Date(),
	endedAt: Column.Optional(Column.Date()),
	origin: Column.Optional(Column.String()),
	options: Column.OneOf(['a', 'b', 'c']),
});

type Assembly = RowType<typeof assembliesTable>;

const sheets = Spreadsheet('1SbX2kgAGsslbhGuB-EI_YdSAnIt3reU1_OEtWmDVOVk', [
	assembliesTable,
]);

try {
	const assemblies = await sheets.get('assemblies');
	console.log(assemblies);
} catch (e) {
	console.error(e);
}
