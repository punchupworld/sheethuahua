import { Column, Table, Spreadsheet } from '../src';

const assembliesTable = Table('assemblies', {
	name: Column.String(),
	term: Column.Number(),
	startedAt: Column.Date(),
	endedAt: Column.Nullable(Column.Date()),
	origin: Column.Nullable(Column.String()),
});

const sheet = Spreadsheet('1SbX2kgAGsslbhGuB-EI_YdSAnIt3reU1_OEtWmDVOVk', [
	assembliesTable,
]);

try {
	const assemblies = await sheet.get('assemblies');
	console.log(assemblies);
} catch (e) {
	console.error(e);
}
