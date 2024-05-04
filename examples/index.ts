import { Column, Spreadsheet, Table, type RowType } from 'sheethuahua';

const assembliesTable = Table('assemblies', {
	name: Column.OneOf(['สภาผู้แทนราษฎร', 'วุฒิสภา', 'คณะรัฐมนตรี']),
	term: Column.Number(),
	startedAt: Column.Date(),
	endedAt: Column.OptionalDate(),
	origin: Column.OptionalString(),
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
